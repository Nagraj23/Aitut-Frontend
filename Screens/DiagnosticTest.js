import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Animated, StatusBar, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ASSESSMENT_URL } from '../Constants/Api';

export default function DiagnosticTest({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [dayNumber, setDayNumber] = useState(1);
    const [totalDays] = useState(3); // ← updated to 3

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => { generateTest(); }, []);

    const generateTest = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            const userDetails = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(userDetails);

            const domain = user?.targetCourse || user?.target_course || 'Computer Science';
            const university = user?.university || 'General';

            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/generate/`,
                { domain },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;

            if (data.onboarding_finished) {
                // All 3 tests done — go home, roadmap will be there
                navigation.replace('Main');
                return;
            }

            const rawQuestions = data.questions?.questions || data.questions || [];
            setTestData(data);
            setQuestions(rawQuestions);
            setDayNumber(data.day || 1);
        } catch (error) {
            console.error('Generate test error:', error.response?.data || error.message);
            Alert.alert(
                'Error',
                'Could not load today\'s test. Check your connection and make sure the Assessment server is running.',
                [{ text: 'Go Back', onPress: () => navigation.goBack() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (questionId, selectedOption) => {
        const letter = selectedOption.charAt(0);
        setAnswers(prev => ({ ...prev, [String(questionId)]: letter }));
    };

    const handleDescriptiveAnswer = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [String(questionId)]: text }));
    };

    const animateTransition = (callback) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
            callback();
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        });
    };

    const goToNext = () => {
        const currentQ = questions[currentIndex];
        if (!answers[String(currentQ.id)]) {
            Alert.alert('Answer Required', 'Please select or write an answer before moving on.');
            return;
        }
        if (currentIndex < questions.length - 1) {
            animateTransition(() => setCurrentIndex(prev => prev + 1));
        } else {
            handleSubmit();
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            animateTransition(() => setCurrentIndex(prev => prev - 1));
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('accessToken');

            const answersArray = Object.entries(answers).map(([id, answer]) => ({
                id: parseInt(id),
                answer: answer
            }));

            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/submit/`,
                { test_id: testData.test_id, answers: answersArray },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = response.data;

            // Save test count to AsyncStorage for Home screen stats
            const prevCount = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            await AsyncStorage.setItem('testsCompleted', String(prevCount + 1));

            navigation.replace('TestResult', {
                dayNumber,
                totalDays,
                onboardingFinished: result.onboarding_finished,
                totalQuestions: questions.length,
                mcqCount: questions.filter(q => q.type === 'mcq').length,
            });

        } catch (error) {
            console.error('Submit error:', error.response?.data || error.message);
            Alert.alert('Submission Failed', 'Could not submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ──
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <Text style={styles.loadingEmoji}>🧠</Text>
                    <ActivityIndicator size="large" color="#9788FB" style={{ marginVertical: 16 }} />
                    <Text style={styles.loadingTitle}>Building Day {dayNumber} Test</Text>
                    <Text style={styles.loadingSubText}>AI is crafting questions for you ✨</Text>
                </View>
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingTitle}>No questions found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isMCQ = currentQuestion.type === 'mcq';
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isAnswered = !!answers[String(currentQuestion.id)];
    const isLastQuestion = currentIndex === questions.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    Alert.alert('Exit Test?', 'Your progress will be lost.', [
                        { text: 'Stay', style: 'cancel' },
                        { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() }
                    ]);
                }} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Test {dayNumber} of {totalDays}</Text>
                </View>

                <Text style={styles.questionCounter}>
                    {currentIndex + 1} / {questions.length}
                </Text>
            </View>

            {/* ── Progress Bar ── */}
            <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            {/* ── Questions ── */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: isMCQ ? '#EEF2FF' : '#FFF7ED' }]}>
                        <Text style={[styles.typeBadgeText, { color: isMCQ ? '#9788FB' : '#F97316' }]}>
                            {isMCQ ? '⚡ Multiple Choice' : '✍️ Descriptive'}
                        </Text>
                    </View>

                    <Text style={styles.questionText}>{currentQuestion.question}</Text>

                    {/* MCQ Options */}
                    {isMCQ && currentQuestion.options?.map((option, idx) => {
                        const letter = option.charAt(0);
                        const isSelected = answers[String(currentQuestion.id)] === letter;
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.optionBtn, isSelected && styles.optionBtnSelected]}
                                onPress={() => handleSelectOption(currentQuestion.id, option)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                                    <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
                                        {letter}
                                    </Text>
                                </View>
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {option.length > 3 ? option.substring(3) : option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Descriptive */}
                    {!isMCQ && (
                        <View style={styles.descriptiveContainer}>
                            <TextInput
                                style={styles.descriptiveInput}
                                multiline
                                placeholder="Write your answer here..."
                                placeholderTextColor="#CBD5E1"
                                value={answers[String(currentQuestion.id)] || ''}
                                onChangeText={(text) => handleDescriptiveAnswer(currentQuestion.id, text)}
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>
                                {(answers[String(currentQuestion.id)] || '').length} chars
                            </Text>
                        </View>
                    )}

                </Animated.View>
            </ScrollView>

            {/* ── Nav Buttons ── */}
            <View style={styles.navRow}>
                {currentIndex > 0 && (
                    <TouchableOpacity style={styles.prevBtn} onPress={goToPrev}>
                        <Text style={styles.prevBtnText}>← Back</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.nextBtn,
                        !isAnswered && styles.nextBtnDisabled,
                        currentIndex === 0 && { flex: 1 }
                    ]}
                    onPress={goToNext}
                    disabled={submitting}
                >
                    {submitting
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.nextBtnText}>{isLastQuestion ? '✓ Submit Test' : 'Next →'}</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },

    // Loading
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE', padding: 30 },
    loadingCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 36, alignItems: 'center', width: '100%', elevation: 5 },
    loadingEmoji: { fontSize: 48 },
    loadingTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginTop: 8 },
    loadingSubText: { fontSize: 13, color: '#9788FB', marginTop: 6, textAlign: 'center' },
    backBtn: { marginTop: 20, backgroundColor: '#9788FB', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    backBtnText: { color: '#FFF', fontWeight: 'bold' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { fontSize: 14, color: '#9788FB', fontWeight: 'bold' },
    dayBadge: { backgroundColor: '#9788FB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    dayBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    questionCounter: { fontSize: 14, color: '#64748B', fontWeight: '600' },

    // Progress
    progressBarBg: { height: 5, backgroundColor: '#E2E8F0', marginHorizontal: 20, borderRadius: 3, marginBottom: 10 },
    progressBarFill: { height: 5, backgroundColor: '#9788FB', borderRadius: 3 },

    // Content
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
    typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 16, marginTop: 10 },
    typeBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    questionText: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', lineHeight: 27, marginBottom: 24 },

    // MCQ
    optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: '#E2E8F0', elevation: 1 },
    optionBtnSelected: { borderColor: '#9788FB', backgroundColor: '#EEF2FF' },
    optionLetter: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    optionLetterSelected: { backgroundColor: '#9788FB' },
    optionLetterText: { fontWeight: 'bold', color: '#64748B', fontSize: 14 },
    optionLetterTextSelected: { color: '#FFF' },
    optionText: { flex: 1, fontSize: 14, color: '#334155', lineHeight: 21 },
    optionTextSelected: { color: '#1A1A1A', fontWeight: '600' },

    // Descriptive
    descriptiveContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0', overflow: 'hidden' },
    descriptiveInput: { padding: 16, fontSize: 15, color: '#1A1A1A', minHeight: 150, lineHeight: 24 },
    charCount: { textAlign: 'right', color: '#CBD5E1', fontSize: 11, paddingRight: 12, paddingBottom: 8 },

    // Nav
    navRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', backgroundColor: '#F8F9FE' },
    prevBtn: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0' },
    prevBtnText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
    nextBtn: { flex: 2, backgroundColor: '#9788FB', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    nextBtnDisabled: { backgroundColor: '#C4B5FD' },
    nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});