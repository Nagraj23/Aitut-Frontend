import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_URL } from "../Constants/Api";

const { width } = Dimensions.get('window');

const EditLearningInfoScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState({ p1: false, p2: false });
    const [canGenerate, setCanGenerate] = useState(false);

    const [academicData, setAcademicData] = useState({ university: '', department: '' });
    const [courseData, setCourseData] = useState({ targetCourse: '', dailyStudyHours: '' });

    // --- STEP 1: SPRING BOOT UPDATE ---
    const handleUpdateProfile = async () => {
        if (!courseData.targetCourse || !academicData.department || !academicData.university) {
            Alert.alert("Required Fields", "Please enter University, Branch, and Target Course.");
            return;
        }

        setLoading(true);
        try {
            const details = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(details);

            const response = await axios.put(
                `${AUTH_URL}/update-profile/learning/${user.id}`,
                {
                    university: academicData.university,
                    department: academicData.department,
                    targetCourse: courseData.targetCourse,
                    dailyStudyHours: parseInt(courseData.dailyStudyHours || 0)
                }
            );

            if (response.data) {
                const status = response.data.complete || response.data.isComplete;
                await AsyncStorage.setItem('isComplete', String(status));
                setCanGenerate(true);
                Alert.alert("Profile Synced", "Academic details verified. AI Roadmaps unlocked!");
            }
        } catch (error) {
            Alert.alert("Sync Error", "Could not reach the profile service.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: DJANGO GENERATION ---
    const handleGenerateRoadmap = async (phaseNum) => {
        const phaseKey = phaseNum === 1 ? 'p1' : 'p2';
        setGenerating(prev => ({ ...prev, [phaseKey]: true }));

        try {
            const details = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(details);

            const response = await axios.post(`http://YOUR_DJANGO_IP:8000/api/roadmaps/generate/`, {
                user_id: user.id,
                target_course: courseData.targetCourse,
                phase: phaseNum,
                is_complete: true
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert(`Phase ${phaseNum} Success`, "Your AI Roadmap is ready.", [
                    { text: "View Now", onPress: () => navigation.navigate('RoadmapDetail', { data: response.data }) }
                ]);
            }
        } catch (error) {
            Alert.alert("AI Error", `Failed to generate Phase ${phaseNum}.`);
        } finally {
            setGenerating(prev => ({ ...prev, [phaseKey]: false }));
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Premium Header - Persistent Theme */}
            <View style={styles.header}>
                <Text style={styles.title}>Learning Path</Text>
                <Text style={styles.subtitle}>Configure your university & academic milestones</Text>
            </View>

            <View style={styles.content}>

                {/* Academic Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>🏛️</Text>
                        <Text style={styles.cardTitle}>Academic Info</Text>
                    </View>

                    <Text style={styles.label}>University</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Solapur University"
                        placeholderTextColor="#94A3B8"
                        value={academicData.university}
                        onChangeText={(t) => setAcademicData({...academicData, university: t})}
                    />

                    <Text style={styles.label}>Branch / Department</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Computer Science"
                        placeholderTextColor="#94A3B8"
                        value={academicData.department}
                        onChangeText={(t) => setAcademicData({...academicData, department: t})}
                    />
                </View>

                {/* Study Preferences Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>📚</Text>
                        <Text style={styles.cardTitle}>Study Goals</Text>
                    </View>

                    <Text style={styles.label}>Target Subject / Course</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Full Stack Web Dev"
                        placeholderTextColor="#94A3B8"
                        value={courseData.targetCourse}
                        onChangeText={(t) => setCourseData({...courseData, targetCourse: t})}
                    />

                    <Text style={styles.label}>Daily Study Hours</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 4"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={courseData.dailyStudyHours}
                        onChangeText={(t) => setCourseData({...courseData, dailyStudyHours: t})}
                    />
                </View>

                {/* Primary Sync Button */}
                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Save & Verify Profile</Text>}
                </TouchableOpacity>

                {/* Split Phase Buttons - Premium Layout */}
                {canGenerate && (
                    <View style={styles.phaseRow}>
                        <TouchableOpacity
                            style={[styles.phaseBtn, { backgroundColor: '#6366F1' }]}
                            onPress={() => handleGenerateRoadmap(1)}
                            disabled={generating.p1}
                        >
                            {generating.p1 ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>🚀 Phase 1</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.phaseBtn, { backgroundColor: '#8B5CF6' }]}
                            onPress={() => handleGenerateRoadmap(2)}
                            disabled={generating.p2}
                        >
                            {generating.p2 ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>⚡ Phase 2</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: {
        paddingTop: 60, paddingBottom: 40, paddingHorizontal: 30,
        backgroundColor: '#6366F1', borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        elevation: 10
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 5 },
    content: { padding: 20, marginTop: -30 },
    card: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 10
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    cardIcon: { fontSize: 20, marginRight: 10 },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 10 },
    input: {
        backgroundColor: '#F8FAFC', padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#E2E8F0', color: '#1E293B', fontSize: 15
    },
    primaryBtn: {
        backgroundColor: '#10B981', padding: 18, borderRadius: 16,
        alignItems: 'center', elevation: 4, marginTop: 10
    },
    phaseRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    phaseBtn: {
        width: '48%', padding: 18, borderRadius: 16,
        alignItems: 'center', elevation: 6
    },
    disabledBtn: { backgroundColor: '#94A3B8' },
    btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default EditLearningInfoScreen;