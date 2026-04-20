// import React, { useContext } from 'react';
// import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// import { AuthContext } from '../context/AuthContext';
// import { UserContext } from '../context/UserContext'; // ✅ NEW

// const HomeScreen = ({ navigation }) => {
//     const { isComplete, userToken } = useContext(AuthContext);

//     // ✅ GET FROM CONTEXT
//     const { userData, roadmap, isDataLoading } = useContext(UserContext);

//     const currentRoadmap = roadmap;
//     const user = userData;

//     const handleContinuePress = () => {
//          if (!currentRoadmap) {
//             navigation.navigate('EditLearningInfo');
//         } else {
//             navigation.navigate('Roadmap', {
//                 roadmapData: currentRoadmap,
//                 userId: user?.id
//             });
//         }
//     };

//     return (
//         <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

//             {/* ── Header ── */}
//             <View style={styles.header}>
//                 <View>
//                     <Text style={styles.welcomeText}>
//                         Hello, {user?.name || 'Developer'}! 👋
//                     </Text>
//                     <Text style={styles.subText}>Ready to ace your placements?</Text>
//                 </View>
//                 <View style={styles.streakBox}>
//                     <Text style={styles.streakText}>🔥 3 Days</Text>
//                 </View>
//             </View>

//             {/* ── Dynamic Roadmap Card ── */}
//             {isDataLoading ? (
//                 <View style={[styles.card, { justifyContent: 'center', height: 200 }]}>
//                     <ActivityIndicator color="#FFF" size="large" />
//                 </View>
//             ) : currentRoadmap ? (
//                 <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleContinuePress}>
//                     <View style={styles.cardHeader}>
//                         <Text style={styles.cardLabel}>CURRENT LEARNING</Text>
//                         <View style={styles.activeBadge}>
//                             <Text style={styles.activeBadgeText}>● Active</Text>
//                         </View>
//                     </View>

//                     <Text style={styles.cardTitle}>
//                         {currentRoadmap.title || currentRoadmap.target_course || "Active Roadmap"}
//                     </Text>

//                     {currentRoadmap.overview ? (
//                         <Text style={styles.cardOverview} numberOfLines={1}>
//                             {currentRoadmap.overview}
//                         </Text>
//                     ) : null}

//                     <Text style={styles.dayText}>
//                         Progress: {currentRoadmap.progress || 0}% Complete
//                     </Text>

//                     <View style={styles.progressBarBg}>
//                         <View style={[
//                             styles.progressBarFill,
//                             { width: `${currentRoadmap.progress || 0}%` }
//                         ]} />
//                     </View>

//                     <View style={styles.button}>
//                         <Text style={styles.buttonText}>Open Roadmap →</Text>
//                     </View>
//                 </TouchableOpacity>
//             ) : (
//                 <View style={[styles.card, { backgroundColor: '#64748B' }]}>
//                     <Text style={styles.cardTitle}>No Active Roadmap</Text>
//                     <Text style={styles.dayText}>
//                         Start your AI-powered learning journey today.
//                     </Text>
//                     <TouchableOpacity
//                         style={styles.button}
//                         onPress={() => navigation.navigate('EditLearningInfo')}
//                     >
//                         <Text style={[styles.buttonText, { color: '#64748B' }]}>
//                             Create Roadmap
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {/* ── Stats ── */}
//             <Text style={styles.sectionHeader}>Your Progress</Text>
//             <View style={styles.statsRow}>
//                 <View style={styles.statBox}>
//                     <Text style={styles.statIcon}>📝</Text>
//                     <Text style={styles.statValue}>12</Text>
//                     <Text style={styles.statLabel}>Tests Taken</Text>
//                 </View>
//                 <View style={styles.statBox}>
//                     <Text style={styles.statIcon}>📈</Text>
//                     <Text style={styles.statValue}>82%</Text>
//                     <Text style={styles.statLabel}>Avg. Score</Text>
//                 </View>
//             </View>

//             {/* ── Yesterday's Learnings ── */}
//             <View style={[styles.statBox, { width: '100%', marginTop: 15, alignItems: 'flex-start' }]}>
//                 <Text style={styles.learningHeader}>💡 Yesterday's Key Learnings</Text>
//                 <View style={styles.learningList}>
//                     <Text style={styles.learningItem}>• Optimized Bubble Sort using flags.</Text>
//                     <Text style={styles.learningItem}>• Understood Time Complexity of Recursion.</Text>
//                     <Text style={styles.learningItem}>• Solved 3 Linked List problems.</Text>
//                 </View>
//             </View>

//             <View style={{ height: 40 }} />
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#F8F9FE', paddingHorizontal: 20 },
//     header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, marginBottom: 20 },
//     welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
//     subText: { color: '#666', fontSize: 14 },
//     streakBox: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, justifyContent: 'center' },
//     streakText: { fontWeight: 'bold', color: '#FFAC33' },

