// import React, { useState, useRef } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, TouchableOpacity,
//     TextInput, KeyboardAvoidingView, Platform,
//     ActivityIndicator, StatusBar
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import axios from 'axios';
// import { AI_URL } from '../Constants/Api';

// const TeachScreen = ({ navigation, route }) => {
//     const { day, topic, subject, task } = route.params || {
//         day: 1, topic: "Arrays & Sorting", subject: "DSA",
//         task: "Learn Bubble Sort. Solve 5 problems."
//     };

//     const [messages, setMessages] = useState([
//         {
//             id: '0', role: 'assistant',
//             text: `📚 Today's Topic: **${topic}**\n\n🎯 Your Task: ${task}\n\nI'll teach you everything about this topic. Ask me anything or type "Start" to begin!`,
//         }
//     ]);
//     const [inputText, setInputText] = useState('');
//     const [loading, setLoading] = useState(false);
//     const scrollRef = useRef(null);

//     const sendMessage = async (overrideText) => {
//         const trimmed = (overrideText || inputText).trim();
//         if (!trimmed || loading) return;

//         const history = messages
//             .filter(m => m.id !== '0')
//             .map(m => ({ role: m.role, content: m.text }));

//         const userMsg = { id: Date.now().toString(), role: 'user', text: trimmed };
//         setMessages(prev => [...prev, userMsg]);
//         setInputText('');
//         setLoading(true);

//         try {
//             const response = await axios.post(`${AI_URL}/api/chat`, {
//                 question: trimmed,
//                 subject: subject,
//                 history: history.slice(-4), // last 4 messages only
//                 // Tell Gemini the teaching context
//                 university: "general",
//                 branch: "cse",
//                 year: 1,
//             });

//             setMessages(prev => [...prev, {
//                 id: (Date.now() + 1).toString(),
//                 role: 'assistant',
//                 text: response.data.answer,
//             }]);
//         } catch {
//             setMessages(prev => [...prev, {
//                 id: (Date.now() + 1).toString(),
//                 role: 'assistant',
//                 text: "Connection issue. Please try again. 🔌",
//             }]);
//         } finally {
//             setLoading(false);
//             setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
//         }
//     };

//     const quickPrompts = [
//         `Teach me ${topic}`,
//         "Give me an example",
//         "Quiz me on this",
//         "Summarize key points",
//     ];

//     return (
//         <SafeAreaView style={styles.safeArea} edges={['top']}>
//             <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//                     <Text style={styles.backIcon}>←</Text>
//                 </TouchableOpacity>
//                 <View style={styles.headerCenter}>
//                     <Text style={styles.headerTitle}>{topic}</Text>
//                     <Text style={styles.headerSub}>Day {day} · {subject}</Text>
//                 </View>
//                 <View style={styles.aiBadge}>
//                     <Text style={styles.aiBadgeText}>AI</Text>
//                 </View>
//             </View>

//             <KeyboardAvoidingView
//                 style={styles.kav}
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
//                 keyboardVerticalOffset={60}
//             >
//                 {/* Messages */}
//                 <ScrollView
//                     ref={scrollRef}
//                     style={styles.messageArea}
//                     contentContainerStyle={styles.messageContent}
//                     onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
//                     keyboardShouldPersistTaps="handled"
//                 >
//                     {messages.map(item => {
//                         const isUser = item.role === 'user';
//                         return (
//                             <View key={item.id} style={[
//                                 styles.bubble,
//                                 isUser ? styles.userBubble : styles.botBubble
//                             ]}>
//                                 {!isUser && (
//                                     <View style={styles.avatar}>
//                                         <Text>🎓</Text>
//                                     </View>
//                                 )}
//                                 <View style={[
//                                     styles.bubbleContent,
//                                     isUser ? styles.userContent : styles.botContent
//                                 ]}>
//                                     <Text style={[
//                                         styles.bubbleText,
//                                         isUser ? styles.userText : styles.botText
//                                     ]}>
//                                         {item.text}
//                                     </Text>
//                                 </View>
//                             </View>
//                         );
//                     })}

