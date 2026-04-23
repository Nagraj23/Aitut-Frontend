import React, { useContext, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar, SafeAreaView
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { ASSESSMENT_URL } from '../Constants/Api';

export default function HomeScreen({ navigation }) {
    const { userData, userToken } = useContext(AuthContext);
    const { roadmap, refreshRoadmap } = useContext(UserContext);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // State to sync with your Django 'user-status' endpoint
    const [status, setStatus] = useState({
        profile_complete: false,
        test_count: 0,
        is_ready_for_roadmap: false,
        has_roadmap: false
    });

    /**
     * ✅ THE FIX: Hit the correct Django URL: /user-status/<id>/
     * No extra '/api/' prefix as per your urlpatterns
     */
    const fetchProgress = async (showRefresh = false) => {
        if (!userData?.id) return;
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const url = `${ASSESSMENT_URL}/user-status/${userData.id}/`;
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (res.data?.data) {
                const backendData = res.data.data;
                setStatus(backendData);

                // If roadmap exists but context is empty, fetch it
                if (backendData.has_roadmap && !roadmap) {
                    await refreshRoadmap();
                }
            }
        } catch (e) {
            console.error("Dashboard Sync Error:", e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Auto-refresh when user navigates back to Home
    useFocusEffect(
        useCallback(() => {
            fetchProgress();
        }, [userData?.id, userData?.is_complete])
    );

    const renderMainCard = () => {
        if (loading) {
            return (
                <View style={[styles.card, styles.center]}>
                    <ActivityIndicator color="#FFF" size="large" />
                </View>
            );
        }

        // --- STEP 1: Profile Logic ---
        // If local is_complete is false AND backend says profile not complete
        if (!userData?.is_complete && !status.profile_complete) {
            return (
                <View style={[styles.card, { backgroundColor: '#64748B' }]}>
                    <Text style={styles.cardLabel}>STEP 1: ACCOUNT</Text>
                    <Text style={styles.cardTitle}>Complete Academic Info</Text>
                    <Text style={styles.cardSub}>Set your university and course details at BMIT to unlock tests.</Text>
                    <TouchableOpacity
                        style={styles.whiteBtn}
                        onPress={() => navigation.navigate('EditLearningInfo')}
                    >
                        <Text style={[styles.btnText, { color: '#64748B' }]}>Finish Profile →</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // --- STEP 2: Diagnostic Logic (3 Tests) ---
        if (!status.is_ready_for_roadmap && !status.has_roadmap) {
            return (
                <View style={[styles.card, { backgroundColor: '#4F46E5' }]}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardLabel}>STEP 2: DIAGNOSTIC</Text>
                        <Text style={styles.badgeText}>{status.test_count}/3 Done</Text>
                    </View>
                    <Text style={styles.cardTitle}>Verify Skills</Text>
                    <Text style={styles.cardSub}>Complete 3 diagnostic tests to generate your personalized AI roadmap.</Text>
                    <TouchableOpacity
                        style={styles.whiteBtn}
                        onPress={() => navigation.navigate('DiagnosticTest')}
                    >
                        <Text style={[styles.btnText, { color: '#4F46E5' }]}>
                            {status.test_count === 0 ? 'Start Assessment' : `Take Test ${status.test_count + 1}`} →
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // --- STEP 3: Roadmap Logic ---
        if (status.has_roadmap && roadmap) {
            return (
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#9788FB' }]}
                    onPress={() => navigation.navigate('Roadmap')}
                >
                    <Text style={styles.cardLabel}>PHASE 3: LEARNING</Text>
                    <Text style={styles.cardTitle}>{roadmap.title || "AI Learning Path"}</Text>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressFill, { width: '20%' }]} />
                    </View>
                    <View style={styles.whiteBtn}>
                        <Text style={[styles.btnText, { color: '#9788FB' }]}>Resume Learning →</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        // --- FALLBACK: Generation Ready ---
        return (
            <View style={[styles.card, { backgroundColor: '#7C3AED' }]}>
                <Text style={styles.cardLabel}>FINAL STEP</Text>
                <Text style={styles.cardTitle}>Ready to Generate</Text>
                <Text style={styles.cardSub}>Your 3 tests are done. Let's build your custom syllabus.</Text>
                <TouchableOpacity
                    style={styles.whiteBtn}
                    onPress={async () => {
                        setLoading(true);
                        await refreshRoadmap(); // Hits your /api/roadmap/create/
                        setLoading(false);
                    }}
                >
                    <Text style={[styles.btnText, { color: '#7C3AED' }]}>Build Roadmap Now →</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProgress(true)} />}
            >
                <View style={styles.header}>
                    <Text style={styles.welcome}>Hello {userData?.name?.split(' ')[0] || 'Student'}!</Text>
                    <Text style={styles.subWelcome}>Computer Science • BMIT</Text>
                </View>

                {renderMainCard()}

                <Text style={styles.sectionTitle}>Shortcuts</Text>
                <View style={styles.actionGrid}>
                    <ActionCard label="Profile" icon="🎓" onPress={() => navigation.navigate('EditLearningInfo')} />
                    <ActionCard label="Diagnostic" icon="📋" onPress={() => navigation.navigate('DiagnosticTest')} />
                    <ActionCard label="AI Chat" icon="🤖" onPress={() => navigation.navigate('Main', { screen: 'AI-Chat' })} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const ActionCard = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE', paddingHorizontal: 20 },
    header: { marginTop: 40, marginBottom: 25 },
    welcome: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
    subWelcome: { color: '#64748B', fontSize: 13, marginTop: 4 },
    card: { padding: 22, borderRadius: 28, minHeight: 210, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    center: { justifyContent: 'center', alignItems: 'center' },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    cardTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 10, lineHeight: 20 },
    whiteBtn: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, alignItems: 'center', marginTop: 'auto' },
    btnText: { fontWeight: 'bold', fontSize: 15 },
    progressContainer: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginVertical: 20 },
    progressFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#1E293B' },
    actionGrid: { flexDirection: 'row', gap: 12 },
    actionItem: { flex: 1, backgroundColor: '#FFF', padding: 18, borderRadius: 20, alignItems: 'center', elevation: 2 },
    actionLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginTop: 8 }
});