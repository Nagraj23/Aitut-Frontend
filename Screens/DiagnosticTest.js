// Screens/DiagnosticTest.js
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
    const [testData, setTestData] = useState(null);       // full API response
    const [questions, setQuestions] = useState([]);        // flat list of questions
    const [currentIndex, setCurrentIndex] = useState(0);  // which question we're on
    const [answers, setAnswers] = useState({});            // { questionId: answer }
    const [dayNumber, setDayNumber] = useState(1);

    // Animation for question transitions
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // ─── 1. Fetch the test on mount ───────────────────────────────────────────
    useEffect(() => {
        generateTest();
    }, []);

    const generateTest = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            const userDetails = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(userDetails);

            // domain and university come from the user's profile stored at login
            const domain = user?.targetCourse || user?.target_course || 'Computer Science';
            const university = user?.university || 'General';

            const response = await axios.post(
                `${ASSESSMENT_URL}/api/assessment/generate/`,
                { domain, university },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;

            // Handle 7-day completion
            if (data.onboarding_finished) {
                Alert.alert(
                    '🎉 Assessment Complete!',
                    'You have finished all 7 days. Your personalized roadmap is ready!',
                    [{ text: 'View Roadmap', onPress: () => navigation.replace('Main') }]
                );
                return;
            }

            // Flatten questions from the nested structure AI returns
            // AI returns: { day, level, questions: [...] } inside data.questions
            const rawQuestions = data.questions?.questions || data.questions || [];

            setTestData(data);
            setQuestions(rawQuestions);
            setDayNumber(data.day || 1);
        } catch (error) {
            console.error('Generate test error:', error.response?.data || error.message);
            Alert.alert(
                'Error',
                'Could not load today\'s test. Check your connection.',
                [{ text: 'Go Back', onPress: () => navigation.goBack() }]
            );
        } finally {
            setLoading(false);
        }
    };

    // ─── 2. Handle answer selection ───────────────────────────────────────────
    const handleSelectOption = (questionId, selectedOption) => {
        // Extract just the letter: "A) Option text" → "A"
        const letter = selectedOption.charAt(0);
        setAnswers(prev => ({ ...prev, [String(questionId)]: letter }));
    };

    const handleDescriptiveAnswer = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [String(questionId)]: text }));
    };

    // ─── 3. Navigate between questions ───────────────────────────────────────
    const goToNext = () => {
        const currentQ = questions[currentIndex];

        // Validate — don't allow skipping
        if (!answers[String(currentQ.id)]) {
            Alert.alert('Please Answer', 'Select or write an answer before moving on.');
            return;
        }

        if (currentIndex < questions.length - 1) {
            // Animate out → update index → animate in
            Animated.timing(fadeAnim, {
                toValue: 0, duration: 200, useNativeDriver: true
            }).start(() => {
                setCurrentIndex(prev => prev + 1);
                Animated.timing(fadeAnim, {
                    toValue: 1, duration: 200, useNativeDriver: true
                }).start();
            });
        } else {
            // Last question — submit
            handleSubmit();
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            Animated.timing(fadeAnim, {
                toValue: 0, duration: 150, useNativeDriver: true
            }).start(() => {
                setCurrentIndex(prev => prev - 1);
                Animated.timing(fadeAnim, {
                    toValue: 1, duration: 200, useNativeDriver: true
                }).start();
            });
        }
    };

    // ─── 4. Submit all answers ────────────────────────────────────────────────
    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('accessToken');

            // Build answers array format the backend expects:
            // [{ id: 1, answer: "A" }, { id: 7, answer: "long text..." }]
            const answersArray = Object.entries(answers).map(([id, answer]) => ({
                id: parseInt(id),
                answer: answer
            }));

            const response = await axios.post(
                `${ASSESSMENT_URL}/api/assessment/submit/`,
                {
                    test_id: testData.test_id,
                    answers: answersArray
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const result = response.data;

            // Navigate to result screen
            navigation.replace('TestResult', {
                dayNumber,
                onboardingFinished: result.onboarding_finished,
                totalQuestions: questions.length,
                mcqCount: questions.filter(q => q.type === 'mcq').length,
            });

        } catch (error) {
            console.error('Submit error:', error.response?.data || error.message);
            Alert.alert('Submission Failed', 'Could not submit your answers. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── 5. Render ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9788FB" />
                <Text style={styles.loadingText}>Preparing Day {dayNumber} Test...</Text>
                <Text style={styles.loadingSubText}>AI is crafting your questions ✨</Text>
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No questions found.</Text>
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>Day {dayNumber} / 7</Text>
                </View>
                <Text style={styles.questionCounter}>
                    {currentIndex + 1}/{questions.length}
                </Text>
            </View>

            {/* ── Progress Bar ── */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            {/* ── Question Type Badge ── */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>

                    <View style={[
                        styles.typeBadge,
                        { backgroundColor: isMCQ ? '#EEF2FF' : '#FFF7ED' }
                    ]}>
                        <Text style={[
                            styles.typeBadgeText,
                            { color: isMCQ ? '#9788FB' : '#F97316' }
                        ]}>
                            {isMCQ ? '⚡ Multiple Choice' : '✍️ Descriptive'}
                        </Text>
                    </View>

                    {/* ── Question Text ── */}
                    <Text style={styles.questionText}>
                        {currentQuestion.question}
                    </Text>

                    {/* ── MCQ Options ── */}
                    {isMCQ && currentQuestion.options?.map((option, idx) => {
                        const letter = option.charAt(0); // "A", "B", "C", "D"
                        const isSelected = answers[String(currentQuestion.id)] === letter;

                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.optionBtn,
                                    isSelected && styles.optionBtnSelected
                                ]}
                                onPress={() => handleSelectOption(currentQuestion.id, option)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.optionLetter,
                                    isSelected && styles.optionLetterSelected
                                ]}>
                                    <Text style={[
                                        styles.optionLetterText,
                                        isSelected && styles.optionLetterTextSelected
                                    ]}>
                                        {letter}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected
                                ]}>
                                    {option.substring(3)} {/* Remove "A) " prefix */}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* ── Descriptive Answer Box ── */}
                    {!isMCQ && (
                        <View style={styles.descriptiveContainer}>
                            <TextInput
                                style={styles.descriptiveInput}
                                multiline
                                numberOfLines={6}
                                placeholder="Write your answer here..."
                                placeholderTextColor="#CBD5E1"
                                value={answers[String(currentQuestion.id)] || ''}
                                onChangeText={(text) =>
                                    handleDescriptiveAnswer(currentQuestion.id, text)
                                }
                                textAlignVertical="top"
                            />
                            <Text style={styles.charCount}>
                                {(answers[String(currentQuestion.id)] || '').length} characters
                            </Text>
                        </View>
                    )}

                </Animated.View>
            </ScrollView>

            {/* ── Navigation Buttons ── */}
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
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.nextBtnText}>
                            {isLastQuestion ? '✓ Submit Test' : 'Next →'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F8F9FE', padding: 30
    },
    loadingText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginTop: 20 },
    loadingSubText: { fontSize: 14, color: '#9788FB', marginTop: 8 },
    backBtn: {
        marginTop: 20, backgroundColor: '#9788FB',
        paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20
    },
    backBtnText: { color: '#FFF', fontWeight: 'bold' },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10
    },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center'
    },
    closeBtnText: { fontSize: 14, color: '#9788FB', fontWeight: 'bold' },
    dayBadge: {
        backgroundColor: '#9788FB', paddingHorizontal: 16,
        paddingVertical: 6, borderRadius: 20
    },
    dayBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    questionCounter: { fontSize: 14, color: '#64748B', fontWeight: '600' },

    // Progress
    progressBarBg: {
        height: 6, backgroundColor: '#E2E8F0',
        marginHorizontal: 20, borderRadius: 3, marginBottom: 10
    },
    progressBarFill: {
        height: 6, backgroundColor: '#9788FB',
        borderRadius: 3, transition: 'width 0.3s'
    },

    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    // Type badge
    typeBadge: {
        alignSelf: 'flex-start', paddingHorizontal: 12,
        paddingVertical: 5, borderRadius: 10, marginBottom: 16, marginTop: 10
    },
    typeBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

    // Question
    questionText: {
        fontSize: 18, fontWeight: '700', color: '#1A1A1A',
        lineHeight: 28, marginBottom: 28
    },

    // MCQ Options
    optionBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 16, padding: 16,
        marginBottom: 12, borderWidth: 2, borderColor: '#E2E8F0',
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4
    },
    optionBtnSelected: {
        borderColor: '#9788FB', backgroundColor: '#EEF2FF'
    },
    optionLetter: {
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: '#F1F5F9', justifyContent: 'center',
        alignItems: 'center', marginRight: 14
    },
    optionLetterSelected: { backgroundColor: '#9788FB' },
    optionLetterText: { fontWeight: 'bold', color: '#64748B', fontSize: 14 },
    optionLetterTextSelected: { color: '#FFF' },
    optionText: { flex: 1, fontSize: 15, color: '#334155', lineHeight: 22 },
    optionTextSelected: { color: '#1A1A1A', fontWeight: '600' },

    // Descriptive
    descriptiveContainer: {
        backgroundColor: '#FFF', borderRadius: 16,
        borderWidth: 2, borderColor: '#E2E8F0', overflow: 'hidden'
    },
    descriptiveInput: {
        padding: 16, fontSize: 15, color: '#1A1A1A',
        minHeight: 160, lineHeight: 24
    },
    charCount: {
        textAlign: 'right', color: '#CBD5E1',
        fontSize: 12, paddingRight: 12, paddingBottom: 8
    },

    // Navigation
    navRow: {
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#F8F9FE',
        borderTopWidth: 1, borderTopColor: '#E2E8F0'
    },
    prevBtn: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#E2E8F0'
    },
    prevBtnText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
    nextBtn: {
        flex: 2, backgroundColor: '#9788FB', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center', justifyContent: 'center'
    },
    nextBtnDisabled: { backgroundColor: '#C4B5FD' },
    nextBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});