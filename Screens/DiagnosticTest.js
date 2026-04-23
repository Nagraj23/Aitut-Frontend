import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Animated, StatusBar, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ASSESSMENT_URL } from '../Constants/Api';
import { UserContext } from '../context/UserContext'; // Ensure context is imported

export default function DiagnosticTest({ navigation }) {
    const { refreshRoadmap } = useContext(UserContext); // To update context globally
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [dayNumber, setDayNumber] = useState(1);
    const [totalDays] = useState(3);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => { generateTest(); }, []);

    const generateTest = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            const userDetails = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(userDetails);

            // Using domain strictly from profile or selection
            const domain = user?.targetCourse || 'Computer Science';

            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/generate/`,
                { domain }, // Only sending domain as requested
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const data = response.data;

            // Check if backend says onboarding is already done
            if (data.onboarding_finished) {
                await handleFinalRoadmapTrigger(domain, token);
                return;
            }

            const rawQuestions = data.questions?.questions || data.questions || [];
            setTestData(data);
            setQuestions(rawQuestions);
            setDayNumber(data.day || 1);
        } catch (error) {
            console.error('Generate test error:', error.message);
            Alert.alert('Error', 'Could not load assessment.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRoadmapTrigger = async (domain, token) => {
        try {
            setSubmitting(true);
            // Instant Roadmap Generation Call
            await axios.post(
                `${ASSESSMENT_URL}/roadmap/create/`,
                { domain },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update Global Context
            await refreshRoadmap?.();

            Alert.alert("Success", "Roadmap generated based on your 3 tests!");
            navigation.replace('Main');
        } catch (e) {
            console.error("Roadmap trigger failed", e);
            navigation.replace('Main');
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const token = await AsyncStorage.getItem('accessToken');
            const userDetails = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(userDetails);
            const domain = user?.targetCourse || 'Computer Science';

            const answersArray = Object.entries(answers).map(([id, answer]) => ({
                id: parseInt(id),
                answer: answer
            }));

            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/submit/`,
                { test_id: testData.test_id, answers: answersArray },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // If this was the 3rd test (onboarding_finished is true)
            if (response.data.onboarding_finished) {
                await handleFinalRoadmapTrigger(domain, token);
            } else {
                // Otherwise, show result and let them take the next test
                navigation.replace('TestResult', {
                    dayNumber,
                    totalDays,
                    onboardingFinished: false,
                    totalQuestions: questions.length,
                });
            }

        } catch (error) {
            Alert.alert('Submission Failed', 'Could not save your answers.');
        } finally {
            setSubmitting(false);
        }
    };

    // ... handleSelectOption, handleDescriptiveAnswer, animateTransition, goToNext, goToPrev stay the same ...

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
            Alert.alert('Answer Required', 'Please answer before moving on.');
            return;
        }
        if (currentIndex < questions.length - 1) {
            animateTransition(() => setCurrentIndex(prev => prev + 1));
        } else {
            handleSubmit();
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) animateTransition(() => setCurrentIndex(prev => prev - 1));
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#9788FB" />
                    <Text style={styles.loadingTitle}>Preparing Test {dayNumber}/3</Text>
                    <Text style={styles.loadingSubText}>Evaluating your {dayNumber === 1 ? 'Fundamentals' : dayNumber === 2 ? 'Core Logic' : 'Advanced Application'}</Text>
                </View>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isMCQ = currentQuestion?.type === 'mcq';
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}><Text style={styles.closeBtnText}>✕</Text></TouchableOpacity>
                <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>Phase {dayNumber} of 3</Text></View>
                <Text style={styles.questionCounter}>{currentIndex + 1}/{questions.length}</Text>
            </View>

            <View style={styles.progressBarBg}>
                <Animated.View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.typeBadge, { backgroundColor: isMCQ ? '#EEF2FF' : '#FFF7ED' }]}>
                        <Text style={[styles.typeBadgeText, { color: isMCQ ? '#9788FB' : '#F97316' }]}>{isMCQ ? 'Multiple Choice' : 'Descriptive'}</Text>
                    </View>
                    <Text style={styles.questionText}>{currentQuestion?.question}</Text>

                    {isMCQ ? (
                        currentQuestion.options?.map((option, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.optionBtn, answers[String(currentQuestion.id)] === option.charAt(0) && styles.optionBtnSelected]}
                                onPress={() => handleSelectOption(currentQuestion.id, option)}
                            >
                                <View style={[styles.optionLetter, answers[String(currentQuestion.id)] === option.charAt(0) && styles.optionLetterSelected]}>
                                    <Text style={[styles.optionLetterText, answers[String(currentQuestion.id)] === option.charAt(0) && styles.optionLetterTextSelected]}>{option.charAt(0)}</Text>
                                </View>
                                <Text style={styles.optionText}>{option.substring(3)}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.descriptiveContainer}>
                            <TextInput
                                style={styles.descriptiveInput}
                                multiline
                                placeholder="Write your detailed answer..."
                                value={answers[String(currentQuestion.id)] || ''}
                                onChangeText={(text) => handleDescriptiveAnswer(currentQuestion.id, text)}
                            />
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            <View style={styles.navRow}>
                {currentIndex > 0 && (
                    <TouchableOpacity style={styles.prevBtn} onPress={goToPrev}><Text style={styles.prevBtnText}>Back</Text></TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.nextBtn, !answers[String(currentQuestion?.id)] && styles.nextBtnDisabled]}
                    onPress={goToNext}
                    disabled={submitting}
                >
                    {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextBtnText}>{currentIndex === questions.length - 1 ? 'Finish Test' : 'Next'}</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ... styles remain same ...

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