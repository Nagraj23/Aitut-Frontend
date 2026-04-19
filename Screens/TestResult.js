import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TestResult({ navigation, route }) {
    const { dayNumber, totalDays = 3, onboardingFinished, totalQuestions, mcqCount } = route.params;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const daysLeft = totalDays - dayNumber;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9788FB" />

            {/* Top Section */}
            <View style={styles.topSection}>
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.iconText}>{onboardingFinished ? '🎓' : '✅'}</Text>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Text style={styles.titleText}>
                        {onboardingFinished ? 'All Tests Done!' : `Test ${dayNumber} Complete!`}
                    </Text>
                    <Text style={styles.subtitleText}>
                        {onboardingFinished
                            ? 'Your AI roadmap is being generated now.'
                            : `${daysLeft} test${daysLeft !== 1 ? 's' : ''} remaining`}
                    </Text>
                </Animated.View>
            </View>

            {/* Stats Card */}
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{dayNumber}/{totalDays}</Text>
                        <Text style={styles.statLabel}>Tests Done</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{mcqCount}</Text>
                        <Text style={styles.statLabel}>MCQs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{totalQuestions - mcqCount}</Text>
                        <Text style={styles.statLabel}>Written</Text>
                    </View>
                </View>

                {/* Message */}
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                        {onboardingFinished
                            ? '🚀 The AI has analyzed your responses across all 3 tests and is building your custom roadmap!'
                            : `📊 Great work! Come back for Test ${dayNumber + 1}. The AI is learning your patterns.`}
                    </Text>
                </View>

                {/* Progress Dots — 3 total */}
                <View style={styles.dotsRow}>
                    {[1, 2, 3].map(day => (
                        <View
                            key={day}
                            style={[
                                styles.dot,
                                day <= dayNumber && styles.dotFilled,
                                day === dayNumber && styles.dotCurrent
                            ]}
                        />
                    ))}
                </View>
                <Text style={styles.dotsLabel}>3-Test Assessment Progress</Text>

            </Animated.View>

            {/* CTA */}
            <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.replace('Main')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.homeBtnText}>
                        {onboardingFinished ? 'View My Roadmap →' : 'Back to Home'}
                    </Text>
                </TouchableOpacity>

                {!onboardingFinished && (
                    <Text style={styles.reminderText}>
                        Complete all {totalDays} tests to unlock your personalized roadmap
                    </Text>
                )}
            </Animated.View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#9788FB', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20 },
    topSection: { alignItems: 'center', gap: 16, marginTop: 10 },
    iconCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    iconText: { fontSize: 52 },
    titleText: { fontSize: 26, fontWeight: '900', color: '#FFF', textAlign: 'center', marginTop: 10 },
    subtitleText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },

    card: { backgroundColor: '#FFF', borderRadius: 28, padding: 24, width: '100%', elevation: 10 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 26, fontWeight: '900', color: '#9788FB' },
    statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: '#F1F5F9' },

    messageBox: { backgroundColor: '#F8F9FE', borderRadius: 16, padding: 14, marginBottom: 20 },
    messageText: { fontSize: 13, color: '#475569', lineHeight: 21, textAlign: 'center' },

    dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0' },
    dotFilled: { backgroundColor: '#C4B5FD' },
    dotCurrent: { backgroundColor: '#9788FB', width: 28, borderRadius: 6 },
    dotsLabel: { textAlign: 'center', fontSize: 11, color: '#94A3B8', fontWeight: '600' },

    homeBtn: { backgroundColor: '#FFF', width: '100%', paddingVertical: 18, borderRadius: 20, alignItems: 'center', elevation: 5 },
    homeBtnText: { color: '#9788FB', fontWeight: '900', fontSize: 17 },
    reminderText: { textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 12 },
});