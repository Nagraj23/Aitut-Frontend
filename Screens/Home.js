import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    ActivityIndicator, RefreshControl, StatusBar, SafeAreaView, Alert, Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import {AI_URL, ASSESSMENT_URL} from '../Constants/Api';

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

    // Separate standalone recap loader
    const loadRecap = async (currentUserId, currentToken) => {
        const targetId = currentUserId || userData?.id;
        const targetToken = currentToken || userToken;

        if (!targetId || !targetToken) return;

        try {
            console.log(`🚀 Hitting backend for Recap: ${ASSESSMENT_URL}/today_recap/${targetId}`);
            const res = await axios.get(`${AI_URL}/today_recap/${targetId}`, {
                headers: { Authorization: `Bearer ${targetToken}` }
            });
            console.log("✅ Recap Payload Data received:", res.data);
            setRecap(res.data);
        } catch (err) {
            console.log("❌ HomeScreen Recap API Error:", err.message);
        }
    };

    // Force call when userData and token populates reactively
    useEffect(() => {
        if (userData?.id && userToken) {
            loadRecap(userData.id, userToken);
        }
    }, [userData?.id, userToken]);

    // Keep status parameters in sync with changes in auth mapping
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
     * SYNC LOGIC: Background data refresh
     */
    const syncAllData = async (isManualRefresh = false) => {
        // Fallback safety to stop premature empty calls
        if (!userData?.id || !userToken) {
            setLoading(false);
            return;
        }

        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            console.log(`🚀 Hitting backend for Status: ${ASSESSMENT_URL}/user-status/${userData.id}/`);
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

            // Keep recap synced up in the background too
            await loadRecap(userData.id, userToken);

        } catch (e) {
            console.log("❌ HomeScreen Sync All Data Error:", e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userData?.id && userToken) {
                syncAllData();
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
                await syncAllData();
            }
        } catch (err) {
            Alert.alert("Error", "Could not build roadmap. Please try again.");
            setLoading(false);
        }
    };

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
                <View style={[styles.card, { backgroundColor: '#64748B' }]}>
                    <Text style={styles.cardLabel}>STEP 1: ACCOUNT</Text>
                    <Text style={styles.cardTitle}>Complete Academic Info</Text>
                    <Text style={styles.cardSub}>Update your branch and university details to unlock AI features.</Text>
                    <TouchableOpacity style={styles.whiteBtn} onPress={() => navigation.navigate('EditLearningInfo')}>
                        <Text style={[styles.btnText, { color: '#64748B' }]}>Finish Profile →</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (status.test_count < 3) {
            return (
                <View style={[styles.card, { backgroundColor: '#4F46E5' }]}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.cardLabel}>STEP 2: DIAGNOSTIC</Text>
                        <Text style={styles.badgeText}>{status.test_count}/3 Done</Text>
                    </View>
                    <Text style={styles.cardTitle}>Verify Your Skills</Text>
                    <Text style={styles.cardSub}>Complete {Math.max(0, 3 - status.test_count)} more tests for AI mapping.</Text>
                    <TouchableOpacity style={styles.whiteBtn} onPress={() => navigation.navigate('DiagnosticTest')}>
                        <Text style={[styles.btnText, { color: '#4F46E5' }]}>
                            {status.test_count === 0 ? 'Start Assessment' : `Continue Test ${status.test_count + 1}`} →
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (!status.has_roadmap) {
            return (
                <View style={[styles.card, { backgroundColor: '#7C3AED' }]}>
                    <Text style={styles.cardLabel}>FINAL STEP</Text>
                    <Text style={styles.cardTitle}>Build Your Roadmap</Text>
                    <Text style={styles.cardSub}>Ready to generate your personalized {status.domain || 'Selected'} plan.</Text>
                    <TouchableOpacity style={styles.whiteBtn} onPress={handleGenerateRoadmap}>
                        <Text style={[styles.btnText, { color: '#7C3AED' }]}>Generate Now →</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: '#9788FB' }]}
                onPress={() => navigation.navigate('Roadmap')}
                disabled={isDataLoading}
            >
                <Text style={styles.cardLabel}>PHASE 4: LEARNING</Text>
                <Text style={styles.cardTitle}>{roadmap?.title || "My Learning Path"}</Text>
                <View style={styles.progressContainer}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(5, status.progress))}%` }]} />
                </View>
                <View style={styles.whiteBtn}>
                    {isDataLoading ? (
                        <ActivityIndicator color="#9788FB" size="small" />
                    ) : (
                        <Text style={[styles.btnText, { color: '#9788FB' }]}>Resume Learning →</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const rawName = userData?.name || 'Student';
    const cleanFirstName = typeof rawName === 'string' ? rawName.split(' ')[0] : 'Student';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FE" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => syncAllData(true)} />}
            >
                <View style={styles.header}>
                    <Text style={styles.welcome}>Hello {cleanFirstName}!</Text>
                    <Text style={styles.subWelcome}>
                        {userData?.department || 'Engineering'} • {userData?.university || 'BMIT Solapur'}
                    </Text>
                </View>

                {renderMainCard()}

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <ActionCard label="Profile" icon="🎓" onPress={() => navigation.navigate('EditLearningInfo')} />
                    <ActionCard label="Test" icon="📋" onPress={() => navigation.navigate('DiagnosticTest')} />
                    <ActionCard label="AI Chat" icon="🤖" onPress={() => navigation.navigate('Main', { screen: 'AI-Chat' })} />
                </View>

                {/* FIXED: Open conditional block that detects payload elements accurately */}
                {recap &&
                (recap.mastered?.length > 0 ||
                    recap.loopholes?.length > 0 ||
                    recap.topic) ? (

                    <View style={styles.recapCard}>

                        <View style={styles.recapHeader}>
                            <View>
                                <Text style={styles.recapBadge}>
                                    🎯 DAILY LEARNING RECAP
                                </Text>

                                <Text style={styles.recapTitle}>
                                    Day {recap.day}
                                </Text>

                                <Text style={styles.recapTopic}>
                                    📚 {recap.topic}
                                </Text>
                            </View>

                            <Text style={styles.recapEmoji}>
                                🧠
                            </Text>
                        </View>

                        {recap.mastered?.length > 0 && (
                            <View style={styles.recapSection}>

                                <Text style={styles.masteredHeading}>
                                    🚀 Concepts Mastered
                                </Text>

                                <View style={styles.chipsContainer}>
                                    {recap.mastered.map((item, index) => (
                                        <View key={index} style={styles.masteredChip}>
                                            <Text style={styles.masteredText}>
                                                ✅ {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {recap.loopholes?.length > 0 && (
                            <View style={styles.recapSection}>

                                <Text style={styles.revisionHeading}>
                                    🔥 Revision Needed
                                </Text>

                                <View style={styles.chipsContainer}>
                                    {recap.loopholes.map((item, index) => (
                                        <View key={index} style={styles.revisionChip}>
                                            <Text style={styles.revisionText}>
                                                ⚠️ {item}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={styles.footerBox}>
                            <Text style={styles.footerText}>
                                💡 Keep learning consistently to strengthen weak areas and maintain your streak.
                            </Text>
                        </View>

                    </View>

                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const ActionCard = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
        <View style={styles.iconCircle}>
            <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    scrollContent: { paddingBottom: 40 },
    header: { paddingHorizontal: 20, marginTop: 20, marginBottom: 25 },
    welcome: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
    subWelcome: { color: '#64748B', fontSize: 14, marginTop: 4 },
    card: { marginHorizontal: 20, padding: 24, borderRadius: 32, minHeight: 220, marginBottom: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    center: { justifyContent: 'center', alignItems: 'center' },
    syncText: { marginTop: 12, color: '#64748B', fontWeight: '500', fontSize: 14 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    cardTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 12 },
    cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, marginTop: 8, lineHeight: 22 },
    whiteBtn: { backgroundColor: '#FFF', padding: 16, borderRadius: 18, alignItems: 'center', marginTop: 20 },
    btnText: { fontWeight: 'bold', fontSize: 16 },
    progressContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginVertical: 20 },
    progressFill: { height: 8, backgroundColor: '#FFF', borderRadius: 4 },
    sectionTitle: { paddingHorizontal: 20, fontSize: 19, fontWeight: 'bold', marginTop: 30, marginBottom: 15, color: '#1E293B' },
    actionGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
    actionItem: { flex: 1, backgroundColor: '#FFF', paddingVertical: 20, borderRadius: 24, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
    iconCircle: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
    recapCard: {
        marginHorizontal: 20,
        marginTop: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 22,

        shadowColor: '#0F172A',
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.08,
        shadowRadius: 18,

        elevation: 4,

        borderWidth: 1,
        borderColor: '#EEF2FF'
    },

    recapHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18
    },

    recapBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6366F1',
        letterSpacing: 1
    },

    recapTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        marginTop: 4
    },

    recapTopic: {
        fontSize: 15,
        color: '#64748B',
        marginTop: 4,
        fontWeight: '600'
    },

    recapEmoji: {
        fontSize: 42
    },

    recapSection: {
        marginTop: 16
    },

    masteredHeading: {
        fontSize: 15,
        fontWeight: '700',
        color: '#16A34A',
        marginBottom: 10
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    masteredChip: {
        width: '48%',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    revisionChip: {
        width: '48%',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 10,
    },

    masteredText: {
        textAlign: 'center',
        color: '#166534',
        fontSize: 13,
        fontWeight: '600',
    },

    revisionText: {
        textAlign: 'center',
        color: '#991B1B',
        fontSize: 13,
        fontWeight: '600',
    },
    revisionHeading: {
        fontSize: 15,
        fontWeight: '700',
        color: '#DC2626',
        marginBottom: 10
    },

    masteredChip: {
        backgroundColor: '#F0FDF4',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#BBF7D0'
    },

    revisionChip: {
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FECACA'
    },

    masteredText: {
        color: '#166534',
        fontWeight: '600',
        fontSize: 14
    },

    revisionText: {
        color: '#991B1B',
        fontWeight: '600',
        fontSize: 14
    },

    footerBox: {
        marginTop: 18,
        padding: 14,
        backgroundColor: '#F8FAFC',
        borderRadius: 16
    },

    footerText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#475569',
        fontWeight: '500'
    }
});