//     card: { backgroundColor: '#9788FB', padding: 25, borderRadius: 25, elevation: 8, shadowColor: '#9788FB', shadowOpacity: 0.3, shadowRadius: 10 },
//     cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//     cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
//     activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
//     activeBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: 'bold' },
//     cardTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
//     cardOverview: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3 },
//     dayText: { color: '#E0E0E0', marginTop: 15, marginBottom: 8, fontSize: 14 },
//     progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
//     progressBarFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
//     button: { backgroundColor: '#FFF', marginTop: 20, padding: 14, borderRadius: 15, alignItems: 'center' },
//     buttonText: { color: '#9788FB', fontWeight: 'bold', fontSize: 16 },

//     sectionHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: '#1A1A1A' },
//     statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
//     statBox: { backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
//     statIcon: { fontSize: 24, marginBottom: 5 },
//     statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
//     statLabel: { color: '#64748B', marginTop: 2, fontSize: 12, fontWeight: '600' },
//     learningHeader: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
//     learningList: { width: '100%' },
//     learningItem: { color: '#475569', fontSize: 14, marginBottom: 6, lineHeight: 20 }
// });

// export default HomeScreen;



import React, { useContext, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASSESSMENT_URL } from '../Constants/Api';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const { refreshIsComplete } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentRoadmap, setCurrentRoadmap] = useState(null);
    const [user, setUser] = useState(null);
    const [testsCompleted, setTestsCompleted] = useState(0);
    const [assessmentStatus, setAssessmentStatus] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    const loadData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (!details) { setLoading(false); setRefreshing(false); return; }

            const userData = JSON.parse(details);
            // console.log('Loaded user data:', userData);
            setUser(userData);

            // ── Determine profile completion from actual DB fields ──
            // Spring returns both camelCase and snake_case depending on context
            const complete =
                userData?.isComplete === true ||
                userData?.is_complete === true ||
                userData?.complete === true ||
                (await AsyncStorage.getItem('isComplete')) === 'true';
            setIsProfileComplete(complete);

            // ── Test count ──
            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            setTestsCompleted(count);

            // ── Roadmap check ──
            const token = await AsyncStorage.getItem('accessToken');
            try {
                const roadmapRes = await axios.get(
                    `${ASSESSMENT_URL}/api/roadmaps/latest/${userData.id}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (roadmapRes.data?.exists !== false) {
                    setCurrentRoadmap(roadmapRes.data);
                    setAssessmentStatus('complete');
                } else {
                    setAssessmentStatus(count >= 3 ? 'complete' : 'incomplete');
                    setCurrentRoadmap(null);
                }
            } catch (e) {
                setAssessmentStatus(count >= 3 ? 'complete' : 'incomplete');
                setCurrentRoadmap(null);
            }

        } catch (error) {
            console.log('Home load error:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => {
        loadData();
        refreshIsComplete?.(); // also refresh context
    }, []));

    const handleStartTest = () => {
        if (!isProfileComplete) {
            Alert.alert(
                'Complete Profile First',
                'Please fill in your academic info (university, course) before taking the test.',
                [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Fill Now', onPress: () => navigation.navigate('EditLearningInfo') }
                ]
            );
            return;
        }
        navigation.navigate('DiagnosticTest');
    };

    const handleRoadmapPress = () => {
        navigation.navigate('Roadmap', { roadmapData: currentRoadmap, userId: user?.id });
    };

    const renderMainCard = () => {
        if (loading) {
            return (
                <View style={[styles.card, { justifyContent: 'center', height: 200 }]}>
                    <ActivityIndicator color="#FFF" size="large" />
                </View>
            );
        }

        // ── HAS ROADMAP ──
        if (assessmentStatus === 'complete' && currentRoadmap) {
            return (
                <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleRoadmapPress}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>MY ROADMAP</Text>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>● Active</Text>
                        </View>
                    </View>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {currentRoadmap.title || 'Your Learning Path'}
                    </Text>
                    {currentRoadmap.overview ? (
                        <Text style={styles.cardOverview} numberOfLines={2}>
                            {currentRoadmap.overview}
                        </Text>
                    ) : null}
                    <Text style={styles.dayText}>
                        Progress: {currentRoadmap.progress || 0}% Complete
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${currentRoadmap.progress || 0}%` }]} />
                    </View>
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Open Roadmap →</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        // ── TESTS IN PROGRESS ──
        if (assessmentStatus === 'incomplete' && testsCompleted > 0) {
            const testsLeft = 3 - testsCompleted;
            return (
                <View style={[styles.card, { backgroundColor: '#4F46E5' }]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>ASSESSMENT IN PROGRESS</Text>
                        <Text style={styles.progressText}>{testsCompleted}/3</Text>
                    </View>
                    <Text style={styles.cardTitle}>Unlock Your Roadmap</Text>
                    <Text style={styles.cardOverview}>
                        {testsLeft} more test{testsLeft !== 1 ? 's' : ''} remaining. AI is learning your patterns.
                    </Text>
                    <View style={styles.miniDotsRow}>
                        {[1, 2, 3].map(n => (
                            <View key={n} style={[styles.miniDot, n <= testsCompleted && styles.miniDotDone]} />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleStartTest}>
                        <Text style={[styles.buttonText, { color: '#4F46E5' }]}>
                            Continue Test {testsCompleted + 1} →
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // ── NO TESTS STARTED (profile complete) ──
        if (isProfileComplete) {
            return (
                <View style={[styles.card, { backgroundColor: '#6366F1' }]}>
                    <Text style={styles.cardLabel}>READY TO BEGIN</Text>
                    <Text style={styles.cardTitle}>Start Your Assessment</Text>
                    <Text style={styles.cardOverview}>
                        Take 3 diagnostic tests so AI can build your personalized learning roadmap.
                    </Text>
                    <View style={styles.miniDotsRow}>
                        {[1, 2, 3].map(n => (
                            <View key={n} style={[styles.miniDot]} />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleStartTest}>
                        <Text style={[styles.buttonText, { color: '#6366F1' }]}>
                            Begin Test 1 →
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // ── PROFILE INCOMPLETE ──
        return (
            <View style={[styles.card, { backgroundColor: '#64748B' }]}>
                <Text style={styles.cardLabel}>GET STARTED</Text>
                <Text style={styles.cardTitle}>Complete Your Profile</Text>
                <Text style={styles.cardOverview}>
                    Add your university and course details to unlock the AI diagnostic test.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                >
                    <Text style={[styles.buttonText, { color: '#64748B' }]}>
                        Complete Profile →
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                    colors={['#9788FB']}
                />
            }
        >
            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>
                        Hello, {user?.name?.split(' ')[0] || 'there'}! 👋
                    </Text>
                    <Text style={styles.subText}>
                        {assessmentStatus === 'complete'
                            ? 'Keep up the great work!'
                            : isProfileComplete
                                ? 'Ready to take your test?'
                                : 'Complete your profile to get started'}
                    </Text>
                </View>
                <View style={styles.streakBox}>
                    <Text style={styles.streakText}>📝 {testsCompleted}/3</Text>
                </View>
            </View>

            {/* ── Main Card ── */}
            {renderMainCard()}

            {/* ── Stats ── */}
            <Text style={styles.sectionHeader}>Your Progress</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>📝</Text>
                    <Text style={styles.statValue}>{testsCompleted}</Text>
                    <Text style={styles.statLabel}>Tests Done</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>🎯</Text>
                    <Text style={styles.statValue}>{Math.max(0, 3 - testsCompleted)}</Text>
                    <Text style={styles.statLabel}>Tests Left</Text>
                </View>
            </View>

            {/* ── Quick Actions ── */}
            <Text style={styles.sectionHeader}>Quick Actions</Text>
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                >
                    <Text style={styles.actionIcon}>🎓</Text>
                    <Text style={styles.actionLabel}>Academic Info</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => {
                        if (assessmentStatus === 'complete' && currentRoadmap) {
                            handleRoadmapPress();
                        } else {
                            handleStartTest();
                        }
                    }}
                >
                    <Text style={styles.actionIcon}>
                        {assessmentStatus === 'complete' ? '🗺️' : '📋'}
                    </Text>
                    <Text style={styles.actionLabel}>
                        {assessmentStatus === 'complete' ? 'My Roadmap' : 'Take Test'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => navigation.navigate('AI-Tut')}
                >
                    <Text style={styles.actionIcon}>🤖</Text>
                    <Text style={styles.actionLabel}>AI Tutor</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 55, marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    subText: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
    streakBox: { backgroundColor: '#FFF', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, elevation: 3 },
    streakText: { fontWeight: 'bold', color: '#9788FB', fontSize: 13 },

    card: { backgroundColor: '#9788FB', padding: 24, borderRadius: 24, elevation: 8, shadowColor: '#9788FB', shadowOpacity: 0.3, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
    activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    activeBadgeText: { color: '#4ADE80', fontSize: 11, fontWeight: 'bold' },
    progressText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
    cardTitle: { color: '#FFF', fontSize: 21, fontWeight: 'bold', marginBottom: 4 },
    cardOverview: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 19, marginBottom: 12 },
    dayText: { color: '#E0E0E0', marginBottom: 8, fontSize: 13 },
    progressBarBg: { height: 7, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: 16 },
    progressBarFill: { height: 7, backgroundColor: '#FFF', borderRadius: 4 },
    button: { backgroundColor: '#FFF', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
    buttonText: { color: '#9788FB', fontWeight: 'bold', fontSize: 15 },
    miniDotsRow: { flexDirection: 'row', gap: 10, marginVertical: 14 },
    miniDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.3)' },
    miniDotDone: { backgroundColor: '#FFF' },

    sectionHeader: { fontSize: 17, fontWeight: 'bold', marginTop: 24, marginBottom: 14, color: '#1A1A1A' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    statBox: { backgroundColor: '#FFF', flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
    statIcon: { fontSize: 22, marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { color: '#64748B', marginTop: 2, fontSize: 11, fontWeight: '600' },

    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionCard: { backgroundColor: '#FFF', flex: 1, padding: 16, borderRadius: 18, alignItems: 'center', elevation: 2, paddingVertical: 20 },
    actionIcon: { fontSize: 26, marginBottom: 8 },
    actionLabel: { fontSize: 11, fontWeight: '700', color: '#475569', textAlign: 'center' },
});

export default HomeScreen;