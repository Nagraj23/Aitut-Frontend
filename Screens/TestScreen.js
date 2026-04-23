import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, ActivityIndicator, TextInput, Alert, Modal
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
    const [basicCount, setBasicCount] = useState(0);
    const [customTests, setCustomTests] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Modal state for creating a new custom test
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [customSubject, setCustomSubject] = useState('');

    useFocusEffect(useCallback(() => { loadTests(); }, []));

    const loadTests = async () => {
        setLoading(true);
        try {
            const count = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
            setBasicCount(count);

            const customStr = await AsyncStorage.getItem('customTests');
            setCustomTests(customStr ? JSON.parse(customStr) : []);
        } catch (e) {
            console.log('Load tests error:', e);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIX: Custom test gets its own subject label and isCustomTest=true flag
    // This prevents TestInput from treating it as a continuation of the basic series
    const handleCreateCustomTest = () => {
        const subject = customSubject.trim();
        if (!subject) {
            Alert.alert('Subject Required', 'Please enter a subject for the custom test.');
            return;
        }
        setShowCreateModal(false);
        setCustomSubject('');
        navigation.navigate('TestInput', {
            testLabel: subject,
            isCustomTest: true,   // ← KEY FLAG: tells TestInput this is standalone
        });
    };

    const basicProgress = Math.min((basicCount / 3) * 100, 100);
    const basicStatus = basicCount >= 3 ? 'completed' : 'pending';
    const basicCfg = STATUS_CONFIG[basicStatus];

    const renderBasicCard = () => (
        <View style={styles.testCard}>
            <View style={styles.testCardHeader}>
                <View style={styles.testIconBox}>
                    <Text style={styles.testIcon}>🎯</Text>
                </View>
                <View style={styles.testInfo}>
                    <Text style={styles.testLabel}>Basic Assessment</Text>
                    <Text style={styles.testDesc}>3-part diagnostic for your profile</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: basicCfg.bg }]}>
                    <Text style={[styles.statusPillText, { color: basicCfg.color }]}>
                        {basicCfg.label}
                    </Text>
                </View>
            </View>

            <View style={styles.progressRow}>
                <Text style={styles.progressText}>{basicCount}/3 tests completed</Text>
                <Text style={[styles.progressPct, { color: basicCfg.color }]}>
                    {Math.round(basicProgress)}%
                </Text>
            </View>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                    width: `${basicProgress}%`,
                    backgroundColor: basicCfg.color,
                }]} />
            </View>

            <View style={styles.dotsRow}>
                {[1, 2, 3].map(n => (
                    <View
                        key={n}
                        style={[
                            styles.dot,
                            n <= basicCount ? styles.dotDone : styles.dotEmpty,
                        ]}
                    >
                        <Text style={styles.dotText}>{n <= basicCount ? '✓' : n}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.testActions}>
                {basicStatus !== 'completed' ? (
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => navigation.navigate('TestInput', {
                            testLabel: 'Basic Assessment',
                            isCustomTest: false, // ← Tells TestInput to continue the series
                        })}
                    >
                        <Text style={styles.continueBtnText}>
                            {basicCount === 0 ? 'Start Test 1' : `Continue Test ${basicCount + 1} →`}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.resultBtn}
                        onPress={() => navigation.navigate('TestResult', {
                            dayNumber: basicCount,
                            totalDays: 3,
                            onboardingFinished: true,
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

    const renderCustomCard = (item, index) => {
        const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const progress = item.totalTests > 0
            ? (item.testsCompleted / item.totalTests) * 100
            : 0;

        return (
            <View key={`custom-${index}`} style={styles.testCard}>
                <View style={styles.testCardHeader}>
                    <View style={[styles.testIconBox, { backgroundColor: '#FFF7ED' }]}>
                        <Text style={styles.testIcon}>📋</Text>
                    </View>
                    <View style={styles.testInfo}>
                        <Text style={styles.testLabel}>{item.label}</Text>
                        <Text style={styles.testDesc}>Custom test · {item.totalTests} question{item.totalTests !== 1 ? 's' : ''}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>

                {item.totalTests > 0 && (
                    <>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressText}>
                                {item.testsCompleted}/{item.totalTests} completed
                            </Text>
                            <Text style={[styles.progressPct, { color: cfg.color }]}>
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, {
                                width: `${progress}%`,
                                backgroundColor: cfg.color,
                            }]} />
                        </View>
                    </>
                )}

                <View style={styles.testActions}>
                    {item.status !== 'completed' ? (
                        <TouchableOpacity
                            style={styles.continueBtn}
                            onPress={() => navigation.navigate('TestInput', {
                                testLabel: item.label,
                                isCustomTest: true, // ← Always custom for these
                            })}
                        >
                            <Text style={styles.continueBtnText}>
                                {item.testsCompleted === 0 ? 'Start Test' : 'Retake →'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.resultBtn}>
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
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Basic assessment series (always shown first) */}
                    {renderBasicCard()}

                    {/* Custom test cards */}
                    {customTests.map((item, i) => renderCustomCard(item, i))}

                    {/* CTA to create a new custom test */}
                    <TouchableOpacity
                        style={styles.newTestCard}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Text style={styles.newTestIcon}>➕</Text>
                        <Text style={styles.newTestTitle}>Create Custom Test</Text>
                        <Text style={styles.newTestSub}>
                            Test yourself on any subject — completely separate from the basic series
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}

            {/* ✅ Create custom test modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>New Custom Test</Text>
                        <Text style={styles.modalSubtitle}>
                            Enter the subject or topic you want to be tested on.
                            This is independent of your basic 3-test series.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. Database Management, React Native..."
                            placeholderTextColor="#94A3B8"
                            value={customSubject}
                            onChangeText={setCustomSubject}
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => { setShowCreateModal(false); setCustomSubject(''); }}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCreateBtn}
                                onPress={handleCreateCustomTest}
                            >
                                <Text style={styles.modalCreateText}>Start Test →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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

    dotsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    dot: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    dotDone: { backgroundColor: '#4F46E5' },
    dotEmpty: { backgroundColor: '#F0F0F0' },
    dotText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

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
    newTestSub: { fontSize: 12, color: '#94A3B8', marginTop: 4, textAlign: 'center', lineHeight: 18 },

    // Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 28, paddingBottom: 40,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
    modalSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 20 },
    modalInput: {
        backgroundColor: '#F8F9FE', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 20,
    },
    modalActions: { flexDirection: 'row', gap: 12 },
    modalCancelBtn: {
        flex: 1, padding: 14, borderRadius: 14,
        backgroundColor: '#F1F5F9', alignItems: 'center',
    },
    modalCancelText: { fontWeight: '700', color: '#64748B', fontSize: 14 },
    modalCreateBtn: {
        flex: 1, padding: 14, borderRadius: 14,
        backgroundColor: '#4F46E5', alignItems: 'center',
    },
    modalCreateText: { fontWeight: '800', color: '#FFF', fontSize: 14 },
});