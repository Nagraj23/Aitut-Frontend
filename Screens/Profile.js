import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext'; // Added
import { useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';

const checkProfileCompletion = (user) => {
    const phone = user?.phoneNo || user?.phone_no;
    const basicDone = !!(user?.name && phone && user?.gender);
    const academicDone = !!(
        user?.university &&
        (user?.targetCourse || user?.target_course)
    );
    return { basicDone, academicDone, allDone: basicDone && academicDone };
};

const ProfileScreen = ({ navigation }) => {
    const { signOut, userData, userToken, testCount, updateUser } = useContext(AuthContext);
    const { roadmap } = useContext(UserContext); // Added user context for active roadmap metadata

    const completion = checkProfileCompletion(userData);
    const testsCompleted = testCount || 0;

    useFocusEffect(
        useCallback(() => {
            fetchFreshUserData();
        }, [userData?.id, userToken])
    );

    const fetchFreshUserData = async () => {
        if (!userData?.id || !userToken) return;
        try {
            const response = await axios.get(
                `${AUTH_URL}/user/${userData.id}`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data) {
                await updateUser(response.data);
            }
        } catch (e) {
            console.log('Profile background sync error:', e.message);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: signOut }
        ]);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0][0].toUpperCase();
    };

    const getRoleColor = (role) => {
        const colors = { STUDENT: '#9788FB', TEACHER: '#3B82F6', INDIVIDUAL: '#10B981', TPO: '#F97316' };
        return colors[role] || '#9788FB';
    };

    const roleColor = getRoleColor(userData?.role);
    const profileProgress = (completion.basicDone ? 30 : 0) + (completion.academicDone ? 70 : 0);
    const allTestsDone = testsCompleted >= 3;

    // Get current tracking learning scope safe attributes
    const activeSubject = roadmap?.title || roadmap?.subject || userData?.targetCourse || 'My Studies';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Hero ── */}
            <View style={[styles.heroSection, { backgroundColor: roleColor }]}>
                <View style={styles.avatarRing}>
                    <View style={[styles.avatar, { borderColor: roleColor }]}>
                        <Text style={[styles.avatarText, { color: roleColor }]}>
                            {getInitials(userData?.name)}
                        </Text>
                    </View>
                </View>

                <Text style={styles.userName}>{userData?.name || 'Your Name'}</Text>
                <Text style={styles.userEmail}>{userData?.email || ''}</Text>

                <View style={styles.roleBadge}>
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                        {userData?.role || 'STUDENT'}
                    </Text>
                </View>

                <View style={[
                    styles.completionBadge,
                    { backgroundColor: completion.allDone ? 'rgba(74,222,128,0.2)' : 'rgba(255,200,0,0.2)' }
                ]}>
                    <Text style={styles.completionBadgeText}>
                        {completion.allDone ? '✅ Profile Complete' : '⚠️ Profile Incomplete'}
                    </Text>
                </View>

                {!completion.allDone && (
                    <View style={styles.completionBarContainer}>
                        <View style={styles.completionBarBg}>
                            <View style={[styles.completionBarFill, { width: `${profileProgress}%` }]} />
                        </View>
                        <Text style={styles.completionPercent}>{profileProgress}% complete</Text>
                    </View>
                )}
            </View>

            {/* ── Info Strip ── */}
            {(userData?.university || userData?.department) && (
                <View style={styles.infoStrip}>
                    {userData?.university && (
                        <View style={styles.infoChip}>
                            <Text style={styles.infoChipIcon}>🏛️</Text>
                            <Text style={styles.infoChipText} numberOfLines={1}>{userData.university}</Text>
                        </View>
                    )}
                    {userData?.department && (
                        <View style={styles.infoChip}>
                            <Text style={styles.infoChipIcon}>📚</Text>
                            <Text style={styles.infoChipText} numberOfLines={1}>{userData.department}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* ── Sections ── */}
            <View style={styles.sectionsContainer}>
                <Text style={styles.sectionGroupLabel}>PROFILE SETTINGS</Text>

                <ProfileMenuItem
                    icon="👤"
                    title="Basic Info"
                    subtitle={completion.basicDone ? 'Name, phone & gender added' : 'Add your personal details'}
                    status={completion.basicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditBasicInfo')}
                />

                <ProfileMenuItem
                    icon="🎓"
                    title="Academic Info"
                    subtitle={completion.academicDone
                        ? `${userData?.targetCourse || 'Course'} · ${userData?.university || ''}`
                        : 'Add university & course details'}
                    status={completion.academicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>LEARNING</Text>

                <ProfileMenuItem
                    icon="🗺️"
                    title="My Roadmap"
                    subtitle={allTestsDone
                        ? 'View your AI learning path'
                        : `Complete ${3 - testsCompleted} more test${3 - testsCompleted !== 1 ? 's' : ''} to unlock`}
                    status={allTestsDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('Roadmap')}
                />

                <ProfileMenuItem
                    icon="📋"
                    title="My Tests"
                    subtitle={`${testsCompleted}/3 assessment tests completed`}
                    status={allTestsDone ? 'done' : 'neutral'}
                    onPress={() => navigation.navigate('TestScreen')}
                />

                {/* ── New Reminder Navigation Integration Button ── */}
                <ProfileMenuItem
                    icon="⏰"
                    title="Study Reminders"
                    subtitle={`Set daily alarms for ${activeSubject}`}
                    status={allTestsDone ? 'neutral' : 'neutral'}
                    onPress={() => navigation.navigate('Reminder', {
                        subjectName: activeSubject,
                        roadmapId: roadmap?.id || null
                    })}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>ACCOUNT</Text>

                <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut} activeOpacity={0.7}>
                    <View style={styles.logoutIconBox}>
                        <Text style={styles.menuIcon}>🚪</Text>
                    </View>
                    <Text style={styles.logoutText}>Sign Out</Text>
                    <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const ProfileMenuItem = ({ icon, title, subtitle, status, onPress }) => {
    const statusColors = { done: '#4ADE80', pending: '#FBBF24', neutral: '#9788FB' };
    const statusIcons  = { done: '✓', pending: '!', neutral: '→' };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconBox}>
                <Text style={styles.menuIcon}>{icon}</Text>
            </View>
            <View style={styles.menuTextGroup}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text>
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
        paddingTop: 60, paddingBottom: 32,
        alignItems: 'center', paddingHorizontal: 20,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    },
    avatarRing: {
        width: 104, height: 104, borderRadius: 52,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatar: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#FFF', borderWidth: 3,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 32, fontWeight: '900' },
    userName: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
    userEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3 },
    roleBadge: {
        backgroundColor: '#FFF', marginTop: 10,
        paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
    },
    roleBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    completionBadge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
    completionBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    completionBarContainer: { marginTop: 14, width: '80%', alignItems: 'center' },
    completionBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: '100%' },
    completionBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
    completionPercent: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 5 },
    infoStrip: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: '#FFF', marginHorizontal: 20, marginTop: -1,
        borderRadius: 16, elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
        transform: [{ translateY: -20 }],
    },
    infoChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoChipIcon: { fontSize: 13 },
    infoChipText: { fontSize: 12, color: '#475569', fontWeight: '600', maxWidth: 130 },
    sectionsContainer: { paddingHorizontal: 20, marginTop: -4 },
    sectionGroupLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 10, marginLeft: 4, marginTop: 30,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 18,
        padding: 16, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    },
    menuIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    menuIcon: { fontSize: 20 },
    menuTextGroup: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    menuSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    menuStatusDot: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
    },
    menuStatusIcon: { color: '#FFF', fontSize: 11, fontWeight: '800' },
    menuArrow: { fontSize: 16, color: '#CBD5E1' },
    logoutItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF2F2', borderRadius: 18,
        padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#FEE2E2',
    },
    logoutIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    logoutText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;