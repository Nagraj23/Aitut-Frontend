import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_URL } from '../Constants/Api'; // ← use your constant, not hardcoded IP

const HomeScreen = ({ navigation }) => {
    const { isComplete } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [currentRoadmap, setCurrentRoadmap] = useState(null);
    const [user, setUser] = useState(null);

    const fetchActiveRoadmap = async () => {
        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (!details) { setLoading(false); return; }

            const userData = JSON.parse(details);
            setUser(userData);

            const response = await axios.get(`${AI_URL}/get-roadmap/${userData.id}`);
            if (response.data && response.data.exists !== false) {
                setCurrentRoadmap(response.data);
            }
        } catch (error) {
            console.log("No active roadmap found");
            setCurrentRoadmap(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActiveRoadmap(); }, []);

    const handleContinuePress = () => {
        if (!isComplete) {
            Alert.alert("Profile Incomplete", "Please complete your profile in settings first.");
        } else if (!currentRoadmap) {
            navigation.navigate('EditLearningInfo');
        } else {
            // ✅ Navigate to Roadmap screen with data
            navigation.navigate('Roadmap', {
                roadmapData: currentRoadmap,
                userId: user?.id
            });
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>
                        Hello, {user?.name || 'Developer'}! 👋
                    </Text>
                    <Text style={styles.subText}>Ready to ace your placements?</Text>
                </View>
                <View style={styles.streakBox}>
                    <Text style={styles.streakText}>🔥 3 Days</Text>
                </View>
            </View>

            {/* ── Dynamic Roadmap Card ── */}
            {loading ? (
                <View style={[styles.card, { justifyContent: 'center', height: 200 }]}>
                    <ActivityIndicator color="#FFF" size="large" />
                </View>
            ) : currentRoadmap ? (
                // ✅ HAS ROADMAP — show progress card
                <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleContinuePress}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardLabel}>CURRENT LEARNING</Text>
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>● Active</Text>
                        </View>
                    </View>

                    <Text style={styles.cardTitle}>
                        {currentRoadmap.title || currentRoadmap.target_course || "Active Roadmap"}
                    </Text>
                    {currentRoadmap.overview ? (
                        <Text style={styles.cardOverview} numberOfLines={1}>
                            {currentRoadmap.overview}
                        </Text>
                    ) : null}

                    <Text style={styles.dayText}>
                        Progress: {currentRoadmap.progress || 0}% Complete
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View style={[
                            styles.progressBarFill,
                            { width: `${currentRoadmap.progress || 0}%` }
                        ]} />
                    </View>

                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Open Roadmap →</Text>
                    </View>
                </TouchableOpacity>
            ) : (
                // ✅ NO ROADMAP — prompt to create
                <View style={[styles.card, { backgroundColor: '#64748B' }]}>
                    <Text style={styles.cardTitle}>No Active Roadmap</Text>
                    <Text style={styles.dayText}>
                        Start your AI-powered learning journey today.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('EditLearningInfo')}
                    >
                        <Text style={[styles.buttonText, { color: '#64748B' }]}>
                            Create Roadmap
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Stats ── */}
            <Text style={styles.sectionHeader}>Your Progress</Text>
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>📝</Text>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Tests Taken</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>📈</Text>
                    <Text style={styles.statValue}>82%</Text>
                    <Text style={styles.statLabel}>Avg. Score</Text>
                </View>
            </View>

            {/* ── Yesterday's Learnings ── */}
            <View style={[styles.statBox, { width: '100%', marginTop: 15, alignItems: 'flex-start' }]}>
                <Text style={styles.learningHeader}>💡 Yesterday's Key Learnings</Text>
                <View style={styles.learningList}>
                    <Text style={styles.learningItem}>• Optimized Bubble Sort using flags.</Text>
                    <Text style={styles.learningItem}>• Understood Time Complexity of Recursion.</Text>
                    <Text style={styles.learningItem}>• Solved 3 Linked List problems.</Text>
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50, marginBottom: 20 },
    welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    subText: { color: '#666', fontSize: 14 },
    streakBox: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 2, justifyContent: 'center' },
    streakText: { fontWeight: 'bold', color: '#FFAC33' },

    card: { backgroundColor: '#9788FB', padding: 25, borderRadius: 25, elevation: 8, shadowColor: '#9788FB', shadowOpacity: 0.3, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    activeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    activeBadgeText: { color: '#4ADE80', fontSize: 10, fontWeight: 'bold' },
    cardTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    cardOverview: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3 },
    dayText: { color: '#E0E0E0', marginTop: 15, marginBottom: 8, fontSize: 14 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
    progressBarFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
    button: { backgroundColor: '#FFF', marginTop: 20, padding: 14, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: '#9788FB', fontWeight: 'bold', fontSize: 16 },

    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: '#1A1A1A' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statIcon: { fontSize: 24, marginBottom: 5 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { color: '#64748B', marginTop: 2, fontSize: 12, fontWeight: '600' },
    learningHeader: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
    learningList: { width: '100%' },
    learningItem: { color: '#475569', fontSize: 14, marginBottom: 6, lineHeight: 20 }
});

export default HomeScreen;