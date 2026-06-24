import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';

import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar, SafeAreaView, Alert, Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import axios from 'axios';
import { AI_URL, ASSESSMENT_URL } from '../Constants/Api';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
    // 1. Global Contexts
    const {
        userData,
        userToken,
        isComplete,
        testCount,
        hasRoadmap,
        updateUser
    } = useContext(AuthContext);

    const { roadmap, refreshRoadmap, isDataLoading } = useContext(UserContext);

    // 2. Local State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recap, setRecap] = useState(null);

    const [status, setStatus] = useState({
        profile_complete: isComplete || false,
        test_count: testCount || 0,
        has_roadmap: hasRoadmap || false,
        domain: userData?.department || 'Computer Science',
        progress: 0
    });

    // Standalone recap loader (clears local cache pointer before request)
    const loadRecap = async (currentUserId, currentToken) => {
        const targetId = currentUserId || userData?.id;
        const targetToken = currentToken || userToken;

        if (!targetId || !targetToken) return;

        try {
            console.log(`🚀 Hitting backend for Fresh Recap: ${AI_URL}/today_recap/${targetId}`);
            const res = await axios.get(`${AI_URL}/today_recap/${targetId}`, {
                headers: {
                    Authorization: `Bearer ${targetToken}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log("✅ Fresh Recap Payload Data received:", res.data);
            setRecap(res.data);
        } catch (err) {
            console.log("❌ HomeScreen Recap API Error:", err.message);
        }
    };

    // Synchronize authentication indicators cleanly
    useEffect(() => {
        setStatus(prev => ({
            ...prev,
            profile_complete: isComplete,
            test_count: testCount,
            has_roadmap: hasRoadmap,
            domain: userData?.department || prev.domain
        }));
    }, [isComplete, testCount, hasRoadmap, userData?.department]);

    /**
     * SYNC LOGIC: Hits your API and re-aggregates active metadata states
     */
    const syncAllData = async (isManualRefresh = false, shouldShowMainLoader = false) => {
        if (!userData?.id || !userToken) {
            setLoading(false);
            return;
        }

        if (isManualRefresh) {
            setRefreshing(true);
        } else if (shouldShowMainLoader) {
            setLoading(true);
        }

        try {
            console.log(`🚀 Pulling current status metric: ${ASSESSMENT_URL}/user-status/${userData.id}/`);
            const res = await axios.get(`${ASSESSMENT_URL}/user-status/${userData.id}/`, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            const backendData = res.data;

            setStatus(prev => ({
                ...prev,
                profile_complete: backendData.profile_complete,
                test_count: backendData.test_count || 0,
                has_roadmap: backendData.has_roadmap,
                domain: backendData.domain || userData?.department || 'Computer Science',
                progress: backendData.progress || 0
            }));

            if (updateUser) {
                await updateUser({
                    isComplete: backendData.profile_complete,
                    testCount: backendData.test_count,
                    hasRoadmap: backendData.has_roadmap
                });
            }

            if (backendData.has_roadmap && refreshRoadmap) {
                await refreshRoadmap();
            }

            await loadRecap(userData.id, userToken);

        } catch (e) {
            console.log("❌ HomeScreen Sync All Data Error:", e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // FIXES STUCK RECAP DATA: Fires sync sequence EVERY time screen gains active window viewport focus
    useFocusEffect(
        useCallback(() => {
            if (userData?.id && userToken) {
                syncAllData(false, !recap);
            }
        }, [userToken, userData?.id])
    );

    const handleGenerateRoadmap = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${ASSESSMENT_URL}/roadmap/create/`, {
                user_id: userData.id,
                domain: status.domain,
                role: 'student'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });

            if (response.status === 201 || response.status === 200) {
                Alert.alert("Success 🎉", "Your AI Learning Roadmap is ready!");
                if (updateUser) await updateUser({ hasRoadmap: true });
                await syncAllData(false, true);
            }
        } catch (err) {
            Alert.alert("Error", "Could not build roadmap. Please try again.");
            setLoading(false);
        }
    };

    const renderStepDots = (current, total) => (
        <View style={styles.stepDots}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i < current ? styles.dotDone : i === current ? styles.dotActive : styles.dotInactive
                    ]}
                />
            ))}
        </View>
    );

    const renderMainCard = () => {
        if (loading && !refreshing) {
            return (
                <View style={[styles.card, styles.center, { backgroundColor: '#F1F5F9' }]}>
                    <ActivityIndicator color="#4F46E5" size="large" />
                    <Text style={styles.syncText}>Preparing your dashboard...</Text>
                </View>
            );
        }

        if (!status.profile_complete) {
            return (
                <View style={[styles.card, { backgroundColor: '#1E293B' }]}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>STEP 1 OF 3</Text>
                        </View>
                        {renderStepDots(0, 3)}
                    </View>
                    <Text style={styles.cardTitle}>Complete Your Profile</Text>
                    <Text style={styles.cardSub}>Add your branch and university to unlock AI-powered features.</Text>
                    <TouchableOpacity style={styles.whiteBtn} onPress={() => navigation.navigate('EditLearningInfo')}>
                        <Text style={[styles.btnText, { color: '#1E293B' }]}>Finish Profile →</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (status.test_count < 3) {
            return (
                <View style={[styles.card, { backgroundColor: '#4338CA' }]}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>STEP 2 OF 3</Text>
                        </View>
                        {renderStepDots(1, 3)}
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardTitle}>Skill Diagnostic</Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>{status.test_count}/3</Text>
                        </View>
                    </View>
                    <Text style={styles.cardSub}>
                        {Math.max(0, 3 - status.test_count)} more {3 - status.test_count === 1 ? 'test' : 'tests'} to unlock your AI learning map.
                    </Text>
                    <View style={styles.miniProgressTrack}>
                        <View style={[styles.miniProgressFill, { width: `${(status.test_count / 3) * 100}%` }]} />
                    </View>
                    <TouchableOpacity style={styles.whiteBtn} onPress={() => navigation.navigate('DiagnosticTest')}>
                        <Text style={[styles.btnText, { color: '#4338CA' }]}>
                            {status.test_count === 0 ? 'Start Assessment' : `Continue Test ${status.test_count + 1}`} →
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!status.has_roadmap) {
            return (
                <View style={[styles.card, { backgroundColor: '#6D28D9' }]}>
                    <View style={styles.cardTopRow}>
                        <View style={styles.stepPill}>
                            <Text style={styles.stepPillText}>FINAL STEP</Text>
                        </View>
                        {renderStepDots(2, 3)}
                    </View>
                    <Text style={styles.cardTitle}>Build Your Roadmap</Text>
                    <Text style={styles.cardSub}>
                        All tests done! Generate your personalised {status.domain || 'CS'} learning path now.
                    </Text>
                    <View style={styles.domainTag}>
                        <Text style={styles.domainTagText}>🎯 {status.domain}</Text>
                    </View>
                    <TouchableOpacity style={styles.whiteBtn} onPress={handleGenerateRoadmap}>
                        <Text style={[styles.btnText, { color: '#6D28D9' }]}>Generate Roadmap →</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: '#7C6FF7' }]}
                onPress={() => navigation.navigate('Roadmap')}
                disabled={isDataLoading}
            >
                <View style={styles.cardTopRow}>
                    <View style={styles.stepPill}>
                        <Text style={styles.stepPillText}>LEARNING</Text>
                    </View>
                    <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabelText}>{Math.min(100, Math.max(0, status.progress))}% done</Text>
                    </View>
                </View>
                <Text style={styles.cardTitle}>{roadmap?.title || "My Learning Path"}</Text>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(5, status.progress))}%` }]} />
                </View>
                <View style={styles.whiteBtn}>
                    {isDataLoading ? (
                        <ActivityIndicator color="#7C6FF7" size="small" />
                    ) : (
                        <Text style={[styles.btnText, { color: '#7C6FF7' }]}>Resume Learning →</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const rawName = userData?.name || 'Student';
    const cleanFirstName = typeof rawName === 'string' ? rawName.split(' ')[0] : 'Student';

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => syncAllData(true, false)} tintColor="#4F46E5" />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>{getGreeting()},</Text>
                        <Text style={styles.welcome}>{cleanFirstName} 👋</Text>
                    </View>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{cleanFirstName.charAt(0).toUpperCase()}</Text>
                    </View>
                </View>

                {/* Meta info pill */}
                <View style={styles.metaPill}>
                    <Text style={styles.metaText}>
                        🎓 {userData?.department || 'Engineering'}  ·  {userData?.university || 'BMIT Solapur'}
                    </Text>
                </View>

                {/* Main Action Card */}
                <View style={styles.cardWrapper}>
                    {renderMainCard()}
                </View>

                {/* Recap Card */}
                {recap && (recap.mastered?.length > 0 || recap.loopholes?.length > 0 || recap.topic) ? (
                    <View style={styles.recapCard}>
                        <View style={styles.recapHeaderRow}>
                            <View style={styles.recapBadgePill}>
                                <Text style={styles.recapBadgeText}>🎯 DAILY RECAP</Text>
                            </View>
                            <Text style={styles.recapEmoji}>🧠</Text>
                        </View>

                        <Text style={styles.recapDay}>Day {recap.day}</Text>
                        <Text style={styles.recapTopic}>📚 {recap.topic}</Text>

                        <View style={styles.recapDivider} />

                        {recap.mastered?.length > 0 && (
                            <View style={styles.recapSection}>
                                <Text style={styles.masteredHeading}>🚀 Concepts Mastered</Text>
                                <View style={styles.chipsContainer}>
                                    {recap.mastered.map((item, index) => (
                                        <View key={index} style={styles.masteredChip}>
                                            <Text style={styles.masteredText}>✅ {item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {recap.loopholes?.length > 0 && (
                            <View style={styles.recapSection}>
                                <Text style={styles.revisionHeading}>🔥 Needs Revision</Text>
                                <View style={styles.chipsContainer}>
                                    {recap.loopholes.map((item, index) => (
                                        <View key={index} style={styles.revisionChip}>
                                            <Text style={styles.revisionText}>⚠️ {item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.footerBox}>
                            <Text style={styles.footerText}>
                                💡 Stay consistent — even 30 mins daily compounds into mastery.
                            </Text>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2FF' },
    scrollContent: { paddingBottom: 48 },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 10,
    },
    greeting: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    welcome: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginTop: 2 },
    avatarCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },

    // Meta pill
    metaPill: {
        marginHorizontal: 22,
        marginBottom: 20,
        backgroundColor: '#E0E7FF',
        borderRadius: 20,
        paddingVertical: 7,
        paddingHorizontal: 14,
        alignSelf: 'flex-start',
    },
    metaText: { fontSize: 12, color: '#4338CA', fontWeight: '600' },

    // Card
    cardWrapper: { paddingHorizontal: 20, marginBottom: 8 },
    card: {
        padding: 26,
        borderRadius: 28,
        minHeight: 230,
        elevation: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
    },
    center: { justifyContent: 'center', alignItems: 'center' },
    syncText: { marginTop: 12, color: '#64748B', fontWeight: '600', fontSize: 14 },

    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    stepPillText: { color: '#FFF', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },

    stepDots: { flexDirection: 'row', gap: 5 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    dotDone: { backgroundColor: '#FFF' },
    dotActive: { backgroundColor: 'rgba(255,255,255,0.5)' },
    dotInactive: { backgroundColor: 'rgba(255,255,255,0.2)' },

    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    countBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    countBadgeText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

    cardTitle: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 8 },
    cardSub: { color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 22 },

    miniProgressTrack: {
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        marginTop: 16,
        marginBottom: 4,
    },
    miniProgressFill: { height: 5, backgroundColor: '#FFF', borderRadius: 3 },

    domainTag: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginTop: 14,
        marginBottom: 2,
    },
    domainTagText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

    progressLabelRow: {},
    progressLabelText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
    progressTrack: {
        height: 7,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginVertical: 18,
    },
    progressFill: { height: 7, backgroundColor: '#FFF', borderRadius: 4 },

    whiteBtn: {
        backgroundColor: '#FFF',
        paddingVertical: 15,
        borderRadius: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    btnText: { fontWeight: '800', fontSize: 15 },

    // Recap Card
    recapCard: {
        marginHorizontal: 20,
        marginTop: 22,
        backgroundColor: '#FFFFFF',
        borderRadius: 28,
        padding: 22,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    recapHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recapBadgePill: {
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    recapBadgeText: { fontSize: 10, fontWeight: '800', color: '#4338CA', letterSpacing: 1 },
    recapEmoji: { fontSize: 36 },
    recapDay: { fontSize: 26, fontWeight: '800', color: '#0F172A' },
    recapTopic: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '600' },
    recapDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

    recapSection: { marginBottom: 14 },
    masteredHeading: { fontSize: 14, fontWeight: '700', color: '#16A34A', marginBottom: 10 },
    revisionHeading: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 10 },
    chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    masteredChip: {
        backgroundColor: '#F0FDF4',
        borderRadius: 14,
        paddingVertical: 9,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    masteredText: { color: '#166534', fontWeight: '600', fontSize: 13 },

    revisionChip: {
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        paddingVertical: 9,
        paddingHorizontal: 13,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    revisionText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },

    footerBox: {
        marginTop: 14,
        padding: 14,
        backgroundColor: '#F8FAFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E7FF',
    },
    footerText: { fontSize: 13, lineHeight: 20, color: '#475569', fontWeight: '500' },
});