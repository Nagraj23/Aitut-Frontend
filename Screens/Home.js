import React, { useContext, useState, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASSESSMENT_URL } from '../Constants/Api';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
    const { refreshIsComplete } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentRoadmap, setCurrentRoadmap] = useState(null);
    const [user, setUser] = useState(null);
    const [testsCompleted, setTestsCompleted] = useState(0);
    const [assessmentStatus, setAssessmentStatus] = useState(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    // ✅ FIX: Prevent roadmap API from being called every single focus event.
    // Only re-fetch if data is stale (older than 60 seconds).
    const lastFetchedAt = useRef(null);
    const CACHE_TTL_MS = 60_000;

    const loadData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const detailsStr = await AsyncStorage.getItem('userDetails');
            if (!detailsStr) return;

            const userData = JSON.parse(detailsStr);
            setUser(userData);

            // Profile completion — handle multiple field name variants from backend
            const storedComplete = await AsyncStorage.getItem('isComplete');
            const complete =
                storedComplete === 'true' ||
                userData?.isComplete === true ||
                userData?.is_complete === true ||
                userData?.complete === true;
            setIsProfileComplete(complete);

            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            setTestsCompleted(count);

            // ✅ FIX: Skip roadmap fetch if recently loaded (unless manual refresh)
            const now = Date.now();
            const isStale = !lastFetchedAt.current || (now - lastFetchedAt.current > CACHE_TTL_MS);
            if (!showRefresh && !isStale) {
                return; // Use existing state — no redundant API call
            }

            const token = await AsyncStorage.getItem('accessToken');
            try {
                const res = await axios.get(
                    `${ASSESSMENT_URL}/api/roadmaps/latest/${userData.id}/`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data?.exists !== false) {
                    setCurrentRoadmap(res.data);
                    setAssessmentStatus('complete');
                } else {
                    setAssessmentStatus(count >= 3 ? 'complete' : 'incomplete');
                    setCurrentRoadmap(null);
                }
                lastFetchedAt.current = Date.now();
            } catch {
                setAssessmentStatus(count >= 3 ? 'complete' : 'incomplete');
                setCurrentRoadmap(null);
                lastFetchedAt.current = Date.now();
            }
        } catch (e) {
            console.log('Home load error:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => {
        loadData();
        refreshIsComplete?.();
    }, []));

    const handleStartTest = () => navigation.navigate('TestInput', { testLabel: 'Basic Assessment' });

    const handleRoadmapPress = () =>
        navigation.navigate('Roadmap', { roadmapData: currentRoadmap, userId: user?.id });

    // ✅ FIX: AI Tutor is a TAB inside AppTabs, not a standalone stack screen.
    // Navigate to the tab navigator and specify the tab screen name.
    const handleAITutor = () => {
        navigation.navigate('Main', { screen: 'AI-Tut' });
    };

    const renderMainCard = () => {
        if (loading) return (
            <View style={[styles.card, { justifyContent: 'center', height: 180 }]}>
                <ActivityIndicator color="#FFF" size="large" />
            </View>
        );

        if (assessmentStatus === 'complete' && currentRoadmap) return (
            <TouchableOpacity style={styles.card} onPress={handleRoadmapPress} activeOpacity={0.9}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardLabel}>MY ROADMAP</Text>
                    <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>● Active</Text>
                    </View>
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {currentRoadmap.title || 'Your Learning Path'}
                </Text>
                {currentRoadmap.overview && (
                    <Text style={styles.cardOverview} numberOfLines={2}>{currentRoadmap.overview}</Text>
                )}
                <Text style={styles.dayText}>Progress: {currentRoadmap.progress || 0}%</Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${currentRoadmap.progress || 0}%` }]} />
                </View>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Open Roadmap →</Text>
                </View>
            </TouchableOpacity>
        );

        if (assessmentStatus === 'incomplete' && testsCompleted > 0) {
            const left = 3 - testsCompleted;
            return (
                <View style={[styles.card, { backgroundColor: '#4F46E5' }]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>ASSESSMENT IN PROGRESS</Text>
                        <Text style={[styles.cardLabel, { color: '#FFF' }]}>{testsCompleted}/3</Text>
                    </View>
                    <Text style={styles.cardTitle}>Unlock Your Roadmap</Text>
                    <Text style={styles.cardOverview}>
                        {left} test{left !== 1 ? 's' : ''} remaining
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

        if (isProfileComplete) return (
            <View style={[styles.card, { backgroundColor: '#6366F1' }]}>
                <Text style={styles.cardLabel}>READY TO BEGIN</Text>
                <Text style={styles.cardTitle}>Start Your Assessment</Text>
                <Text style={styles.cardOverview}>
                    Take 3 diagnostic tests to unlock your personalized AI roadmap.
                </Text>
                <View style={styles.miniDotsRow}>
                    {[1, 2, 3].map(n => <View key={n} style={styles.miniDot} />)}
                </View>
                <TouchableOpacity style={styles.button} onPress={handleStartTest}>
                    <Text style={[styles.buttonText, { color: '#6366F1' }]}>Begin Test 1 →</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <View style={[styles.card, { backgroundColor: '#64748B' }]}>
                <Text style={styles.cardLabel}>GET STARTED</Text>
                <Text style={styles.cardTitle}>Complete Your Profile</Text>
                <Text style={styles.cardOverview}>
                    Add university & course details to unlock your AI diagnostic test.
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditLearningInfo')}>
                    <Text style={[styles.buttonText, { color: '#64748B' }]}>Complete Profile →</Text>
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
                    colors={['#4F46E5']}
                />
            }
        >
            {/* Header */}
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
                                : "Let's set up your profile first"}
                    </Text>
                </View>
                <View style={styles.streakBox}>
                    <Text style={styles.streakText}>📝 {testsCompleted}/3</Text>
                </View>
            </View>

            {renderMainCard()}

            <Text style={styles.sectionHeader}>Your Progress</Text>
            <View style={styles.statsRow}>
                <TouchableOpacity
                    style={styles.statBox}
                    onPress={() => navigation.navigate('TestScreen')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.statIcon}>📝</Text>
                    <Text style={styles.statValue}>{testsCompleted}</Text>
                    <Text style={styles.statLabel}>Tests Done</Text>
                    {testsCompleted > 0 && <Text style={styles.tapHint}>Tap to view</Text>}
                </TouchableOpacity>

                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>🎯</Text>
                    <Text style={styles.statValue}>{Math.max(0, 3 - testsCompleted)}</Text>
                    <Text style={styles.statLabel}>Tests Left</Text>
                </View>
            </View>

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
                    onPress={() =>
                        assessmentStatus === 'complete' && currentRoadmap
                            ? handleRoadmapPress()
                            : handleStartTest()
                    }
                >
                    <Text style={styles.actionIcon}>
                        {assessmentStatus === 'complete' ? '🗺️' : '📋'}
                    </Text>
                    <Text style={styles.actionLabel}>
                        {assessmentStatus === 'complete' ? 'My Roadmap' : 'Take Test'}
                    </Text>
                </TouchableOpacity>

                {/* ✅ FIXED: navigates to the AI-Tut tab inside AppTabs */}
                <TouchableOpacity style={styles.actionCard} onPress={handleAITutor}>
                    <Text style={styles.actionIcon}>🤖</Text>
                    <Text style={styles.actionLabel}>AI Tutor</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE', paddingHorizontal: 20 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 55, marginBottom: 20,
    },
    welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
    subText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
    streakBox: {
        backgroundColor: '#FFF', paddingHorizontal: 14,
        paddingVertical: 10, borderRadius: 14, elevation: 3,
    },
    streakText: { fontWeight: 'bold', color: '#4F46E5', fontSize: 13 },

    card: {
        backgroundColor: '#9788FB', padding: 22, borderRadius: 22,
        elevation: 6, shadowColor: '#9788FB', shadowOpacity: 0.25, shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
    activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    activeBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: 'bold' },
    cardTitle: { color: '#FFF', fontSize: 19, fontWeight: 'bold', marginBottom: 4 },
    cardOverview: { color: 'rgba(255,255,255,0.78)', fontSize: 12, lineHeight: 18, marginBottom: 10 },
    dayText: { color: '#E0E0E0', marginBottom: 6, fontSize: 12 },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 14 },
    progressBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
    button: { backgroundColor: '#FFF', padding: 13, borderRadius: 13, alignItems: 'center', marginTop: 4 },
    buttonText: { color: '#9788FB', fontWeight: 'bold', fontSize: 14 },
    miniDotsRow: { flexDirection: 'row', gap: 10, marginVertical: 12 },
    miniDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
    miniDotDone: { backgroundColor: '#FFF' },

    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginTop: 22, marginBottom: 12, color: '#1A1A1A' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    statBox: {
        backgroundColor: '#FFF', flex: 1, padding: 18,
        borderRadius: 18, alignItems: 'center', elevation: 2,
    },
    statIcon: { fontSize: 20, marginBottom: 5 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { color: '#64748B', marginTop: 2, fontSize: 10, fontWeight: '600' },
    tapHint: { fontSize: 9, color: '#4F46E5', marginTop: 3, fontWeight: '600' },

    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionCard: {
        backgroundColor: '#FFF', flex: 1, padding: 14,
        borderRadius: 16, alignItems: 'center', elevation: 2, paddingVertical: 18,
    },
    actionIcon: { fontSize: 24, marginBottom: 6 },
    actionLabel: { fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center' },
});