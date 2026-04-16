// Screens/TestResult.js
import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, StatusBar, SafeAreaView
} from 'react-native';

export default function TestResult({ navigation, route }) {
    const { dayNumber, onboardingFinished, totalQuestions, mcqCount } = route.params;

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1, tension: 50, friction: 7, useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 600, useNativeDriver: true
            })
        ]).start();
    }, []);

    const isAllDone = onboardingFinished;
    const daysLeft = 7 - dayNumber;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9788FB" />

            <View style={styles.topSection}>
                <Animated.View style={[
                    styles.iconCircle,
                    { transform: [{ scale: scaleAnim }] }
                ]}>
                    <Text style={styles.iconText}>
                        {isAllDone ? '🎓' : '✅'}
                    </Text>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
                    <Text style={styles.titleText}>
                        {isAllDone ? 'Onboarding Complete!' : `Day ${dayNumber} Done!`}
                    </Text>
                    <Text style={styles.subtitleText}>
                        {isAllDone
                            ? 'Your personalized roadmap is ready.'
                            : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your assessment`
                        }
                    </Text>
                </Animated.View>
            </View>

            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{dayNumber}/7</Text>
                        <Text style={styles.statLabel}>Days Done</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{mcqCount}</Text>
                        <Text style={styles.statLabel}>MCQs</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{totalQuestions - mcqCount}</Text>
                        <Text style={styles.statLabel}>Descriptive</Text>
                    </View>
                </View>

                {/* Message */}
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                        {isAllDone
                            ? '🚀 Your AI has analyzed 7 days of responses and built a custom roadmap just for you!'
                            : `📊 Great work! Come back tomorrow for Day ${dayNumber + 1}. The AI is tracking your patterns.`
                        }
                    </Text>
                </View>

                {/* Progress dots */}
                <View style={styles.dotsRow}>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
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
                <Text style={styles.dotsLabel}>7-Day Assessment Progress</Text>

            </Animated.View>

            {/* CTA Button */}
            <TouchableOpacity
                style={styles.homeBtn}
                onPress={() => navigation.replace('Main')}
                activeOpacity={0.85}
            >
                <Text style={styles.homeBtnText}>
                    {isAllDone ? 'View My Roadmap →' : 'Back to Home'}
                </Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#9788FB',
        alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 40, paddingHorizontal: 20
    },
    topSection: { alignItems: 'center', gap: 20, marginTop: 20 },
    iconCircle: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    iconText: { fontSize: 56 },
    titleText: {
        fontSize: 28, fontWeight: '900', color: '#FFF',
        textAlign: 'center', marginTop: 10
    },
    subtitleText: {
        fontSize: 15, color: 'rgba(255,255,255,0.8)',
        textAlign: 'center', marginTop: 6
    },

    card: {
        backgroundColor: '#FFF', borderRadius: 28,
        padding: 24, width: '100%', elevation: 10,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20
    },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-around',
        marginBottom: 24, paddingBottom: 24,
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    statBox: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 28, fontWeight: '900', color: '#9788FB' },
    statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: '#F1F5F9' },

    messageBox: {
        backgroundColor: '#F8F9FE', borderRadius: 16,
        padding: 16, marginBottom: 24
    },
    messageText: { fontSize: 14, color: '#475569', lineHeight: 22, textAlign: 'center' },

    dotsRow: {
        flexDirection: 'row', justifyContent: 'center',
        gap: 8, marginBottom: 8
    },
    dot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#E2E8F0'
    },
    dotFilled: { backgroundColor: '#C4B5FD' },
    dotCurrent: { backgroundColor: '#9788FB', width: 24, borderRadius: 5 },
    dotsLabel: { textAlign: 'center', fontSize: 11, color: '#94A3B8', fontWeight: '600' },

    homeBtn: {
        backgroundColor: '#FFF', width: '100%', paddingVertical: 18,
        borderRadius: 20, alignItems: 'center',
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10
    },
    homeBtnText: { color: '#9788FB', fontWeight: '900', fontSize: 18 },
});