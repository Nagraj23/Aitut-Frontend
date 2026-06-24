import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, StatusBar, Dimensions,
    FlatList, ActivityIndicator, Clipboard, ToastAndroid , Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

import { AI_URL } from '../Constants/Api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const makeId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/* ---------------- CRASH-PROOF TEXT PARSER ---------------- */
const renderSafeText = (text) => {
    if (!text || typeof text !== 'string') return <Text></Text>;

    let cleanText = text
        .replace(/\. /g, '.\n\n')
        .replace(/- /g, '\n• ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    const lines = cleanText.split('\n');

    return lines.map((line, lineIdx) => {
        if (line.startsWith('#')) {
            const headingText = line.replace(/^#+\s*/, '');
            return (
                <Text key={`h-${lineIdx}`} style={styles.mdHeading}>
                    {headingText}{'\n'}
                </Text>
            );
        }

        const isBullet = line.startsWith('•');
        const parts = line.split(/\*\*(\s*)/);
        const textElements = [];

        let isBold = false;
        parts.forEach((part, partIdx) => {
            if (part === '') {
                isBold = !isBold;
                return;
            }
            textElements.push(
                <Text key={`p-${partIdx}`} style={isBold ? styles.mdBold : styles.mdNormal}>
                    {part}
                </Text>
            );
            isBold = !isBold;
        });

        return (
            <Text key={`line-${lineIdx}`} style={isBullet ? styles.bulletLine : styles.standardLine}>
                {textElements}{'\n'}
            </Text>
        );
    });
};

/* ---------------- CHAT MESSAGE ROW COMPONENT ---------------- */
const MessageBubble = React.memo(({ item }) => {
    if (!item) return null;
    const isUser = item.role === 'user';

    let textContent = "";
    if (item.text !== undefined && item.text !== null) {
        textContent = typeof item.text === 'string' ? item.text : String(item.text);
    }

    const isWarning = textContent.includes("⚠️ **Note:");
    const [isSpeaking, setIsSpeaking] = useState(false);

    const copyToClipboard = () => {
        if (!textContent) return;
        Clipboard.setString(textContent);
        if (Platform.OS === 'android') ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    };

    const handleSpeech = async () => {
        if (!textContent) return;
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            const cleanText = textContent.replace(/[*#_]/g, '');
            Speech.speak(cleanText, {
                onDone: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        }
    };

    return (
        <View style={[styles.msgRow, isUser ? styles.userRow : styles.botRow]}>
            {!isUser && (
                <View style={styles.botIconContainer}>
                    <View style={styles.botIconShadow}>
                        <Ionicons name="sparkles" size={16} color="#4F46E5" />
                    </View>
                </View>
            )}
            <View style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.botBubble,
                isWarning && styles.warningBubble
            ]}>
                {isUser ? (
                    <Text style={styles.userText}>{textContent || ""}</Text>
                ) : (
                    <View style={{ width: '100%' }}>
                        {textContent && textContent !== "✨ Thinking..." ? (
                            <Text style={styles.botTextContainer}>
                                {renderSafeText(textContent)}
                            </Text>
                        ) : (
                            <View style={styles.thinkingContainer}>
                                <ActivityIndicator size="small" color="#4F46E5" style={{ marginRight: 8 }} />
                                <Text style={styles.thinkingText}>AI Tutor is thinking...</Text>
                            </View>
                        )}

                        {textContent !== "✨ Thinking..." && textContent !== "" && (
                            <View style={styles.bubbleFooter}>
                                <TouchableOpacity onPress={handleSpeech} style={styles.footerIcon}>
                                    <Ionicons
                                        name={isSpeaking ? "stop-circle-outline" : "volume-medium-outline"}
                                        size={15}
                                        color={isSpeaking ? "#EF4444" : "#4F46E5"}
                                    />
                                    <Text style={[styles.footerText, isSpeaking && {color: "#EF4444"}]}>
                                        {isSpeaking ? "Stop" : "Listen"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={copyToClipboard} style={[styles.footerIcon, {marginLeft: 16}]}>
                                    <Ionicons name="copy-outline" size={14} color="#64748B" />
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

/* ---------------- MAIN SCREEN COMPONENT ---------------- */
const TeachScreen = ({ navigation, route }) => {
    const { userData } = useContext(AuthContext);

    const step = route.params?.step || {};
    const routeSubject = route.params?.subject;

    const resolvedSubject = routeSubject && typeof routeSubject === 'object' ? (routeSubject.name || routeSubject.title) : routeSubject;
    const subject = resolvedSubject ? String(resolvedSubject) : "Database Management";

    const day = step?.day ? String(step.day) : "1";
    const topic = step?.topic ? String(step.topic) : "Introduction";
    const task = step?.task ? String(step.task) : "";

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [justLoadedMore, setJustLoadedMore] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        return () => Speech.stop();
    }, []);

    const handleFinishSession = async () => {
        try {
            if (!userData?.id) return;

            const response = await fetch(
                `${AI_URL}/session/wrapup_by_context/${userData.id}/${encodeURIComponent(subject)}/${day}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();
            console.log("SESSION WRAPUP:", data);

            Alert.alert(
                "Session Completed 🎉",
                "Today's learning session has been wrapped up successfully.",
                [
                    {
                        text: "Done",
                        onPress: () => navigation.goBack()
                    }
                ]
            );

        } catch (error) {
            console.log("WRAPUP ERROR:", error);
            Alert.alert("Error", "Failed to complete session.");
        }
    };

    useEffect(() => {
        const prepareSession = async () => {
            if (!userData || !userData.id) {
                setIsHistoryLoading(false);
                return;
            }
            setIsHistoryLoading(true);
            try {
                const safeSubject = subject.trim();
                const histUrl = `${AI_URL}/history/${userData.id}/${encodeURIComponent(safeSubject)}/${day}?page=1&limit=5`;

                const res = await fetch(histUrl);
                const data = await res.json();

                if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
                    const clearedHistory = data.messages.filter(m => m !== null && m !== undefined);
                    setMessages(clearedHistory);
                    setHasStarted(true);

                    if (data.messages.length < 5 || data.has_more === false) {
                        setHasMoreHistory(false);
                    }
                } else {
                    const firstMsg = { id: `init_${makeId()}`, role: "user", text: `Hi! Let's start Day ${day}: ${topic}` };
                    setMessages([firstMsg]);
                    setHasStarted(false);
                    setHasMoreHistory(false);
                }
            } catch (err) {
                console.log("❌ History Retrieval Exception: ", err);
            } finally {
                setIsHistoryLoading(false);
            }
        };
        prepareSession();
    }, [day, subject, userData]);

    useEffect(() => {
        if (!isHistoryLoading && userData?.id && messages.length === 1 && messages[0]?.id?.startsWith("init_") && !hasStarted) {
            setHasStarted(true);
            handleTeachService(messages[0].text);
        }
    }, [isHistoryLoading, userData, messages, hasStarted]);

    const handleLoadMoreHistory = async () => {
        if (isLoadMoreLoading || !hasMoreHistory || !userData?.id || loading) return;

        setIsLoadMoreLoading(true);
        setJustLoadedMore(true);
        const nextPage = currentPage + 1;

        try {
            const safeSubject = subject.trim();
            const histUrl = `${AI_URL}/history/${userData.id}/${encodeURIComponent(safeSubject)}/${day}?page=${nextPage}&limit=5`;
            console.log(`📡 Fetching older messages from page: ${nextPage}`);

            const res = await fetch(histUrl);
            const data = await res.json();

            if (data && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
                const clearedNewHistory = data.messages.filter(m => m !== null && m !== undefined);

                setMessages(prev => {
                    return [
                        ...clearedNewHistory.map((msg, index) => ({
                            ...msg,
                            id: msg.id || `old_${nextPage}_${index}_${Date.now()}`
                        })),
                        ...prev
                    ];
                });

                setCurrentPage(nextPage);
                if (data.messages.length < 5 || data.has_more === false) {
                    setHasMoreHistory(false);
                }
            } else {
                setHasMoreHistory(false);
            }
        } catch (err) {
            console.log("❌ [LOADMORE ERROR]:", err);
        } finally {
            setIsLoadMoreLoading(false);
            setTimeout(() => setJustLoadedMore(false), 300);
        }
    };

    const handleTeachService = async (msgText) => {
        if (!userData || !userData.id || loading) return;
        setLoading(true);

        const aiMsgId = `ai_${makeId()}`;
        setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", text: "✨ Thinking..." }]);

        const targetUniv = userData?.university ? String(userData.university) : "solapur";
        const targetDept = userData?.department ? String(userData.department) : "cse";
        const targetYear = userData?.year ? String(userData.year) : "1";
        const targetSub = subject ? String(subject) : "subject";

        const university = targetUniv.toLowerCase().trim().replace(/\s+/g, '-');
        const dept = targetDept.toLowerCase().trim().replace(/\s+/g, '-');
        const formattedSub = targetSub.toLowerCase().trim().replace(/\s+/g, '-');

        const url = `${AI_URL}/ask/${university}/${dept}/${targetYear}/${formattedSub}/${day}`;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");

        let lastIndex = 0;
        let accumulatedText = "";

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 3 || xhr.readyState === 4) {
                const chunk = xhr.responseText.substring(lastIndex);
                lastIndex = xhr.responseText.length;

                const lines = chunk.split("\n");
                lines.forEach(line => {
                    if (line.startsWith("data:")) {
                        const token = line.replace("data:", "");
                        if (token !== undefined && token !== null) {
                            accumulatedText += token;
                        }
                    } else if (!line.startsWith("data:") && line.trim() !== "" && lines.length === 1) {
                        accumulatedText += line;
                    }
                });

                if (accumulatedText.length > 0) {
                    setMessages(prev => prev.map(m =>
                        m.id === aiMsgId ? { ...m, text: accumulatedText } : m
                    ));
                }
            }
            if (xhr.readyState === 4) {
                setLoading(false);
            }
        };

        xhr.onerror = (err) => {
            console.log("❌ XHR Connection Failure:", err);
            setLoading(false);
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, text: "❌ Connection error. Please verify server status." } : m
            ));
        };

        xhr.send(JSON.stringify({
            user_id: String(userData?.id || ""),
            message: String(msgText || ""),
            topic: String(topic || ""),
            task: String(task || "")
        }));
    };

    const onSend = () => {
        if (!inputText.trim() || loading) return;
        const userMsg = inputText.trim();
        setMessages(prev => [...prev, { id: makeId(), role: "user", text: userMsg }]);
        handleTeachService(userMsg);
        setInputText('');
    };

    const renderListHeader = () => {
        if (!hasMoreHistory) return null;

        return (
            <View style={styles.headerButtonWrapper}>
                {isLoadMoreLoading ? (
                    <ActivityIndicator size="small" color="#4F46E5" style={{ paddingVertical: 6 }} />
                ) : (
                    <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMoreHistory}>
                        <Ionicons name="refresh-outline" size={14} color="#4F46E5" style={{ marginRight: 6 }} />
                        <Text style={styles.loadMoreButtonText}>Load Older Messages</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (isHistoryLoading) return (
        <View style={styles.loader}><ActivityIndicator size="large" color="#4F46E5" /></View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#1E1B4B" barStyle="light-content" />

            {/* Dark Premium Studio-Style Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{topic}</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{subject} • DAY {day}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleFinishSession}
                    style={styles.finishBtn}
                    activeOpacity={0.8}
                >
                    <Text style={styles.finishText}>Finish</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={styles.chatArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <FlatList
                    ref={scrollRef}
                    data={messages}
                    keyExtractor={(item, index) => {
                        const baseId = item?.id || `msg-${index}`;
                        const roleToken = item?.role || 'bot';
                        return `${roleToken}_${baseId}_index-${index}`;
                    }}
                    renderItem={({ item }) => <MessageBubble item={item} />}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderListHeader}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        if (!justLoadedMore && !isLoadMoreLoading) {
                            scrollRef.current?.scrollToEnd({ animated: true });
                        }
                    }}
                    onLayout={() => {
                        if (!justLoadedMore && !isLoadMoreLoading) {
                            scrollRef.current?.scrollToEnd({ animated: false });
                        }
                    }}
                />

                {/* Clean Bottom Input Dock */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ask a doubt or reply..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={onSend}
                            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                            disabled={loading || !inputText.trim()}
                        >
                            {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="arrow-up" size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

/* --- ENHANCED APP STYLING --- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1E1B4B' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#1E1B4B' },
    backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTextContainer: { flex: 1, marginLeft: 14 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '800' },
    headerSub: { color: '#93C5FD', fontSize: 11, fontWeight: '600', marginTop: 2, letterSpacing: 0.2 },
    finishBtn: { backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 12, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    finishText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    chatArea: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
    listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
    msgRow: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    botIconContainer: { marginRight: 10, marginBottom: 4 },
    botIconShadow: { width: 32, height: 36, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, borderWidth: 1, borderColor: '#EDF2F7' },
    bubble: { maxWidth: width * 0.76, padding: 14, borderRadius: 20 },
    userBubble: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 1 },
    botBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
    warningBubble: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1.5 },
    userText: { color: '#FFF', fontSize: 15, fontWeight: '500', lineHeight: 21 },
    bubbleFooter: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    footerIcon: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
    footerText: { color: '#64748B', fontSize: 12, marginLeft: 4, fontWeight: '600' },
    inputWrapper: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EDF2F7' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 2 },
    textInput: { flex: 1, fontSize: 15, maxHeight: 90, paddingVertical: 10, color: '#1E293B', fontWeight: '500' },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    sendBtnDisabled: { backgroundColor: '#E2E8F0' },

    botTextContainer: { width: '100%' },
    thinkingContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    thinkingText: { color: '#64748B', fontStyle: 'italic', fontSize: 14, fontWeight: '500' },
    mdNormal: { fontSize: 15, color: '#1E293B', lineHeight: 23 },
    mdBold: { fontSize: 15, color: '#312E81', fontWeight: '800', lineHeight: 23 },
    mdHeading: { fontSize: 17, color: '#0F172A', fontWeight: '800', marginTop: 8, marginBottom: 6, letterSpacing: -0.2 },
    standardLine: { marginVertical: 3 },
    bulletLine: { marginVertical: 3, paddingLeft: 6 },

    headerButtonWrapper: { width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 16 },
    loadMoreButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 },
    loadMoreButtonText: { color: '#4F46E5', fontSize: 12, fontWeight: '700' }
});

export default TeachScreen;