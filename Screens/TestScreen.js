import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_CONFIG = {
    completed: { color: '#10B981', bg: '#ECFDF5', label: 'Completed' },
    pending:   { color: '#F59E0B', bg: '#FFFBEB', label: 'In Progress' },
    failed:    { color: '#EF4444', bg: '#FEF2F2', label: 'Failed' },
};

export default function TestScreen({ navigation }) {
    const [testSeries, setTestSeries] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => { loadTests(); }, []));

    const loadTests = async () => {
        setLoading(true);
        try {
            // Load the basic 3-test series progress
            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            const customTestsStr = await AsyncStorage.getItem('customTests');
            const customTests = customTestsStr ? JSON.parse(customTestsStr) : [];

            // Build the basic series
            const basicSeries = {
                id: 'basic',
                label: 'Basic Assessment',
                description: '3-part diagnostic test series for your profile',
                testsCompleted: count,
                totalTests: 3,
                isBasic: true,
                status: count >= 3 ? 'completed' : count > 0 ? 'pending' : 'pending',
                results: [],
            };

            setTestSeries([basicSeries, ...customTests]);
        } catch (e) {
            console.log('Load tests error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = () => {
        navigation.navigate('TestInput', { testLabel: `Custom Test ${testSeries.length}` });
    };

    const renderTestCard = (item) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const progress = item.isBasic
            ? (item.testsCompleted / item.totalTests) * 100
            : (item.testsCompleted / item.totalTests) * 100;

        return (
            <View key={item.id} style={styles.testCard}>
                {/* Header */}
                <View style={styles.testCardHeader}>
                    <View style={styles.testIconBox}>
                        <Text style={styles.testIcon}>{item.isBasic ? '🎯' : '📋'}</Text>
                    </View>
                    <View style={styles.testInfo}>
                        <Text style={styles.testLabel}>{item.label}</Text>
                        <Text style={styles.testDesc} numberOfLines={1}>{item.description}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressRow}>
                    <Text style={styles.progressText}>
                        {item.testsCompleted}/{item.totalTests} tests completed
                    </Text>
                    <Text style={[styles.progressPct, { color: cfg.color }]}>
                        {Math.round(progress)}%
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {
                        width: `${progress}%`,
                        backgroundColor: cfg.color
                    }]} />
                </View>

                {/* Actions */}
                <View style={styles.testActions}>
                    {item.status !== 'completed' && (
                        <TouchableOpacity
                            style={styles.continueBtn}
                            onPress={() => {
                                if (item.isBasic) {
                                    navigation.navigate('TestInput', { testLabel: 'Basic Assessment' });
                                } else {
                                    navigation.navigate('TestInput', { testLabel: item.label });
                                }
                            }}
                        >
                            <Text style={styles.continueBtnText}>
                                {item.testsCompleted === 0 ? 'Start Test' : 'Continue →'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'completed' && (
                        <TouchableOpacity
                            style={styles.resultBtn}
                            onPress={() => navigation.navigate('TestResult', {
                                dayNumber: item.testsCompleted,
                                totalDays: item.totalTests,
                                onboardingFinished: item.testsCompleted >= item.totalTests,
                                totalQuestions: 10,
                                mcqCount: 6,
                            })}
                        >
                            <Text style={styles.resultBtnText}>View Results →</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>My Tests</Text>
                    <Text style={styles.headerSub}>All your assessment series</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={handleCreateTest}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {testSeries.map(renderTestCard)}

                    {/* Create new test CTA */}
                    <TouchableOpacity style={styles.newTestCard} onPress={handleCreateTest}>
                        <Text style={styles.newTestIcon}>➕</Text>
                        <Text style={styles.newTestTitle}>Create Custom Test</Text>
                        <Text style={styles.newTestSub}>Test yourself on any subject, anytime</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#4F46E5' },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    headerCenter: { flex: 1, marginLeft: 14 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 1 },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
    },
    addBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    scrollContent: {
        backgroundColor: '#F8F9FE',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 20, minHeight: 500,
    },

    testCard: {
        backgroundColor: '#FFF', borderRadius: 22, padding: 18,
        marginBottom: 14, elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8,
    },
    testCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    testIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#EEF2FF', justifyContent: 'center',
        alignItems: 'center', marginRight: 12,
    },
    testIcon: { fontSize: 20 },
    testInfo: { flex: 1 },
    testLabel: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    testDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusPillText: { fontSize: 10, fontWeight: '800' },

    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
    progressPct: { fontSize: 12, fontWeight: '800' },
    progressBarBg: { height: 5, backgroundColor: '#F0F0F0', borderRadius: 3, marginBottom: 14 },
    progressBarFill: { height: 5, borderRadius: 3 },

    testActions: { flexDirection: 'row', gap: 10 },
    continueBtn: {
        flex: 1, backgroundColor: '#4F46E5', padding: 12,
        borderRadius: 12, alignItems: 'center',
    },
    continueBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    resultBtn: {
        flex: 1, backgroundColor: '#EEF2FF', padding: 12,
        borderRadius: 12, alignItems: 'center',
    },
    resultBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },

    newTestCard: {
        backgroundColor: '#FFF', borderRadius: 22, padding: 24,
        alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    newTestIcon: { fontSize: 32, marginBottom: 10 },
    newTestTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    newTestSub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center' },
});