import React from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── STATIC ROADMAP DATA ───────────────────────────────────────────────────
const STATIC_ROADMAP = {
    title: 'Full Stack Web Development',
    overview: 'A 7-day personalized learning path to master modern web development fundamentals.',
    totalDays: 7,
    progress: 0,
    days: [
        {
            day: 1,
            topic: 'HTML & CSS Fundamentals',
            task: 'Learn semantic HTML5 tags, CSS box model, flexbox and build a simple webpage layout.',
            type: 'Learning',
            is_completed: false,
        },
        {
            day: 2,
            topic: 'JavaScript Basics',
            task: 'Understand variables, data types, functions, loops and DOM manipulation with vanilla JS.',
            type: 'Learning',
            is_completed: false,
        },
        {
            day: 3,
            topic: 'JS Problem Solving',
            task: 'Solve 5 beginner JS challenges: array manipulation, string reversal, and basic algorithms.',
            type: 'Problem Solving',
            is_completed: false,
        },
        {
            day: 4,
            topic: 'React Fundamentals',
            task: 'Learn JSX, components, props, useState and useEffect. Build a simple counter app.',
            type: 'Learning',
            is_completed: false,
        },
        {
            day: 5,
            topic: 'React Mini Project',
            task: 'Build a Todo List app using React with add, delete and complete functionality.',
            type: 'Problem Solving',
            is_completed: false,
        },
        {
            day: 6,
            topic: 'Weekly Knowledge Test',
            task: 'Take a 10-question test covering HTML, CSS, JavaScript and React concepts learned this week.',
            type: 'Test',
            is_completed: false,
        },
        {
            day: 7,
            topic: 'Revision & Review',
            task: 'Revise all topics, re-read notes, and revisit any areas where you scored below 70% in the test.',
            type: 'Free',
            is_completed: false,
        },
    ],
};

// ─── TYPE CONFIG ───────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    Learning:          { color: '#9788FB', bg: '#EDE9FF', icon: '📖', label: 'Learning' },
    'Problem Solving': { color: '#F97316', bg: '#FFF7ED', icon: '💡', label: 'Practice' },
    Test:              { color: '#EF4444', bg: '#FEF2F2', icon: '📝', label: 'Test' },
    Free:              { color: '#8B5CF6', bg: '#F5F3FF', icon: '🔁', label: 'Revision' },
    completed:         { color: '#4ADE80', bg: '#F0FDF4', icon: '✅', label: 'Done' },
};

