import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Mock data — replace with real API data later ──
const MOCK_ROADMAP = {
    title: "Data Structures & Algorithms",
    subject: "CSE",
    totalDays: 7,
    progress: 28,
    days: [
        {
            day: 1,
            topic: "Arrays & Sorting",
            subject: "DSA",
            task: "Learn Bubble Sort, Selection Sort. Solve 5 practice problems.",
            status: "completed",
            duration: "45 min",
        },
        {
            day: 2,
            topic: "Linked Lists",
            subject: "DSA",
            task: "Understand Singly & Doubly Linked Lists. Implement insert & delete.",
            status: "active",
            duration: "60 min",
        },
        {
            day: 3,
            topic: "Stacks & Queues",
            subject: "DSA",
            task: "Implement Stack using arrays. Solve balanced parentheses problem.",
            status: "locked",
            duration: "50 min",
        },
        {
            day: 4,
            topic: "Binary Trees",
            subject: "DSA",
            task: "Learn tree traversals: Inorder, Preorder, Postorder.",
            status: "locked",
            duration: "70 min",
        },
        {
            day: 5,
            topic: "Binary Search Tree",
            subject: "DSA",
            task: "Insert, delete, search in BST. Understand AVL rotations.",
            status: "locked",
            duration: "65 min",
        },
        {
            day: 6,
            topic: "Graphs - BFS & DFS",
            subject: "DSA",
            task: "Implement BFS and DFS. Solve shortest path problem.",
            status: "locked",
            duration: "80 min",
        },
        {
            day: 7,
            topic: "Dynamic Programming",
            subject: "DSA",
            task: "Learn memoization. Solve Fibonacci, Knapsack problems.",
            status: "locked",
            duration: "90 min",
        },
    ]
};

const statusConfig = {
    completed: { color: '#4ADE80', bg: '#F0FDF4', icon: '✅', label: 'Completed' },
    active:    { color: '#9788FB', bg: '#EDE9FF', icon: '▶️', label: 'Start Today' },
    locked:    { color: '#94A3B8', bg: '#F8FAFC', icon: '🔒', label: 'Locked' },
};

const RoadmapScreen = ({ navigation, route }) => {
    // Use passed data or fallback to mock
    const roadmap = route?.params?.roadmapData || MOCK_ROADMAP;

    const renderDayCard = (item) => {
        const config = statusConfig[item.status];
        const isLocked = item.status === 'locked';

        return (
            <View key={item.day} style={styles.cardWrapper}>

                {/* Left — Day number + connector line */}
                <View style={styles.timelineCol}>
                    <View style={[styles.dayCircle, { backgroundColor: config.color }]}>
                        <Text style={styles.dayNum}>D{item.day}</Text>
                    </View>
                    {item.day < roadmap.days.length && (
                        <View style={[
                            styles.connector,
                            { backgroundColor: item.status === 'completed' ? '#4ADE80' : '#E2E8F0' }
                        ]} />
                    )}
                </View>

                {/* Right — Content card */}
                <View style={[styles.card, { backgroundColor: config.bg, opacity: isLocked ? 0.7 : 1 }]}>
                    <View style={styles.cardTop}>
                        <View style={styles.cardMeta}>
                            <Text style={styles.subjectTag}>{item.subject}</Text>
                            <Text style={styles.duration}>⏱ {item.duration}</Text>
                        </View>
                        <Text style={[styles.statusLabel, { color: config.color }]}>
                            {config.icon} {config.label}
                        </Text>
                    </View>

                    <Text style={styles.topicTitle}>{item.topic}</Text>
                    <Text style={styles.taskText}>{item.task}</Text>

                    {/* Only show Start button for active day */}
                    {item.status === 'active' && (
                        <TouchableOpacity
                            style={styles.startBtn}
                            onPress={() => navigation.navigate('Teach', {
                                day: item.day,
                                topic: item.topic,
                                subject: item.subject,
                                task: item.task,
                            })}
                        >
                            <Text style={styles.startBtnText}>Start Learning →</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'completed' && (
                        <TouchableOpacity
                            style={[styles.startBtn, { backgroundColor: '#DCFCE7' }]}
                            onPress={() => navigation.navigate('Teach', {
                                day: item.day,
                                topic: item.topic,
                                subject: item.subject,
                                task: item.task,
                            })}
                        >
                            <Text style={[styles.startBtnText, { color: '#16A34A' }]}>
                                Review Again →
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#9788FB" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>{roadmap.title}</Text>
                    <Text style={styles.headerSub}>{roadmap.totalDays} Day Roadmap</Text>
                </View>
                <View style={styles.progressPill}>
                    <Text style={styles.progressPillText}>{roadmap.progress}%</Text>
                </View>
            </View>

            {/* Overall progress bar */}
            <View style={styles.overallProgressBg}>
                <View style={[styles.overallProgressFill, { width: `${roadmap.progress}%` }]} />
            </View>

            {/* Day Cards */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {roadmap.days.map(renderDayCard)}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

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
    headerTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    progressPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    },
    progressPillText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },

    // Overall progress bar
    overallProgressBg: {
        height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16, borderRadius: 2, marginBottom: 4,
    },
    overallProgressFill: {
        height: 4, backgroundColor: '#FFF', borderRadius: 2,
    },

    // Scroll
    scrollContent: {
        backgroundColor: '#F8F9FE',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 24, paddingHorizontal: 16,
    },

    // Timeline layout
    cardWrapper: { flexDirection: 'row', marginBottom: 0 },
    timelineCol: { alignItems: 'center', width: 44, marginRight: 12 },
    dayCircle: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    dayNum: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    connector: { width: 2, flex: 1, minHeight: 20, marginVertical: 4 },

    // Content card
    card: {
        flex: 1, borderRadius: 20, padding: 16,
        marginBottom: 16,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    subjectTag: {
        backgroundColor: '#EDE9FF', color: '#9788FB',
        fontSize: 11, fontWeight: 'bold',
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
    },
    duration: { fontSize: 11, color: '#94A3B8' },
    statusLabel: { fontSize: 11, fontWeight: '600' },
    topicTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
    taskText: { fontSize: 13, color: '#475569', lineHeight: 19 },

    // Start button
    startBtn: {
        backgroundColor: '#9788FB', marginTop: 14,
        padding: 12, borderRadius: 12, alignItems: 'center',
    },
    startBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});

export default RoadmapScreen;