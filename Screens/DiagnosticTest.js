import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ScrollView, ActivityIndicator,
    Alert, Animated, StatusBar, SafeAreaView
} from 'react-native';
import axios from 'axios';
import { ASSESSMENT_URL, AUTH_URL } from '../Constants/Api';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';

export default function DiagnosticTest({ navigation }) {
    // 🔥 ALIGNED: Pulling data and the universal update function from AuthContext
    const { refreshRoadmap } = useContext(UserContext);
    const { userData, userToken, testCount, updateUser } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [testData, setTestData] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [dayNumber, setDayNumber] = useState(1);

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (userData?.id) {
            generateTest();
        }
    }, [userData?.id]);

    const generateTest = async () => {
        try {
            setLoading(true);

            // ✅ FIX: Ensure domain and user_id are never undefined
            const domain = userData?.currentLearning || userData?.department || 'Computer Science';
            const userId = userData?.id;

            if (!userId) {
                console.error("Missing User ID");
                return;
            }

            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/generate/`,
                {
                    domain: domain,
                    spring_user_id: userId,
                    role: 'student' // Added role as some backends require it for logic
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            const data = response.data;

            // --- Handle Nested Question Structures ---
            let extractedQuestions = [];
            if (Array.isArray(data.questions)) {
                extractedQuestions = data.questions;
            } else if (data.questions && Array.isArray(data.questions.questions)) {
                extractedQuestions = data.questions.questions;
            }

            setQuestions(extractedQuestions);
            setTestData(data);

            // Set phase based on testCount from context
            setDayNumber((testCount || 0) + 1);

            if (data.onboarding_finished || (testCount >= 3)) {
                await handleFinalRoadmapTrigger(domain);
            }
        } catch (error) {
            console.error('Generate error:', error.response?.data || error.message);
            Alert.alert('Assessment Error', 'Failed to load questions.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRoadmapTrigger = async (domain) => {
        try {
            setSubmitting(true);
            const response = await axios.post(
                `${ASSESSMENT_URL}/roadmap/create/`,
                { user_id: userData.id, domain: domain, subject: domain, is_complete: true },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.status === 200 || response.status === 201) {
                // ✅ UPDATE GLOBAL STATE
                await updateUser({ hasRoadmap: true, testCount: 3 });
                await refreshRoadmap?.();

                Alert.alert("Success 🎉", "All tests done! Your AI Roadmap is ready.");
                navigation.replace('Main');
            }
        } catch (e) {
            console.error("Roadmap generation failed", e);
            navigation.replace('Main');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const domain = userData?.currentLearning || userData?.targetCourse || 'Computer Science';
            const answersArray = Object.entries(answers).map(([id, answer]) => ({
                id: parseInt(id),
                answer: answer
            }));

            // 1. Submit to Django Assessment
            const response = await axios.post(
                `${ASSESSMENT_URL}/assessment/submit/`,
                {
                    test_id: testData.test_id,
                    spring_user_id: userData.id,
                    answers: answersArray
                },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            const nextCount = (testCount || 0) + 1;

            // 2. Sync Local Global State & Storage via updateUser
            await updateUser({ testCount: nextCount });

            // 3. Optional: Sync back to Spring Boot DB
            try {
                // ✅ FIX: Removed trailing slash if that was causing the 404 in your logs
                await axios.put(`${AUTH_URL}/update-profile/learning/${userData.id}`,
                    { testCount: nextCount },
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
            } catch (authErr) {
                console.log("Remote Auth Sync Failed (non-critical)");
            }

            if (response.data.onboarding_finished || nextCount >= 3) {
                await handleFinalRoadmapTrigger(domain);
            } else {
                Alert.alert("Test Submitted", `Phase ${nextCount} complete!`, [
                    { text: "Continue", onPress: () => navigation.replace('Main') }
                ]);
            }

        } catch (error) {
            console.error("Submit Error:", error.response?.data || error.message);
            Alert.alert('Error', 'Submission failed. Check your internet.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectOption = (questionId, selectedOption) => {
        // Standardize format to just the letter 'A', 'B', etc.
        setAnswers(prev => ({ ...prev, [String(questionId)]: selectedOption.charAt(0) }));
    };

    const handleDescriptiveAnswer = (questionId, text) => {
        setAnswers(prev => ({ ...prev, [String(questionId)]: text }));
    };

    const animateTransition = (callback) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            callback();
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    const goToNext = () => {
        const currentQ = questions[currentIndex];
        if (!answers[String(currentQ?.id)]) {
            Alert.alert('Action Required', 'Please provide an answer before moving forward.');
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
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingTitle}>Preparing Phase {(testCount || 0) + 1}/3...</Text>
                <Text style={styles.loadingSub}>Analyzing your domain: {userData?.currentLearning || 'General'}</Text>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isMCQ = currentQuestion?.type?.toLowerCase() === 'mcq';
    const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.dayBadge}>
                    <Text style={styles.dayText}>Assessment Phase {(testCount || 0) + 1}</Text>
                </View>
                <Text style={styles.counter}>{currentIndex + 1}/{questions.length}</Text>
            </View>

            <View style={styles.barBg}>
                <Animated.View style={[styles.barFill, { width: `${progress}%` }]} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.badge, { backgroundColor: isMCQ ? '#EEF2FF' : '#FFF7ED' }]}>
                        <Text style={[styles.badgeText, { color: isMCQ ? '#6366F1' : '#F97316' }]}>
                            {isMCQ ? 'MULTIPLE CHOICE' : 'DESCRIPTIVE'}
                        </Text>
                    </View>
                    <Text style={styles.qText}>{currentQuestion?.question}</Text>

                    {isMCQ ? (
                        currentQuestion.options?.map((opt, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.optBtn,
                                    answers[String(currentQuestion.id)] === opt.charAt(0) && styles.optSelected
                                ]}
                                onPress={() => handleSelectOption(currentQuestion.id, opt)}
                            >
                                <View style={[
                                    styles.optLetter,
                                    answers[String(currentQuestion.id)] === opt.charAt(0) && styles.optLetterSelected
                                ]}>
                                    <Text style={[
                                        styles.optLetterText,
                                        answers[String(currentQuestion.id)] === opt.charAt(0) && styles.optLetterTextSelected
                                    ]}>{opt.charAt(0)}</Text>
                                </View>
                                <Text style={styles.optText}>{opt.substring(3)}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <TextInput
                            style={styles.input}
                            multiline
                            placeholder="Type your explanation here..."
                            value={answers[String(currentQuestion?.id)] || ''}
                            onChangeText={(text) => handleDescriptiveAnswer(currentQuestion.id, text)}
                        />
                    )}
                </Animated.View>
            </ScrollView>

            <View style={styles.nav}>
                {currentIndex > 0 ? (
                    <TouchableOpacity style={styles.back} onPress={goToPrev}>
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flex: 1 }} />
                )}
                <TouchableOpacity
                    style={[styles.next, !answers[String(currentQuestion?.id)] && styles.disabled]}
                    onPress={goToNext}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.nextText}>
                            {currentIndex === questions.length - 1 ? 'Finish Test' : 'Next'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    loadingTitle: { marginTop: 15, fontWeight: '800', color: '#1E293B', fontSize: 18 },
    loadingSub: { marginTop: 5, color: '#64748B', fontSize: 14 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    closeBtn: { width: 35, height: 35, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    closeText: { color: '#6366F1', fontWeight: 'bold' },
    dayBadge: { backgroundColor: '#6366F1', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
    dayText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    counter: { color: '#64748B', fontWeight: 'bold' },
    barBg: { height: 6, backgroundColor: '#E2E8F0', marginHorizontal: 20, borderRadius: 3 },
    barFill: { height: 6, backgroundColor: '#6366F1', borderRadius: 3 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 15 },
    badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    qText: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 26, marginBottom: 25 },
    optBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
    optSelected: { borderColor: '#6366F1', backgroundColor: '#F5F7FF' },
    optLetter: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    optLetterSelected: { backgroundColor: '#6366F1' },
    optLetterText: { fontWeight: 'bold', color: '#64748B' },
    optLetterTextSelected: { color: '#FFF' },
    optText: { flex: 1, color: '#334155', fontSize: 15, fontWeight: '500' },
    input: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 15, minHeight: 200, textAlignVertical: 'top', fontSize: 16 },
    nav: { flexDirection: 'row', gap: 12, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    back: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
    backText: { color: '#64748B', fontWeight: '800' },
    next: { flex: 2, padding: 16, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
    nextText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
    disabled: { opacity: 0.5 }
});