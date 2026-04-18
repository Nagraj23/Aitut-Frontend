import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform,
    ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { AI_URL } from '../Constants/Api';

const TeachScreen = ({ navigation, route }) => {
    const { day, topic, subject, task } = route.params || {
        day: 1, topic: "Arrays & Sorting", subject: "DSA",
        task: "Learn Bubble Sort. Solve 5 problems."
    };

    const [messages, setMessages] = useState([
        {
            id: '0', role: 'assistant',
            text: `📚 Today's Topic: **${topic}**\n\n🎯 Your Task: ${task}\n\nI'll teach you everything about this topic. Ask me anything or type "Start" to begin!`,
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    const sendMessage = async (overrideText) => {
        const trimmed = (overrideText || inputText).trim();
        if (!trimmed || loading) return;

        const history = messages
            .filter(m => m.id !== '0')
            .map(m => ({ role: m.role, content: m.text }));

        const userMsg = { id: Date.now().toString(), role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const response = await axios.post(`${AI_URL}/api/chat`, {
                question: trimmed,
                subject: subject,
                history: history.slice(-4), // last 4 messages only
                // Tell Gemini the teaching context
                university: "general",
                branch: "cse",
                year: 1,
            });

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.data.answer,
            }]);
        } catch {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "Connection issue. Please try again. 🔌",
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
        }
    };

    const quickPrompts = [
        `Teach me ${topic}`,
        "Give me an example",
        "Quiz me on this",
        "Summarize key points",
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{topic}</Text>
                    <Text style={styles.headerSub}>Day {day} · {subject}</Text>
                </View>
                <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>AI</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.kav}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={60}
            >
                {/* Messages */}
                <ScrollView
                    ref={scrollRef}
                    style={styles.messageArea}
                    contentContainerStyle={styles.messageContent}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map(item => {
                        const isUser = item.role === 'user';
                        return (
                            <View key={item.id} style={[
                                styles.bubble,
                                isUser ? styles.userBubble : styles.botBubble
                            ]}>
                                {!isUser && (
                                    <View style={styles.avatar}>
                                        <Text>🎓</Text>
                                    </View>
                                )}
                                <View style={[
                                    styles.bubbleContent,
                                    isUser ? styles.userContent : styles.botContent
                                ]}>
                                    <Text style={[
                                        styles.bubbleText,
                                        isUser ? styles.userText : styles.botText
                                    ]}>
                                        {item.text}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    {loading && (
                        <View style={styles.typingRow}>
                            <View style={styles.avatar}><Text>🎓</Text></View>
                            <View style={styles.typingBox}>
                                <ActivityIndicator size="small" color="#9788FB" />
                                <Text style={styles.typingText}> Teaching...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Quick prompt chips */}
                {messages.length <= 1 && (
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {quickPrompts.map((p, i) => (
                            <TouchableOpacity
                                key={i} style={styles.chip}
                                onPress={() => sendMessage(p)}
                            >
                                <Text style={styles.chipText}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Input */}
                <View style={styles.inputBar}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask about this topic..."
                        placeholderTextColor="#aaa"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline maxLength={400}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendDisabled]}
                        onPress={() => sendMessage()}
                        disabled={!inputText.trim() || loading}
                    >
                        <Text style={styles.sendIcon}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#9788FB' },
    kav: { flex: 1, backgroundColor: '#F8F9FE' },

    header: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#9788FB',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 20 },
    headerCenter: { flex: 1, marginLeft: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    aiBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    aiBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    messageArea: { flex: 1 },
    messageContent: { padding: 16, paddingBottom: 8 },

    bubble: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    avatar: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#EDE9FF',
        justifyContent: 'center', alignItems: 'center', marginRight: 8,
    },
    bubbleContent: { maxWidth: '78%', padding: 13, borderRadius: 18 },
    userContent: { backgroundColor: '#9788FB', borderBottomRightRadius: 4 },
    botContent: {
        backgroundColor: '#FFF', borderBottomLeftRadius: 4,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    },
    bubbleText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFF' },
    botText: { color: '#1E293B' },

    typingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    typingBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 18, borderBottomLeftRadius: 4, elevation: 2,
    },
    typingText: { color: '#9788FB', fontSize: 13, fontStyle: 'italic' },

    chipsRow: { maxHeight: 50, marginBottom: 8 },
    chip: {
        backgroundColor: '#EDE9FF', paddingHorizontal: 14,
        paddingVertical: 8, borderRadius: 20, marginRight: 8,
    },
    chipText: { color: '#9788FB', fontSize: 13, fontWeight: '600' },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end',
        backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10,
        borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 8,
    },
    input: {
        flex: 1, fontSize: 15, color: '#1E293B',
        backgroundColor: '#F1F5F9', borderRadius: 24,
        paddingHorizontal: 18, paddingVertical: 10,
        maxHeight: 120, marginRight: 10,
    },
    sendBtn: {
        width: 46, height: 46, borderRadius: 23,
        backgroundColor: '#9788FB', justifyContent: 'center', alignItems: 'center',
        elevation: 3,
    },
    sendDisabled: { backgroundColor: '#CBD5E1', elevation: 0 },
    sendIcon: { color: '#FFF', fontSize: 18 },
});

export default TeachScreen;