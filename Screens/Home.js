import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext'; // Ensure this path is correct

const HomeScreen = () => {
    // 1. Use the AuthContext to check user status
    const { isComplete, userToken } = useContext(AuthContext);

    const handleContinuePress = () => {
        if (!isComplete) {
            Alert.alert(
                "Profile Incomplete",
                "Please complete your profile to access full assessments.",
                [{ text: "OK" }]
            );
        } else {
            // Navigate to your assessment or next logic
            console.log("Proceeding to assessment...");
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hello, Developer! 👋</Text>
                    <Text style={styles.subText}>Ready to ace your placements?</Text>
                </View>
                <View style={styles.streakBox}>
                    <Text style={styles.streakText}>🔥 3 Days</Text>
                </View>
            </View>

            {/* Main Action: Current Learning Subject */}
            <View style={styles.card}>
                <Text style={styles.cardLabel}>CURRENT LEARNING</Text>
                <Text style={styles.cardTitle}>Data Structures & Algorithms</Text>
                <Text style={styles.dayText}>Progress: 42% Complete</Text>

                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '42%' }]} />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleContinuePress}
                >
                    <Text style={styles.buttonText}>Continue Assessment</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <Text style={styles.sectionHeader}>Your Progress</Text>

            <View style={styles.statsRow}>
                {/* Previous Test Count Card */}
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>📝</Text>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Tests Taken</Text>
                </View>

                {/* Readiness Score (Existing) */}
                <View style={styles.statBox}>
                    <Text style={styles.statIcon}>📈</Text>
                    <Text style={styles.statValue}>82%</Text>
                    <Text style={styles.statLabel}>Avg. Score</Text>
                </View>
            </View>

            {/* Key Learnings Card */}
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

    // Main Learning Card
    card: { backgroundColor: '#9788FB', padding: 20, borderRadius: 25, elevation: 8, shadowColor: '#9788FB', shadowOpacity: 0.3, shadowRadius: 10 },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    cardTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 5 },
    dayText: { color: '#E0E0E0', marginTop: 10, marginBottom: 10, fontSize: 14 },
    progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
    progressBarFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
    button: { backgroundColor: '#FFF', marginTop: 20, padding: 14, borderRadius: 15, alignItems: 'center' },
    buttonText: { color: '#9788FB', fontWeight: 'bold', fontSize: 16 },

    sectionHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 20, color: '#1A1A1A' },

    // Stats Grid
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    statIcon: { fontSize: 24, marginBottom: 5 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    statLabel: { color: '#64748B', marginTop: 2, fontSize: 12, fontWeight: '600' },

    // Learning List Styles
    learningHeader: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
    learningList: { width: '100%' },
    learningItem: { color: '#475569', fontSize: 14, marginBottom: 6, lineHeight: 20 }
});

export default HomeScreen;