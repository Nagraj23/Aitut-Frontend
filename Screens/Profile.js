import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Dimensions, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // 1. Pull data/methods from Contexts
    const { signOut, userToken, userData, isComplete, testCount, hasRoadmap } = useContext(AuthContext);
    const { roadmap } = useContext(UserContext);

    const [user, setUser] = useState(userData);
    const [loading, setLoading] = useState(false);
    const [completion, setCompletion] = useState({
        basicDone: !!(userData?.phoneNo || userData?.gender),
        academicDone: isComplete || false,
        allDone: isComplete && !!(userData?.phoneNo)
    });

    /**
     * SYNC: Load User Data from Backend to ensure local state is fresh
     */
    const loadUserData = async () => {
        if (!userToken || !userData?.id) return;

        try {
            const response = await axios.get(
                `${AUTH_URL}/user/${userData.id}`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data) {
                const fresh = response.data;
                setUser(fresh);

                // Calculate completion based on fresh data
                const phone = fresh.phoneNo || fresh.phone_no;
                const basic = !!(fresh.name && phone && fresh.gender);
                const academic = !!(fresh.university && fresh.currentLearning);

                setCompletion({
                    basicDone: basic,
                    academicDone: academic,
                    allDone: basic && academic
                });

                // Update local storage for persistence
                await AsyncStorage.setItem('userDetails', JSON.stringify(fresh));
            }
        } catch (e) {
            console.log('Profile background sync error:', e.message);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [userToken, userData?.id])
    );

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: signOut }
        ]);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    };

    const roleColor = user?.role === 'TEACHER' ? '#3B82F6' : user?.role === 'TPO' ? '#F97316' : '#9788FB';

    // Progress calculation for the UI
    const profileProgress = (completion.basicDone ? 50 : 0) + (completion.academicDone ? 50 : 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />

            {/* Hero Header */}
            <View style={[styles.heroSection, { backgroundColor: roleColor }]}>
                <View style={styles.avatarRing}>
                    <View style={[styles.avatar, { borderColor: roleColor }]}>
                        <Text style={[styles.avatarText, { color: roleColor }]}>{getInitials(user?.name)}</Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>

                <View style={styles.roleBadge}>
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user?.role || 'STUDENT'}</Text>
                </View>

                {profileProgress < 100 && (
                    <View style={styles.completionBarContainer}>
                        <View style={styles.completionBarBg}>
                            <View style={[styles.completionBarFill, { width: `${profileProgress}%` }]} />
                        </View>
                        <Text style={styles.completionPercent}>{profileProgress}% Profile Complete</Text>
                    </View>
                )}
            </View>

            {/* Info Strip - Sticky info about Institution */}
            {(user?.university || user?.department) && (
                <View style={styles.infoStrip}>
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipIcon}>🏛️</Text>
                        <Text style={styles.infoChipText} numberOfLines={1}>
                            {user?.college || 'BMIT Solapur'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoChip}>
                        <Text style={styles.infoChipIcon}>🎓</Text>
                        <Text style={styles.infoChipText} numberOfLines={1}>
                            {user?.department || 'CSE'}
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.sectionsContainer}>
                <Text style={styles.sectionGroupLabel}>PROFILE SETTINGS</Text>

                <ProfileMenuItem
                    icon="👤"
                    title="Basic Info"
                    subtitle={completion.basicDone ? 'Personal details updated' : 'Complete your basic profile'}
                    status={completion.basicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditBasicInfo')}
                />

                <ProfileMenuItem
                    icon="📖"
                    title="Academic & Learning"
                    subtitle={completion.academicDone ? (user?.currentLearning || 'Course Set') : 'Add your university & course'}
                    status={completion.academicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>AI LEARNING ENGINE</Text>

                <ProfileMenuItem
                    icon="📋"
                    title="Diagnostic Status"
                    subtitle={`${testCount}/3 tests completed`}
                    status={testCount >= 3 ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('DiagnosticTest')}
                />

                <ProfileMenuItem
                    icon="🗺️"
                    title="My Roadmap"
                    subtitle={hasRoadmap ? (roadmap?.title || "Active Plan") : "No roadmap generated yet"}
                    status={hasRoadmap ? 'neutral' : 'pending'}
                    onPress={() => navigation.navigate('Roadmap')}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>SYSTEM</Text>

                <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut}>
                    <View style={styles.logoutIconBox}><Text style={styles.menuIcon}>🚪</Text></View>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>Version 1.0.4 (AI-TUT Beta)</Text>
            </View>
        </ScrollView>
    );
};

/**
 * Custom Menu Item Component
 */
const ProfileMenuItem = ({ icon, title, subtitle, status, onPress }) => {
    const statusColors = { done: '#4ADE80', pending: '#FBBF24', neutral: '#9788FB' };
    const statusIcons = { done: '✓', pending: '!', neutral: '→' };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuIconBox}><Text style={styles.menuIcon}>{icon}</Text></View>
            <View style={styles.menuTextGroup}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle}>{subtitle}</Text>
            </View>
            <View style={[styles.menuStatusDot, { backgroundColor: statusColors[status] }]}>
                <Text style={styles.menuStatusIcon}>{statusIcons[status]}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    heroSection: {
        paddingTop: 60, paddingBottom: 40,
        alignItems: 'center', paddingHorizontal: 20,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    },
    avatarRing: {
        width: 104, height: 104, borderRadius: 52,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
    },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#FFF', borderWidth: 3,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '900' },
    userName: { color: '#FFF', fontSize: 22, fontWeight: '800' },
    userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 3 },
    roleBadge: {
        backgroundColor: '#FFF', marginTop: 12,
        paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
    },
    roleBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    completionBarContainer: { marginTop: 20, width: '70%', alignItems: 'center' },
    completionBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: '100%' },
    completionBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
    completionPercent: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 6, fontWeight: '600' },

    infoStrip: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 16,
        backgroundColor: '#FFF', marginHorizontal: 20,
        marginTop: -20, borderRadius: 20,
        elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    infoChip: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
    infoChipIcon: { fontSize: 14, marginRight: 6 },
    infoChipText: { fontSize: 13, color: '#1E293B', fontWeight: '700' },
    divider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

    sectionsContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionGroupLabel: {
        fontSize: 11, fontWeight: '900', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 12, marginTop: 30, marginLeft: 4
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 20,
        padding: 16, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    },
    menuIconBox: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: '#F1F5F9', justifyContent: 'center',
        alignItems: 'center', marginRight: 16,
    },
    menuIcon: { fontSize: 20 },
    menuTextGroup: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    menuSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
    menuStatusDot: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
    },
    menuStatusIcon: { color: '#FFF', fontSize: 11, fontWeight: '900' },

    logoutItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 20,
        padding: 16, marginBottom: 10,
        borderWidth: 1.5, borderColor: '#FEE2E2',
    },
    logoutIconBox: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: '#FEF2F2', justifyContent: 'center',
        alignItems: 'center', marginRight: 16,
    },
    logoutText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#EF4444' },
    versionText: { textAlign: 'center', color: '#CBD5E1', fontSize: 11, marginTop: 20, fontWeight: '600' }
});

export default ProfileScreen;