const getConfig = (item) => {
    if (item.is_completed) return TYPE_CONFIG.completed;
    return TYPE_CONFIG[item.type] || TYPE_CONFIG.Learning;
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function RoadmapScreen({ navigation }) {
    const roadmap = STATIC_ROADMAP;

    const handleTeachMe = (item) => {
        navigation.navigate('Teach', {
            day: item.day,
            topic: item.topic,
            task: item.task,
            type: item.type,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {roadmap.title}
                    </Text>
                    <Text style={styles.headerSub}>{roadmap.totalDays} Day Plan</Text>
                </View>
                <View style={styles.progressPill}>
                    <Text style={styles.progressPillText}>{roadmap.progress}%</Text>
                </View>
            </View>

            {/* ── Progress Bar ── */}
            <View style={styles.overallProgressBg}>
                <View style={[styles.overallProgressFill, { width: `${roadmap.progress}%` }]} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Overview ── */}
                <View style={styles.overviewCard}>
                    <Text style={styles.overviewText}>{roadmap.overview}</Text>
                </View>

                {/* ── Day Cards ── */}
                {roadmap.days.map((item, index) => {
                    const config = getConfig(item);
                    const isFirstIncomplete =
                        index === roadmap.days.findIndex((d) => !d.is_completed);

                    return (
                        <View key={item.day} style={styles.cardWrapper}>

                            {/* Timeline column */}
                            <View style={styles.timelineCol}>
                                <View style={[styles.dayCircle, { backgroundColor: config.color }]}>
                                    <Text style={styles.dayNum}>D{item.day}</Text>
                                </View>
                                {index < roadmap.days.length - 1 && (
                                    <View style={[
                                        styles.connector,
                                        { backgroundColor: item.is_completed ? '#4ADE80' : '#E2E8F0' }
                                    ]} />
                                )}
                            </View>

                            {/* Card */}
                            <View style={[styles.card, { backgroundColor: config.bg }]}>

                                {/* Top row */}
                                <View style={styles.cardTop}>
                                    <View style={[styles.typeTag, { backgroundColor: config.color + '22' }]}>
                                        <Text style={[styles.typeTagText, { color: config.color }]}>
                                            {config.icon}  {item.type}
                                        </Text>
                                    </View>
                                    <Text style={[styles.statusLabel, { color: config.color }]}>
                                        {config.label}
                                    </Text>
                                </View>

                                <Text style={styles.topicTitle}>{item.topic}</Text>
                                <Text style={styles.taskText} numberOfLines={3}>
                                    {item.task}
                                </Text>

                                {/* ── TEACH ME button (show on active or completed) ── */}
                                {(isFirstIncomplete || item.is_completed) && (
                                    <TouchableOpacity
                                        style={[
                                            styles.teachBtn,
                                            item.is_completed && styles.teachBtnDone,
                                        ]}
                                        onPress={() => handleTeachMe(item)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.teachBtnText,
                                            item.is_completed && styles.teachBtnTextDone,
                                        ]}>
                                            {item.is_completed ? '🔄 Review Again' : '🎓 Teach Me'}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {/* Locked indicator */}
                                {!isFirstIncomplete && !item.is_completed && (
                                    <View style={styles.lockedRow}>
                                        <Text style={styles.lockedText}>🔒 Complete previous day to unlock</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                })}

                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── STYLES ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#9788FB' },

    // Header
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
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerCenter: { flex: 1, marginLeft: 12 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
    progressPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    progressPillText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    // Progress bar
    overallProgressBg: {
        height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16, borderRadius: 2, marginBottom: 4,
    },
    overallProgressFill: { height: 4, backgroundColor: '#FFF', borderRadius: 2 },

    // Scroll
    scrollContent: {
        backgroundColor: '#F8F9FE',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 20, paddingHorizontal: 16,
    },

    // Overview
    overviewCard: {
        backgroundColor: '#EEF2FF', borderRadius: 16,
        padding: 14, marginBottom: 20,
    },
    overviewText: { color: '#4338CA', fontSize: 13, lineHeight: 20 },

    // Timeline card wrapper
    cardWrapper: { flexDirection: 'row', marginBottom: 0 },
    timelineCol: { alignItems: 'center', width: 44, marginRight: 12 },
    dayCircle: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    dayNum: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    connector: { width: 2, flex: 1, minHeight: 20, marginVertical: 4 },

    // Card
    card: {
        flex: 1, borderRadius: 18, padding: 14,
        marginBottom: 14, elevation: 1,
    },
    cardTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 8,
    },
    typeTag: {
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6,
    },
    typeTagText: { fontSize: 10, fontWeight: '700' },
    statusLabel: { fontSize: 10, fontWeight: '600' },
    topicTitle: {
        fontSize: 15, fontWeight: 'bold',
        color: '#1E293B', marginBottom: 4,
    },
    taskText: {
        fontSize: 12, color: '#475569', lineHeight: 18,
    },

    // Teach Me button
    teachBtn: {
        backgroundColor: '#9788FB',
        marginTop: 12, padding: 11,
        borderRadius: 12, alignItems: 'center',
    },
    teachBtnDone: { backgroundColor: '#DCFCE7' },
    teachBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    teachBtnTextDone: { color: '#16A34A' },

    // Locked
    lockedRow: { marginTop: 10 },
    lockedText: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },
});