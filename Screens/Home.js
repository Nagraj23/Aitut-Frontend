import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar, ActivityIndicator,
    RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [testsCompleted, setTestsCompleted] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (details) setUser(JSON.parse(details));

            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            setTestsCompleted(count);
        } catch (e) {
            console.log('Home load error:', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const allTestsDone = testsCompleted >= 3;
    const testsLeft = 3 - testsCompleted;
    const firstName = user?.name?.split(' ')[0] || 'there';

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9788FB" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

            {/* ── Purple Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                    <Text style={styles.userName}>Hello, {firstName}!</Text>
                    <Text style={styles.userSubtitle}>
                        {allTestsDone
                            ? 'Keep up the great work!'
                            : "Let's complete your assessment"}
                    </Text>
                </View>
                <View style={styles.headerRight}>
                    <View style={styles.streakBox}>
                        <Text style={styles.streakText}>📝 {testsCompleted}/3</Text>
                    </View>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => loadData(true)}
                        colors={['#9788FB']}
                        tintColor="#9788FB"
                    />
                }
            >

                {/* ── MAIN HERO CARD ────────────────────────────────────── */}

                {allTestsDone ? (
                    /* ✅ Roadmap unlocked */
                    <TouchableOpacity
                        style={[styles.heroCard, { backgroundColor: '#9788FB' }]}
                        onPress={() => navigation.navigate('Roadmap')}
                        activeOpacity={0.9}
                    >
                        <View style={styles.heroCardHeader}>
                            <Text style={styles.heroCardLabel}>MY ROADMAP</Text>
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>● Active</Text>
                            </View>
                        </View>
                        <Text style={styles.heroCardTitle}>Your Learning Path is Ready!</Text>
                        <Text style={styles.heroCardSub}>
                            All 3 diagnostic tests completed. Your AI-personalized roadmap awaits.
                        </Text>
                        <View style={styles.dotsRow}>
                            {[1, 2, 3].map(n => (
                                <View key={n} style={[styles.dot, styles.dotFilled]} />
                            ))}
                        </View>
                        <View style={styles.heroBtn}>
                            <Text style={[styles.heroBtnText, { color: '#9788FB' }]}>
                                🗺️  Open Roadmap →
                            </Text>
                        </View>
                    </TouchableOpacity>

                ) : testsCompleted > 0 ? (
                    /* 🔄 Assessment in progress */
                    <View style={[styles.heroCard, { backgroundColor: '#4F46E5' }]}>
                        <View style={styles.heroCardHeader}>
                            <Text style={styles.heroCardLabel}>ASSESSMENT IN PROGRESS</Text>
                            <Text style={[styles.heroCardLabel, { color: '#FFF', letterSpacing: 0 }]}>
                                {testsCompleted}/3
                            </Text>
                        </View>
                        <Text style={styles.heroCardTitle}>Unlock Your Roadmap</Text>
                        <Text style={styles.heroCardSub}>
                            {testsLeft} test{testsLeft !== 1 ? 's' : ''} remaining — keep going!
                        </Text>
                        <View style={styles.dotsRow}>
                            {[1, 2, 3].map(n => (
                                <View key={n} style={[styles.dot, n <= testsCompleted && styles.dotFilled]} />
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.heroBtn}
                            onPress={() => navigation.navigate('TestInput', { testLabel: 'Basic Assessment' })}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.heroBtnText, { color: '#4F46E5' }]}>
                                Continue Test {testsCompleted + 1} →
                            </Text>
                        </TouchableOpacity>
                    </View>

                ) : (
                    /* 🚀 Not started */
                    <View style={[styles.heroCard, { backgroundColor: '#6366F1' }]}>
                        <Text style={styles.heroCardLabel}>GET STARTED</Text>
                        <Text style={styles.heroCardTitle}>Start Your Assessment</Text>
                        <Text style={styles.heroCardSub}>
                            Take 3 diagnostic tests so the AI can build your personalized learning roadmap.
                        </Text>
                        <View style={styles.dotsRow}>
                            {[1, 2, 3].map(n => <View key={n} style={styles.dot} />)}
                        </View>
                        <TouchableOpacity
                            style={styles.heroBtn}
                            onPress={() => navigation.navigate('TestInput', { testLabel: 'Basic Assessment' })}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.heroBtnText, { color: '#6366F1' }]}>Begin Test 1 →</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Stats Row ── */}
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
                        {testsCompleted > 0 && (
                            <Text style={styles.tapHint}>Tap to view →</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.statBox}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={styles.statValue}>{Math.max(0, 3 - testsCompleted)}</Text>
                        <Text style={styles.statLabel}>Tests Left</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.statBox}
                        onPress={() => navigation.navigate('Roadmap')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.statIcon}>🗺️</Text>
                        <Text style={[styles.statValue, { fontSize: 16 }]}>
                            {allTestsDone ? '✅' : '🔒'}
                        </Text>
                        <Text style={styles.statLabel}>Roadmap</Text>
                        <Text style={[styles.tapHint, { color: allTestsDone ? '#9788FB' : '#CBD5E1' }]}>
                            {allTestsDone ? 'Tap to open →' : 'Locked'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* ── Quick Actions ── */}
                <Text style={styles.sectionHeader}>Quick Actions</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('EditLearningInfo')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>🎓</Text>
                        <Text style={styles.actionLabel}>Academic{'\n'}Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() =>
                            allTestsDone
                                ? navigation.navigate('Roadmap')
                                : navigation.navigate('TestInput', { testLabel: 'Basic Assessment' })
                        }
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>{allTestsDone ? '🗺️' : '📋'}</Text>
                        <Text style={styles.actionLabel}>
                            {allTestsDone ? 'My\nRoadmap' : 'Take\nTest'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Main', { screen: 'AI-Tut' })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>🤖</Text>
                        <Text style={styles.actionLabel}>AI{'\n'}Tutor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('TestScreen')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionLabel}>All{'\n'}Tests</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#9788FB' },
    loadingContainer: {
        flex: 1, justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#F8F9FE',
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20, paddingTop: 6, paddingBottom: 22,
    },
    greeting: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600' },
    userName: { color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 3 },
    userSubtitle: { color: 'rgba(255,255,255,0.60)', fontSize: 12, marginTop: 3 },
    headerRight: { alignItems: 'flex-end', gap: 8 },
    streakBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
    },
    streakText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontSize: 17, fontWeight: '800' },

    // ── Scroll content ───────────────────────────────────────────────────────
    scrollContent: {
        backgroundColor: '#F8F9FE',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 24, paddingHorizontal: 16,
    },

    // ── Hero Card ────────────────────────────────────────────────────────────
    heroCard: {
        borderRadius: 24, padding: 22, marginBottom: 26,
        elevation: 8,
        shadowColor: '#9788FB', shadowOpacity: 0.3, shadowRadius: 14,
    },
    heroCardHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
    },
    heroCardLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10, fontWeight: '800', letterSpacing: 1.2,
    },
    activeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    activeBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: 'bold' },
    heroCardTitle: {
        color: '#FFF', fontSize: 20, fontWeight: '800',
        marginBottom: 6, lineHeight: 26,
    },
    heroCardSub: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12, lineHeight: 18, marginBottom: 16,
    },
    dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    dot: {
        width: 11, height: 11, borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dotFilled: { backgroundColor: '#FFF' },
    heroBtn: {
        backgroundColor: '#FFF', paddingVertical: 13,
        borderRadius: 14, alignItems: 'center',
    },
    heroBtnText: { fontWeight: '800', fontSize: 14 },

    // ── Stats ────────────────────────────────────────────────────────────────
    sectionHeader: {
        fontSize: 15, fontWeight: '800',
        color: '#1A1A1A', marginBottom: 12,
    },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
    statBox: {
        flex: 1, backgroundColor: '#FFF',
        borderRadius: 18, padding: 14,
        alignItems: 'center', elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    },
    statIcon: { fontSize: 20, marginBottom: 5 },
    statValue: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
    statLabel: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
    tapHint: { fontSize: 9, fontWeight: '700', marginTop: 4 },

    // ── Quick Actions ─────────────────────────────────────────────────────────
    actionsRow: { flexDirection: 'row', gap: 10 },
    actionCard: {
        flex: 1, backgroundColor: '#FFF',
        borderRadius: 18, paddingVertical: 18,
        alignItems: 'center', elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6,
    },
    actionIcon: { fontSize: 24, marginBottom: 6 },
    actionLabel: {
        fontSize: 10, fontWeight: '700',
        color: '#475569', textAlign: 'center', lineHeight: 14,
    },
});