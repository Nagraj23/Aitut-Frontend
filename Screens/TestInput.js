import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ASSESSMENT_URL } from '../Constants/Api';

export default function TestInput({ navigation, route }) {

    const { testLabel = 'Basic Assessment', isCustomTest } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [subjects, setSubjects] = useState(['']);
    const [university, setUniversity] = useState('');
    const [domain, setDomain] = useState('');

    useEffect(() => { prefill(); }, []);

    const prefill = async () => {
        try {
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const u = JSON.parse(local);
                setUniversity(u.university || '');

                if (u.targetCourse) {
                    const courses = u.targetCourse.split(',').map(s => s.trim()).filter(Boolean);
                    setSubjects(courses.length ? courses : ['']);
                }

                setDomain(u.targetCourse || '');
            }
        } catch (e) {
            console.log(e);
        } finally {
            setFetching(false);
        }
    };

    const updateSubject = (idx, val) => {
        setSubjects(prev => {
            const n = [...prev];
            n[idx] = val;
            return n;
        });
    };

    const addSubject = () => {
        if (subjects.length < 5) {
            setSubjects(prev => [...prev, '']);
        }
    };

    const removeSubject = (idx) => {
        if (subjects.length > 1) {
            setSubjects(prev => prev.filter((_, i) => i !== idx));
        }
    };

    const handleStartTest = async () => {
        const filledSubjects = subjects.filter(s => s.trim());

        if (!filledSubjects.length) {
            Alert.alert('Required', 'Please enter at least one subject.');
            return;
        }

        if (!university.trim()) {
            Alert.alert('Required', 'Please enter your university name.');
            return;
        }

        setLoading(true);

        try {
            const token = await AsyncStorage.getItem('accessToken');
            const combinedDomain = filledSubjects.join(', ');

            // ✅ YOUR NEW LOGIC (merged safely)
            if (!isCustomTest) {
                const current = parseInt(await AsyncStorage.getItem('testsCompleted') || '0');
                await AsyncStorage.setItem('testsCompleted', String(current + 1));
            }

            const testMeta = {
                label: testLabel,
                subjects: filledSubjects,
                university: university.trim(),
                domain: combinedDomain,
                startedAt: new Date().toISOString(),
            };

            await AsyncStorage.setItem('currentTestMeta', JSON.stringify(testMeta));

            navigation.replace('DiagnosticTest', { testMeta });

        } catch (e) {
            Alert.alert('Error', 'Could not start test. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' }}>
            <ActivityIndicator color="#4F46E5" size="large" />
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Start Test</Text>
                    <Text style={styles.headerSub}>{testLabel}</Text>
                </View>
            </View>

            <View style={styles.content}>

                <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>
                        🧠 The AI will generate personalized questions based on your subjects and university curriculum.
                    </Text>
                </View>

                <Text style={styles.sectionLabel}>SUBJECTS TO TEST</Text>

                {subjects.map((sub, idx) => (
                    <View key={idx} style={styles.subjectRow}>
                        <TextInput
                            style={styles.subjectInput}
                            placeholder={`Subject ${idx + 1} (e.g. Data Structures)`}
                            placeholderTextColor="#CBD5E1"
                            value={sub}
                            onChangeText={v => updateSubject(idx, v)}
                        />
                        {subjects.length > 1 && (
                            <TouchableOpacity onPress={() => removeSubject(idx)} style={styles.removeSubBtn}>
                                <Text style={styles.removeSubBtnText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {subjects.length < 5 && (
                    <TouchableOpacity onPress={addSubject} style={styles.addSubBtn}>
                        <Text style={styles.addSubBtnText}>+ Add another subject</Text>
                    </TouchableOpacity>
                )}

                <Text style={[styles.sectionLabel, { marginTop: 20 }]}>UNIVERSITY</Text>

                <TextInput
                    style={styles.input}
                    placeholder="e.g. Solapur University"
                    placeholderTextColor="#CBD5E1"
                    value={university}
                    onChangeText={setUniversity}
                />

                <TouchableOpacity
                    style={[styles.startBtn, loading && { opacity: 0.7 }]}
                    onPress={handleStartTest}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.startBtnText}>Generate & Start Test →</Text>
                    }
                </TouchableOpacity>

                <Text style={styles.hint}>
                    Each test has 6 MCQs + 4 descriptive questions. Takes ~15-20 minutes.
                </Text>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        backgroundColor: '#4F46E5', paddingTop: 55, paddingBottom: 28,
        paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    content: { padding: 20 },

    infoBanner: {
        backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14,
        marginBottom: 24, borderLeftWidth: 3, borderLeftColor: '#4F46E5',
    },
    infoText: { color: '#3730A3', fontSize: 13, lineHeight: 20 },

    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 10,
    },

    subjectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    subjectInput: {
        flex: 1, backgroundColor: '#FFF', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1,
    },
    removeSubBtn: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
    },
    removeSubBtnText: { color: '#EF4444', fontWeight: '800' },
    addSubBtn: {
        borderWidth: 1.5, borderColor: '#4F46E5', borderRadius: 12,
        paddingVertical: 10, alignItems: 'center', marginBottom: 4,
        borderStyle: 'dashed',
    },
    addSubBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 13 },

    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 13, fontSize: 14, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1, marginBottom: 4,
    },

    startBtn: {
        backgroundColor: '#4F46E5', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 24,
        elevation: 5, shadowColor: '#4F46E5', shadowOpacity: 0.35, shadowRadius: 12,
    },
    startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    hint: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 14, lineHeight: 18 },
});