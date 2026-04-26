import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, StatusBar, Dimensions,
    FlatList, ActivityIndicator, Clipboard, ToastAndroid, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import * as Speech from 'expo-speech'; // For the Speak button

import { AI_URL } from '../Constants/Api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const makeId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/* ---------------- MESSAGE UI ---------------- */
const MessageBubble = React.memo(({ item }) => {
    const isUser = item.role === 'user';
    const isWarning = item.text.includes("⚠️ **Note:");
    const [isSpeaking, setIsSpeaking] = useState(false);

    const copyToClipboard = () => {
        Clipboard.setString(item.text);
        if (Platform.OS === 'android') ToastAndroid.show("Copied!", ToastAndroid.SHORT);
    };

    const handleSpeech = async () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            // Clean markdown for cleaner speech
            const cleanText = item.text.replace(/[*#_]/g, '');
            Speech.speak(cleanText, {
                onDone: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        }
    };

    const cleanAIText = (text) => {
        if (!text) return "";

        return text
            // Remove extra spaces between letters (DB MS → DBMS)
            .replace(/\b([A-Za-z])\s+([A-Za-z])\b/g, '$1$2')

            // Fix broken words like "Rel ational"
            .replace(/(\w)\s+(\w)/g, (match, a, b) => {
                // only merge if both are small fragments
                if (a.length === 1 || b.length === 1) {
                    return a + b;
                }
                return match;
            })

            // Fix punctuation spacing
            .replace(/\s+([.,!?])/g, '$1')

            // Fix ( e .g . ) → (e.g.)
            .replace(/\(\s*/g, '(')
            .replace(/\s*\)/g, ')')
            .replace(/\s*\.\s*/g, '.')

            // Normalize spaces
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    const formatAIResponse = (text) => {
        if (!text) return "";

        return text
            // Headings
            .replace(/\*\*(.*?)\*\*/g, '**$1**')

            // Add spacing after periods
            .replace(/\. /g, '.\n\n')

            // Fix bullet points
            .replace(/- /g, '\n• ')

            // Clean multiple newlines
            .replace(/\n{3,}/g, '\n\n')

            .trim();
    };


    return (
        <View style={[styles.msgRow, isUser ? styles.userRow : styles.botRow]}>
            {!isUser && (
                <View style={styles.botIconContainer}>
                    <View style={styles.botIconShadow}>
                        <Ionicons name="school" size={18} color="#4F46E5" />
                    </View>
                </View>
            )}
            <View style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.botBubble,
                isWarning && styles.warningBubble
            ]}>
                {isUser ? (
                    <Text style={styles.userText}>{item.text}</Text>
                ) : (
                    <View>
                        {/* FIX: Explicitly passing the text into Markdown */}
                        <Markdown style={markdownStyles}>
                            {formatAIResponse(item.text)}
                        </Markdown>

                        {!item.text.includes("Thinking...") && (
                            <View style={styles.bubbleFooter}>
                                <TouchableOpacity onPress={handleSpeech} style={styles.footerIcon}>
                                    <Ionicons
                                        name={isSpeaking ? "stop-circle" : "volume-high-outline"}
                                        size={16}
                                        color={isSpeaking ? "#E11D48" : "#4F46E5"}
                                    />
                                    <Text style={[styles.footerText, isSpeaking && {color: "#E11D48"}]}>
                                        {isSpeaking ? "Stop" : "Listen"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={copyToClipboard} style={[styles.footerIcon, {marginLeft: 15}]}>
                                    <Ionicons name="copy-outline" size={14} color="#94A3B8" />
                                    <Text style={styles.footerText}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
});

/* ---------------- MAIN SCREEN (NO LOGIC CHANGES) ---------------- */
const TeachScreen = ({ navigation, route }) => {
    const { userData } = useContext(AuthContext);
    const step = route.params?.step || {};
    const subject = route.params?.subject || "Subject";
    const { day, topic, task } = step;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const scrollRef = useRef(null);

    // Stop speaking when leaving screen
    useEffect(() => {
        return () => Speech.stop();
    }, []);


    useEffect(() => {
        const prepareSession = async () => {
            if (!userData?.id) return;
            setIsHistoryLoading(true);
            try {
                const histUrl = `${AI_URL}/history/${userData.id}/${subject}/${day}`;
                const res = await fetch(histUrl);
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                    setHasStarted(true);
                } else {
                    const firstMsg = { id: `init_${makeId()}`, role: "user", text: `Hi! Let's start Day ${day}: ${topic}` };
                    setMessages([firstMsg]);
                    setHasStarted(false);
                }
            } catch (err) { console.log(err); } finally { setIsHistoryLoading(false); }
        };
        prepareSession();
    }, [day, subject, userData?.id]);

    useEffect(() => {
        if (!isHistoryLoading && userData?.id && messages.length === 1 && messages[0]?.id?.startsWith("init_") && !hasStarted) {
            setHasStarted(true);
            handleTeachService(messages[0].text);
        }
    }, [isHistoryLoading, userData?.id, messages, hasStarted]);

    const handleTeachService = async (msgText) => {
        if (!userData?.id || loading) return;
        setLoading(true);
        const aiMsgId = `ai_${makeId()}`;
        setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", text: "✨ Thinking..." }]);

        const university = (userData.university || "solapur").toLowerCase().replace(/\s+/g, '-');
        const dept = (userData.department || "cse").toLowerCase().replace(/\s+/g, '-');
        const url = `${AI_URL}/ask/${university}/${dept}/${userData.year}/${subject.toLowerCase().replace(/\s+/g, '-')}/${day}`;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");

        let lastIndex = 0;
        let accumulated = "";

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 3 || xhr.readyState === 4) {
                const newText = xhr.responseText.substring(lastIndex);
                lastIndex = xhr.responseText.length;
                newText.split("\n").forEach(line => {
                    if (line.startsWith("data:")) {
                        let token = line.replace("data:", "");
                        if (token) {
                            accumulated += token;
                            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulated.trim() } : m));
                        }
                    }
                });
            }
            if (xhr.readyState === 4) setLoading(false);
        };
        xhr.send(JSON.stringify({ user_id: String(userData.id), message: msgText, topic, task }));
    };

    const onSend = () => {
        if (!inputText.trim() || loading) return;
        setMessages(prev => [...prev, { id: makeId(), role: "user", text: inputText }]);
        handleTeachService(inputText);
        setInputText('');
    };

    if (isHistoryLoading) return (
        <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{topic}</Text>
                    <View style={styles.headerBadge}><Text style={styles.headerSub}>{subject} • DAY {day}</Text></View>
                </View>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.finishBtn}>
                    <Text style={styles.finishText}>Finish</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={styles.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    ref={scrollRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <MessageBubble item={item} />}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                />
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.textInput} placeholder="Ask a doubt..." value={inputText} onChangeText={setInputText} multiline />
                        <TouchableOpacity onPress={onSend} style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} disabled={loading}>
                            {loading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="send" size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

/* --- MARKDOWN STYLING --- */
const markdownStyles = {
    body: {
        fontSize: 15,
        color: "#1E293B",
        lineHeight: 24,
    },

    heading1: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0F172A",
        marginBottom: 10,
    },

    heading2: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 8,
    },

    strong: {
        fontWeight: "800",
        color: "#4F46E5",
    },

    em: {
        fontStyle: "italic",
        color: "#475569",
    },

    paragraph: {
        marginBottom: 12,
    },

    bullet_list: {
        marginBottom: 12,
        paddingLeft: 6,
    },

    ordered_list: {
        marginBottom: 12,
        paddingLeft: 6,
    },

    list_item: {
        marginBottom: 8,
        flexDirection: "row",
    },

    bullet_list_icon: {
        color: "#4F46E5",
        marginRight: 6,
        fontSize: 10,
    },

    code_inline: {
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontSize: 13,
    },

    code_block: {
        backgroundColor: "#0F172A",
        color: "#E2E8F0",
        padding: 12,
        borderRadius: 12,
        marginVertical: 10,
        fontSize: 13,
    },

    fence: {
        backgroundColor: "#0F172A",
        color: "#E2E8F0",
        padding: 12,
        borderRadius: 12,
        marginVertical: 10,
    },

    blockquote: {
        borderLeftWidth: 4,
        borderLeftColor: "#4F46E5",
        paddingLeft: 10,
        color: "#475569",
        marginVertical: 10,
    },
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#4F46E5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#4F46E5' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTextContainer: { flex: 1, marginLeft: 15 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    headerBadge: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 6 },
    headerSub: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    finishBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
    finishText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
    chatArea: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    listContent: { padding: 20 },
    msgRow: { marginBottom: 20, flexDirection: 'row' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    botIconShadow: { width: 36, height: 36, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },
    bubble: { maxWidth: width * 0.78, padding: 16, borderRadius: 22 },
    userBubble: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
    warningBubble: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1.5 },
    userText: { color: '#FFF', fontSize: 15, fontWeight: '500' },
    bubbleFooter: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'flex-end' },
    footerIcon: { flexDirection: 'row', alignItems: 'center' },
    footerText: { color: '#94A3B8', fontSize: 11, marginLeft: 4, fontWeight: '600' },
    inputWrapper: { padding: 16, backgroundColor: '#FFF' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 15 },
    textInput: { flex: 1, fontSize: 15, maxHeight: 100, paddingVertical: 10 },
    sendBtn: { width: 38, height: 38, borderRadius: 15, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    sendBtnDisabled: { backgroundColor: '#CBD5E1' }
});

export default TeachScreen;