//                     {loading && (
//                         <View style={styles.typingRow}>
//                             <View style={styles.avatar}><Text>🎓</Text></View>
//                             <View style={styles.typingBox}>
//                                 <ActivityIndicator size="small" color="#9788FB" />
//                                 <Text style={styles.typingText}> Teaching...</Text>
//                             </View>
//                         </View>
//                     )}
//                 </ScrollView>

//                 {/* Quick prompt chips */}
//                 {messages.length <= 1 && (
//                     <ScrollView
//                         horizontal showsHorizontalScrollIndicator={false}
//                         style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 16 }}
//                     >
//                         {quickPrompts.map((p, i) => (
//                             <TouchableOpacity
//                                 key={i} style={styles.chip}
//                                 onPress={() => sendMessage(p)}
//                             >
//                                 <Text style={styles.chipText}>{p}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>
//                 )}

//                 {/* Input */}
//                 <View style={styles.inputBar}>
//                     <TextInput
//                         style={styles.input}
//                         placeholder="Ask about this topic..."
//                         placeholderTextColor="#aaa"
//                         value={inputText}
//                         onChangeText={setInputText}
//                         multiline maxLength={400}
//                         blurOnSubmit={false}
//                     />
//                     <TouchableOpacity
//                         style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendDisabled]}
//                         onPress={() => sendMessage()}
//                         disabled={!inputText.trim() || loading}
//                     >
//                         <Text style={styles.sendIcon}>➤</Text>
//                     </TouchableOpacity>
//                 </View>
//             </KeyboardAvoidingView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     safeArea: { flex: 1, backgroundColor: '#9788FB' },
//     kav: { flex: 1, backgroundColor: '#F8F9FE' },

//     header: {
//         flexDirection: 'row', alignItems: 'center',
//         backgroundColor: '#9788FB',
//         paddingHorizontal: 16, paddingVertical: 14,
//     },
//     backBtn: {
//         width: 36, height: 36, borderRadius: 18,
//         backgroundColor: 'rgba(255,255,255,0.2)',
//         justifyContent: 'center', alignItems: 'center',
//     },
//     backIcon: { color: '#FFF', fontSize: 20 },
//     headerCenter: { flex: 1, marginLeft: 12 },
//     headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
//     headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
//     aiBadge: {
//         backgroundColor: 'rgba(255,255,255,0.25)',
//         paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
//     },
//     aiBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

//     messageArea: { flex: 1 },
//     messageContent: { padding: 16, paddingBottom: 8 },

//     bubble: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
//     userBubble: { justifyContent: 'flex-end' },
//     botBubble: { justifyContent: 'flex-start' },
//     avatar: {
//         width: 32, height: 32, borderRadius: 16,
//         backgroundColor: '#EDE9FF',
//         justifyContent: 'center', alignItems: 'center', marginRight: 8,
//     },
//     bubbleContent: { maxWidth: '78%', padding: 13, borderRadius: 18 },
//     userContent: { backgroundColor: '#9788FB', borderBottomRightRadius: 4 },
//     botContent: {
//         backgroundColor: '#FFF', borderBottomLeftRadius: 4,
//         elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
//     },
//     bubbleText: { fontSize: 15, lineHeight: 22 },
//     userText: { color: '#FFF' },
//     botText: { color: '#1E293B' },

//     typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
//     typingBox: {
//         flexDirection: 'row', alignItems: 'center',
//         backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12,
//         borderRadius: 18, borderBottomLeftRadius: 4, elevation: 2,
//     },
//     typingText: { color: '#9788FB', fontSize: 13, fontStyle: 'italic' },

//     chipsRow: { maxHeight: 50, marginBottom: 8 },
//     chip: {
//         backgroundColor: '#EDE9FF', paddingHorizontal: 14,
//         paddingVertical: 8, borderRadius: 20, marginRight: 8,
//     },
//     chipText: { color: '#9788FB', fontSize: 13, fontWeight: '600' },

