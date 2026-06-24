import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
    const { roadmap } = useContext(UserContext);

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
        const colors = { STUDENT: '#4F46E5', TEACHER: '#2563EB', INDIVIDUAL: '#059669', TPO: '#EA580C' };
        return colors[role] || '#4F46E5';
    };

    const roleColor = getRoleColor(userData?.role);
    const profileProgress = (completion.basicDone ? 30 : 0) + (completion.academicDone ? 70 : 0);
    const allTestsDone = testsCompleted >= 3;

    const activeSubject = roadmap?.title || roadmap?.subject || userData?.targetCourse || 'My Studies';

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={roleColor} />

            {/* ── Premium Hero Header ── */}
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

                <View style={styles.headerMetaRow}>
                    <View style={styles.roleBadge}>
                        <Text style={[styles.roleBadgeText, { color: roleColor }]}>
                            {userData?.role || 'STUDENT'}
                        </Text>
                    </View>

                    <View style={[
                        styles.completionBadge,
                        { backgroundColor: completion.allDone ? 'rgba(52,211,153,0.15)' : 'rgba(245,158,11,0.15)' }
                    ]}>
                        <Text style={[styles.completionBadgeText, { color: completion.allDone ? '#34D399' : '#F59E0B' }]}>
                            {completion.allDone ? '● Verified' : '○ Incomplete'}
                        </Text>
                    </View>
                </View>

                {!completion.allDone && (
                    <View style={styles.completionBarContainer}>
                        <View style={styles.completionBarBg}>
                            <View style={[styles.completionBarFill, { width: `${profileProgress}%` }]} />
                        </View>
                        <Text style={styles.completionPercent}>{profileProgress}% Details Filled</Text>
                    </View>
                )}
            </View>

            {/* ── Floating Institution Info Strip ── */}
            {(userData?.university || userData?.department) && (
                <View style={styles.infoStrip}>
                    {userData?.university && (
                        <View style={styles.infoChip}>
                            <Text style={styles.infoChipIcon}>🏛️</Text>
                            <Text style={styles.infoChipText} numberOfLines={1}>{userData.university}</Text>
                        </View>
                    )}
                    {userData?.university && userData?.department && <View style={styles.stripDivider} />}
                    {userData?.department && (
                        <View style={styles.infoChip}>
                            <Text style={styles.infoChipIcon}>🎓</Text>
                            <Text style={styles.infoChipText} numberOfLines={1}>{userData.department}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* ── Content Sections ── */}
            <View style={[styles.sectionsContainer, !(userData?.university || userData?.department) && { marginTop: 15 }]}>
                <Text style={styles.sectionGroupLabel}>PROFILE SETTINGS</Text>

                <ProfileMenuItem
                    icon="user"
                    iconColor="#4F46E5"
                    bgColor="#EEF2FF"
                    title="Basic Information"
                    subtitle={completion.basicDone ? 'Personal details updated' : 'Configure your name, phone & gender'}
                    status={completion.basicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditBasicInfo')}
                />

                <ProfileMenuItem
                    icon="book"
                    iconColor="#3B82F6"
                    bgColor="#EFF6FF"
                    title="Academic & Branch Details"
                    subtitle={completion.academicDone
                        ? `${userData?.targetCourse || 'Course'} · ${userData?.university || ''}`
                        : 'Link university and targeted syllabus streams'}
                    status={completion.academicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                />

                <Text style={styles.sectionGroupLabel}>AI LEARNING ENGINE</Text>

                <ProfileMenuItem
                    icon="map"
                    iconColor="#10B981"
                    bgColor="#ECFDF5"
                    title="My Dynamic Roadmap"
                    subtitle={allTestsDone
                        ? 'View active adaptive curriculum path'
                        : `Complete ${3 - testsCompleted} more skill assessment tests to unlock`}
                    status={allTestsDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('Roadmap')}
                />

                <ProfileMenuItem
                    icon="clipboard"
                    iconColor="#8B5CF6"
                    bgColor="#F5F3FF"
                    title="Diagnostic Testing"
                    subtitle={`${testsCompleted}/3 milestones verified`}
                    status={allTestsDone ? 'done' : 'neutral'}
                    onPress={() => navigation.navigate('TestScreen')}
                />

                <ProfileMenuItem
                    icon="alarm"
                    iconColor="#EF4444"
                    bgColor="#FEF2F2"
                    title="Study Reminders & Alarms"
                    subtitle={`Set exact system timers for ${activeSubject}`}
                    status="neutral"
                    onPress={() => navigation.navigate('Reminder', {
                        subjectName: activeSubject,
                        roadmapId: roadmap?.id || null
                    })}
                />

                <Text style={styles.sectionGroupLabel}>SYSTEM</Text>

                <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut} activeOpacity={0.8}>
                    <View style={styles.logoutIconBox}>
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Sign Out Account</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const ProfileMenuItem = ({ icon, iconColor, bgColor, title, subtitle, status, onPress }) => {
    const statusColors = { done: '#10B981', pending: '#F59E0B', neutral: '#6366F1' };
    const statusIcons  = { done: 'checkmark-circle', pending: 'alert-circle', neutral: 'arrow-forward-circle' };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.menuIconBox, { backgroundColor: bgColor }]}>
                <Ionicons name={`${icon}-outline`} size={20} color={iconColor} />
            </View>
            <View style={styles.menuTextGroup}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text>
            </View>
            <Ionicons name={statusIcons[status]} size={20} color={statusColors[status]} style={styles.statusIconStyle} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    heroSection: {
        paddingTop: 50, paddingBottom: 36,
        alignItems: 'center', paddingHorizontal: 20,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    },
    avatarRing: {
        width: 100, height: 104, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    avatar: {
        width: 86, height: 86, borderRadius: 43,
        backgroundColor: '#FFF', borderWidth: 3,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 30, fontWeight: '800' },
    userName: { color: '#FFF', fontSize: 22, fontWeight: '800', letterSpacing: -0.2 },
    userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2, fontWeight: '400' },
    headerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
    roleBadge: {
        backgroundColor: '#FFF',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    },
    roleBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    completionBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    completionBadgeText: { fontSize: 11, fontWeight: '700' },
    completionBarContainer: { marginTop: 18, width: '75%', alignItems: 'center' },
    completionBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2.5, width: '100%' },
    completionBarFill: { height: 5, backgroundColor: '#FFF', borderRadius: 2.5 },
    completionPercent: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 6, fontWeight: '500' },

    // Floating Info Strip Panel
    infoStrip: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
        backgroundColor: '#FFF', marginHorizontal: 20,
        borderRadius: 20, elevation: 3,
        shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10,
        transform: [{ translateY: -18 }],
        borderWidth: 1, borderColor: '#EDF2F7'
    },
    infoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    infoChipIcon: { fontSize: 13 },
    infoChipText: { fontSize: 13, color: '#1E293B', fontWeight: '700', maxWidth: 120 },
    stripDivider: { width: 1, height: 16, backgroundColor: '#E2E8F0' },

    sectionsContainer: { paddingHorizontal: 20, marginTop: -6 },
    sectionGroupLabel: {
        fontSize: 10, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.5, marginBottom: 12, marginLeft: 4, marginTop: 24,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 20,
        padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: '#EDF2F7',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.01, shadowRadius: 3,
    },
    menuIconBox: {
        width: 42, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    menuTextGroup: { flex: 1, paddingRight: 6 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    menuSubtitle: { fontSize: 12, color: '#64748B', marginTop: 3, fontWeight: '400' },
    statusIconStyle: { opacity: 0.95 },

    // System Actions
    logoutItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF5F5', borderRadius: 20,
        padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: '#FEE2E2',
    },
    logoutIconBox: {
        width: 42, height: 44, borderRadius: 14,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    logoutText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;