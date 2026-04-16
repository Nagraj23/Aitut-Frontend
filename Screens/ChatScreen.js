import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AI_URL } from '../Constants/Api';

const TAB_BAR_HEIGHT = 60; // accounts for bottom tab bar

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            id: '0',
            role: 'assistant',
            text: "Hi! 👋 I'm your AI-Tut mentor. Ask me anything about your subject!",
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        const trimmed = inputText.trim();
        if (!trimmed || loading) return;

        const history = messages
            .filter(m => m.id !== '0')
            .map(m => ({ role: m.role, content: m.text }));

        const userMsg = { id: Date.now().toString(), role: 'user', text: trimmed };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            const details = await AsyncStorage.getItem('userDetails');
            const user = details ? JSON.parse(details) : {};

            const response = await axios.post(`${AI_URL}/api/chat`, {
                question: trimmed,
                university: user.university || "general",
                branch: user.branch || "cse",
                year: user.year || 1,
                subject: user.subject || "general",
                history: history,
            });

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.data.answer,
            }]);

        } catch (error) {
            console.error("Chat error:", error?.response?.data || error.message);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "Sorry, I couldn't connect to the server. Please try again. 🔌",
            }]);
        } finally {
            setLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.botBubble
            ]}>
                {!isUser && (
                    <View style={styles.botAvatar}>
                        <Text style={styles.botAvatarText}>🎓</Text>
                    </View>
                )}
                <View style={[
                    styles.bubbleContent,
                    isUser ? styles.userContent : styles.botContent
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.botText
                    ]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => (
        <View style={styles.typingBubble}>
            <View style={styles.botAvatar}>
                <Text style={styles.botAvatarText}>🎓</Text>
            </View>
            <View style={styles.typingDots}>
                <ActivityIndicator size="small" color="#9788FB" />
                <Text style={styles.typingText}>  AI-Tut is thinking...</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

                {/* Header stays OUTSIDE KeyboardAvoidingView so it never moves */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.headerAvatar}>
                            <Text style={{ fontSize: 20 }}>🎓</Text>
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>AI-Tut Mentor</Text>
                            <Text style={styles.headerSub}>Always here to help</Text>
                        </View>
                    </View>
                    <View style={styles.onlinePill}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                </View>

                {/* KAV wraps ONLY messages + input, not the header */}
                <KeyboardAvoidingView
                    style={styles.kavContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    keyboardVerticalOffset={
                        Platform.OS === 'ios' ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT
                    }
                >
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={item => item.id}
                        renderItem={renderMessage}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        keyboardShouldPersistTaps="handled"
                        ListFooterComponent={loading ? renderTypingIndicator : null}
                        style={styles.flatList}
                    />

                    {/* Input bar — pushed up by KAV, tab bar stays below */}
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask your doubt..."
                            placeholderTextColor="#aaa"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            blurOnSubmit={false}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendBtn,
                                (!inputText.trim() || loading) && styles.sendBtnDisabled
                            ]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || loading}
                        >
                            <Text style={styles.sendIcon}>➤</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#9788FB',
    },
    kavContainer: {
        flex: 1,
        backgroundColor: '#F8F9FE',
    },

    // ✅ Header is OUTSIDE KAV — never moves when keyboard opens
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#9788FB',
        paddingHorizontal: 20,
        paddingVertical: 14,
        elevation: 6,
        shadowColor: '#9788FB',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 1 },
    onlinePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
        marginRight: 5,
    },
    onlineText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

    // Messages
    flatList: { flex: 1 },
    messageList: { padding: 16, paddingBottom: 12 },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: 14,
        alignItems: 'flex-end',
    },
    userBubble: { justifyContent: 'flex-end' },
    botBubble: { justifyContent: 'flex-start' },
    botAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#EDE9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    botAvatarText: { fontSize: 16 },
    bubbleContent: {
        maxWidth: '78%',
        padding: 13,
        borderRadius: 20,
    },
    userContent: {
        backgroundColor: '#9788FB',
        borderBottomRightRadius: 4,
        elevation: 2,
        shadowColor: '#9788FB',
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    botContent: {
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFF' },
    botText: { color: '#1E293B' },

    // Typing indicator
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        elevation: 2,
    },
    typingText: {
        color: '#9788FB',
        fontSize: 13,
        fontStyle: 'italic',
    },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFF',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: -2 },
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 10,
        maxHeight: 120,
        marginRight: 10,
    },
    sendBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#9788FB',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#9788FB',
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    sendBtnDisabled: { backgroundColor: '#CBD5E1', elevation: 0 },
    sendIcon: { color: '#FFF', fontSize: 18 },
});

export default ChatScreen;