//     inputBar: {
//         flexDirection: 'row', alignItems: 'flex-end',
//         backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10,
//         borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 8,
//     },
//     input: {
//         flex: 1, fontSize: 15, color: '#1E293B',
//         backgroundColor: '#F1F5F9', borderRadius: 24,
//         paddingHorizontal: 18, paddingVertical: 10,
//         maxHeight: 120, marginRight: 10,
//     },
//     sendBtn: {
//         width: 46, height: 46, borderRadius: 23,
//         backgroundColor: '#9788FB', justifyContent: 'center', alignItems: 'center',
//         elevation: 3,
//     },
//     sendDisabled: { backgroundColor: '#CBD5E1', elevation: 0 },
//     sendIcon: { color: '#FFF', fontSize: 18 },
// });

// export default TeachScreen;


import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, StatusBar, Dimensions,
    FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AI_URL } from '../Constants/Api';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const makeId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/* 🔥 FORMAT AI RESPONSE */
const formatAIResponse = (text) => {
    if (!text) return "";
    return text
        .replace(/(What|Why|How|Key Points|Answer)/gi, "🔥 **$1**")
        .replace(/([A-D]\))/g, "\n👉 **$1**")
        .replace(/\?/g, "❓")
        .replace(/\.\s/g, ".\n\n")
        .replace(/\s+/g, " ");
};

/* ---------------- MESSAGE UI ---------------- */
const MessageBubble = React.memo(({ item }) => {
    const isUser = item.role === 'user';
    return (
        <View style={[styles.msgRow, isUser ? styles.userRow : styles.botRow]}>
            {!isUser && (
                <View style={styles.botIcon}>
                    <Ionicons name="sparkles" size={16} color="#6366F1" />
                </View>
            )}
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                {!isUser ? (
                    <Markdown style={markdownStyles}>
                        {formatAIResponse(item.text)}
                    </Markdown>
                ) : (
                    <Text style={styles.userText}>{item.text}</Text>
                )}
            </View>
        </View>
    );
});

