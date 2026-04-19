import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ASSESSMENT_URL } from '../Constants/Api';

const statusConfig = {
    completed:        { color: '#4ADE80', bg: '#F0FDF4', icon: '✅', label: 'Done' },
    active:           { color: '#9788FB', bg: '#EDE9FF', icon: '▶️', label: 'Today' },
    locked:           { color: '#94A3B8', bg: '#F8FAFC', icon: '🔒', label: 'Locked' },
    Learning:         { color: '#3B82F6', bg: '#EFF6FF', icon: '📖', label: 'Learning' },
    'Problem Solving':{ color: '#F97316', bg: '#FFF7ED', icon: '💡', label: 'Practice' },
    Test:             { color: '#EF4444', bg: '#FEF2F2', icon: '📝', label: 'Test' },
    Free:             { color: '#8B5CF6', bg: '#F5F3FF', icon: '🔁', label: 'Revision' },
};

const getConfig = (item) => {
    if (item.is_completed) return statusConfig.completed;
    if (item.type && statusConfig[item.type]) return statusConfig[item.type];
    return statusConfig.locked;
};

export default function RoadmapScreen({ navigation, route }) {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testsCompleted, setTestsCompleted] = useState(0);

    useEffect(() => {
        loadRoadmap();
    }, []);

    const loadRoadmap = async () => {
        try {
            // If roadmap data was passed via navigation params, use it directly
            if (route?.params?.roadmapData) {
                setRoadmap(normalizeRoadmap(route.params.roadmapData));
                setLoading(false);
                return;
            }

            // Otherwise fetch from backend
            const details = await AsyncStorage.getItem('userDetails');
            const token = await AsyncStorage.getItem('accessToken');
            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            setTestsCompleted(count);

            if (!details) { setLoading(false); return; }
            const user = JSON.parse(details);

            const response = await axios.get(
                `${ASSESSMENT_URL}/api/roadmaps/latest/${user.id}/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.exists !== false) {
                setRoadmap(normalizeRoadmap(response.data));
            }
        } catch (e) {
            console.log('Roadmap fetch error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Normalize both the old mock format and new API format
    const normalizeRoadmap = (data) => {
        if (data.days) return data; // already mock format
        return {
            title: data.title || 'My Learning Path',
            totalDays: data.daily_plan?.length || 0,
            progress: data.progress || 0,
            overview: data.overview,
            days: (data.daily_plan || []).map((item, idx) => ({
                day: item.day || idx + 1,
                topic: item.topic,
                task: item.task,
                subject: item.type || 'Learning',
                duration: '45 min',
                status: item.is_completed ? 'completed' : (idx === 0 ? 'active' : 'locked'),
                type: item.type,
                is_completed: item.is_completed,
            }))
        };
    };

    // ── Assessment incomplete screen ──
    if (!loading && !roadmap) {
        const testsLeft = 3 - testsCompleted;
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <StatusBar backgroundColor="#9788FB" barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Roadmap</Text>
                    <View style={{ width: 36 }} />
                </View>

                <View style={styles.emptyContainer}>
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyEmoji}>🧩</Text>
                        <Text style={styles.emptyTitle}>Roadmap Not Ready Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Complete {testsLeft} more diagnostic test{testsLeft !== 1 ? 's' : ''} so the AI can build your personalized learning path.
                        </Text>

                        {/* Dots progress */}
                        <View style={styles.dotsRow}>
                            {[1, 2, 3].map(n => (
                                <View key={n} style={[styles.dot, n <= testsCompleted && styles.dotFilled]} />
                            ))}
                        </View>
                        <Text style={styles.dotsLabel}>{testsCompleted}/3 Tests Completed</Text>

                        <TouchableOpacity
                            style={styles.startTestBtn}
                            onPress={() => navigation.navigate('DiagnosticTest')}
                        >
                            <Text style={styles.startTestBtnText}>
                                Take Test {testsCompleted + 1} →
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#9788FB" />
                    <Text style={{ color: '#64748B', marginTop: 12 }}>Loading your roadmap...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{roadmap.title}</Text>
                    <Text style={styles.headerSub}>{roadmap.totalDays} Day Plan</Text>
                </View>
                <View style={styles.progressPill}>
                    <Text style={styles.progressPillText}>{roadmap.progress || 0}%</Text>
                </View>
            </View>

            {/* Progress bar */}
            <View style={styles.overallProgressBg}>
                <View style={[styles.overallProgressFill, { width: `${roadmap.progress || 0}%` }]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Overview */}
                {roadmap.overview && (
                    <View style={styles.overviewCard}>
                        <Text style={styles.overviewText}>{roadmap.overview}</Text>
                    </View>
                )}

                {/* Day Cards */}
                {roadmap.days?.map((item, index) => {
                    const config = getConfig(item);
                    return (
                        <View key={index} style={styles.cardWrapper}>
                            {/* Timeline */}
                            <View style={styles.timelineCol}>
                                <View style={[styles.dayCircle, { backgroundColor: config.color }]}>
                                    <Text style={styles.dayNum}>D{item.day}</Text>
                                </View>
                                {index < roadmap.days.length - 1 && (
                                    <View style={[styles.connector, { backgroundColor: item.is_completed ? '#4ADE80' : '#E2E8F0' }]} />
                                )}
                            </View>

                            {/* Card */}
                            <View style={[styles.card, { backgroundColor: config.bg }]}>
                                <View style={styles.cardTop}>
                                    <View style={styles.cardMeta}>
                                        <Text style={[styles.typeTag, { color: config.color, backgroundColor: config.color + '20' }]}>
                                            {config.icon} {item.type || item.subject || 'Learning'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.statusLabel, { color: config.color }]}>
                                        {config.label}
                                    </Text>
                                </View>

                                <Text style={styles.topicTitle}>{item.topic}</Text>
                                <Text style={styles.taskText} numberOfLines={3}>{item.task}</Text>

                                {item.is_completed && (
                                    <TouchableOpacity
                                        style={[styles.startBtn, { backgroundColor: '#DCFCE7' }]}
                                        onPress={() => navigation.navigate('Teach', { day: item.day, topic: item.topic, task: item.task })}
                                    >
                                        <Text style={[styles.startBtnText, { color: '#16A34A' }]}>Review Again →</Text>
                                    </TouchableOpacity>
                                )}

                                {!item.is_completed && index === roadmap.days.findIndex(d => !d.is_completed) && (
                                    <TouchableOpacity
                                        style={styles.startBtn}
                                        onPress={() => navigation.navigate('Teach', { day: item.day, topic: item.topic, task: item.task })}
                                    >
                                        <Text style={styles.startBtnText}>Start Learning →</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#9788FB' },

    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#9788FB', paddingHorizontal: 16, paddingVertical: 14 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerCenter: { flex: 1, marginLeft: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
    progressPill: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    progressPillText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    overallProgressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16, borderRadius: 2, marginBottom: 4 },
    overallProgressFill: { height: 4, backgroundColor: '#FFF', borderRadius: 2 },

    scrollContent: { backgroundColor: '#F8F9FE', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 20, paddingHorizontal: 16 },

    overviewCard: { backgroundColor: '#EEF2FF', borderRadius: 16, padding: 14, marginBottom: 20 },
    overviewText: { color: '#4338CA', fontSize: 13, lineHeight: 20 },

    cardWrapper: { flexDirection: 'row', marginBottom: 0 },
    timelineCol: { alignItems: 'center', width: 44, marginRight: 12 },
    dayCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    dayNum: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    connector: { width: 2, flex: 1, minHeight: 20, marginVertical: 4 },

    card: { flex: 1, borderRadius: 18, padding: 14, marginBottom: 14, elevation: 1 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardMeta: { flexDirection: 'row' },
    typeTag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusLabel: { fontSize: 10, fontWeight: '600' },
    topicTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    taskText: { fontSize: 12, color: '#475569', lineHeight: 18 },
    startBtn: { backgroundColor: '#9788FB', marginTop: 12, padding: 10, borderRadius: 10, alignItems: 'center' },
    startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

    // Empty state
    emptyContainer: { flex: 1, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyCard: { backgroundColor: '#FFF', borderRadius: 28, padding: 32, alignItems: 'center', width: '100%', elevation: 5 },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
    emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginTop: 10, marginBottom: 24 },
    dotsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E2E8F0' },
    dotFilled: { backgroundColor: '#9788FB' },
    dotsLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 24 },
    startTestBtn: { backgroundColor: '#9788FB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
    startTestBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});