/* ---------------- MAIN SCREEN ---------------- */
const TeachScreen = ({ navigation, route }) => {
    const { userToken } = useContext(AuthContext);

    const step = route.params?.step || {};
    const { day, topic, task } = step;
    const subject = step.subject || "physics";

    const [fullUser, setFullUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    // 🔥 Track if we've successfully checked for history/started
    const [hasStarted, setHasStarted] = useState(false);

    const scrollRef = useRef(null);

    /* ---------------- 1. INIT & HISTORY CHECK ---------------- */
    useEffect(() => {
        const prepareSession = async () => {
            try {
                // Get User Details
                const detailString = await AsyncStorage.getItem('userDetails');
                let currentUser = null;
                if (detailString) {
                    currentUser = JSON.parse(detailString);
                    setFullUser(currentUser);
                }

                // FETCH HISTORY FROM BACKEND
                // Using the specific history endpoint for this user/subject/day
                const histUrl = `${AI_URL}/history/${currentUser.id}/${subject}/${day}`;
                const res = await fetch(histUrl);
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    // Preload existing chat
                    setMessages(data.messages);
                    setHasStarted(true); // Don't trigger the automatic first message
                } else {
                    // No history, prepare the "trigger" message
                    const firstMsg = {
                        id: `init_${makeId()}`,
                        role: "user",
                        text: `Hi! Let's start Day ${day}: ${topic}`
                    };
                    setMessages([firstMsg]);
                }
            } catch (err) {
                console.log("History/Init Error:", err);
            } finally {
                setReady(true);
            }
        };

        prepareSession();
    }, []);

    /* ---------------- 2. AUTO-TRIGGER FIRST MSG ---------------- */
    useEffect(() => {
        // Trigger API only if we just created the initial 'Hi' message
        if (
            ready &&
            fullUser?.id &&
            messages.length === 1 &&
            messages[0]?.id?.startsWith("init_") &&
            !hasStarted
        ) {
            setHasStarted(true);
            handleTeachService(messages[0].text);
        }
    }, [ready, fullUser, messages, hasStarted]);

    /* ---------------- 3. STREAM API (XHR) ---------------- */
    const handleTeachService = async (msgText) => {
        if (!fullUser?.id || loading) return;
        setLoading(true);

        const aiMsgId = `ai_${makeId()}`;
        // Placeholder bubble
        setMessages(prev => [...prev, { id: aiMsgId, role: "assistant", text: "✨ Thinking..." }]);

        const uni = (fullUser?.university || "solapur").toLowerCase();
        const dept = (fullUser?.branch || "cse").toLowerCase();
        const yr = parseInt(fullUser?.year) || 1;
        const sub = subject.toLowerCase();
        const dNum = parseInt(day) || 1;

        const url = `${AI_URL}/ask/${uni}/${dept}/${yr}/${sub}/${dNum}`;

        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");

        let lastIndex = 0;
        let accumulated = "";

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 3 || xhr.readyState === 4) {
                const newText = xhr.responseText.substring(lastIndex);
                lastIndex = xhr.responseText.length;

                const lines = newText.split("\n");
                lines.forEach(line => {
                    if (line.startsWith("data:")) {
                        let token = line.replace("data:", "");
                        if (token) {
                            accumulated += token;
                            setMessages(prev =>
                                prev.map(m => m.id === aiMsgId ? { ...m, text: accumulated.trim() } : m)
                            );
                        }
                    }
                });
            }
            if (xhr.readyState === 4) {
                setLoading(false);
            }
        };

        xhr.onerror = (e) => {
            console.log("XHR ERROR 💀", e);
            setLoading(false);
            setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, text: "❌ Connection Reset. Check your backend/Groq limit." } : m)
            );
        };

        xhr.send(JSON.stringify({
            user_id: String(fullUser.id),
            message: msgText,
            topic: topic,
            task: task
        }));
    };

    /* ---------------- SEND ---------------- */
    const onSend = () => {
        if (!inputText.trim() || loading) return;
        const text = inputText;
        setMessages(prev => [...prev, { id: makeId(), role: "user", text }]);
        setInputText('');
        handleTeachService(text);
    };

    if (!ready) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>{topic}</Text>
                    <Text style={styles.headerSub}>{subject.toUpperCase()} • Day {day}</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.chatArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <FlatList
                    ref={scrollRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <MessageBubble item={item} />}
                    contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                />

                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ask a doubt..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={onSend} style={styles.sendBtn} disabled={loading}>
                            {loading
                                ? <ActivityIndicator size="small" color="#FFF" />
                                : <Ionicons name="send" size={18} color="#FFF" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

/* ---------------- STYLES ---------------- */
const markdownStyles = {
    body: { fontSize: 15, color: "#1E293B", lineHeight: 22 },
    paragraph: { marginBottom: 10 },
    strong: { fontWeight: 'bold', color: '#4F46E5' }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#4F46E5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 20 },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    headerSub: { color: '#C7D2FE', fontSize: 11 },
    chatArea: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    msgRow: { marginBottom: 18, flexDirection: 'row', alignItems: 'flex-end' },
    userRow: { justifyContent: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    botIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    bubble: { maxWidth: width * 0.78, padding: 14, borderRadius: 20, flexShrink: 1 },
    userBubble: { backgroundColor: '#4F46E5', borderBottomRightRadius: 2 },
    botBubble: { backgroundColor: '#FFF', borderBottomLeftRadius: 2, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2 },
    userText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
    inputWrapper: { padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 25, paddingHorizontal: 15 },
    textInput: { flex: 1, fontSize: 15, color: '#1E293B', maxHeight: 100, paddingVertical: 8 },
    sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }
});

export default TeachScreen;