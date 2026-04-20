import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext'; // Added UserContext
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    // 1. Pull data/methods from Contexts
    const { signOut, userToken } = useContext(AuthContext);
    const { roadmap } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completion, setCompletion] = useState({ basicDone: false, academicDone: false, allDone: false });

    // 2. Helper function (kept inside or moved to a utils file)
    const checkProfileCompletion = (userData) => {
        const phone = userData?.phoneNo || userData?.phone_no;
        const basicDone = !!(userData?.name && phone && userData?.gender);
        const academicDone = !!(userData?.university && (userData?.targetCourse || userData?.target_course));
        const allDone = basicDone && academicDone;
        return { basicDone, academicDone, allDone };
    };

    // 3. Optimized Data Loading
    const loadUserData = async () => {
        try {
            // Step A: Load from Cache immediately
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const parsed = JSON.parse(local);
                setUser(parsed);
                setCompletion(checkProfileCompletion(parsed));
                setLoading(false); // Stop loading early if cache exists
            }

            // Step B: Background Refresh (only if we have a token)
            if (!userToken) return;

            // We need the ID from the local user to hit the specific endpoint
            const localUser = local ? JSON.parse(local) : null;
            if (!localUser?.id) return;

            const response = await axios.get(
                `${AUTH_URL}/user/${localUser.id}`,
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            if (response.data) {
                const fresh = response.data;
                setUser(fresh);
                setCompletion(checkProfileCompletion(fresh));
                await AsyncStorage.setItem('userDetails', JSON.stringify(fresh));
            }
        } catch (e) {
            console.log('Profile background sync error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: signOut }
        ]);
    };

    // UI Helpers
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
    };

    if (loading && !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9788FB" />
            </View>
        );
    }

    const roleColor = user?.role === 'TEACHER' ? '#3B82F6' : user?.role === 'TPO' ? '#F97316' : '#9788FB';
    const profileProgress = (completion.basicDone ? 30 : 0) + (completion.academicDone ? 70 : 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Header */}
            <View style={[styles.heroSection, { backgroundColor: roleColor }]}>
                <View style={styles.avatarRing}>
                    <View style={[styles.avatar, { borderColor: roleColor }]}>
                        <Text style={[styles.avatarText, { color: roleColor }]}>{getInitials(user?.name)}</Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>

                <View style={styles.roleBadge}>
                    <Text style={[styles.roleBadgeText, { color: roleColor }]}>{user?.role || 'STUDENT'}</Text>
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

            {/* Info Strip */}
            {(user?.university || user?.department) && (
                <View style={styles.infoStrip}>
                    {user?.university && (
                        <View style={styles.infoChip}>
                            <Text style={styles.infoChipIcon}>🏛️</Text>
                            <Text style={styles.infoChipText} numberOfLines={1}>{user.university}</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.sectionsContainer}>
                <Text style={styles.sectionGroupLabel}>PROFILE SETTINGS</Text>

                <ProfileMenuItem
                    icon="👤"
                    title="Basic Info"
                    subtitle={completion.basicDone ? 'Details updated' : 'Add personal details'}
                    status={completion.basicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditBasicInfo')}
                />

                <ProfileMenuItem
                    icon="🎓"
                    title="Academic Info"
                    subtitle={completion.academicDone ? (user?.targetCourse || 'Course Set') : 'Add university details'}
                    status={completion.academicDone ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditLearningInfo')}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>LEARNING</Text>

                <ProfileMenuItem
                    icon="🗺️"
                    title="My Roadmap"
                    subtitle={roadmap ? "View your progress" : "No roadmap generated"}
                    status="neutral"
                    onPress={() => navigation.navigate('Roadmap')}
                />

                <Text style={[styles.sectionGroupLabel, { marginTop: 24 }]}>ACCOUNT</Text>
                <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut}>
                    <View style={styles.logoutIconBox}><Text style={styles.menuIcon}>🚪</Text></View>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

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

// ... (Styles remain the same as your original code)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' },

    // Hero
    heroSection: {
        paddingTop: 60, paddingBottom: 32,
        alignItems: 'center', paddingHorizontal: 20,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    },
    avatarRing: {
        width: 104, height: 104, borderRadius: 52,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
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
        paddingHorizontal: 16, paddingVertical: 5,
        borderRadius: 20,
    },
    roleBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    completionBadge: {
        marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12,
    },
    completionBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    completionBarContainer: { marginTop: 14, width: '80%', alignItems: 'center' },
    completionBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, width: '100%' },
    completionBarFill: { height: 6, backgroundColor: '#FFF', borderRadius: 3 },
    completionPercent: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 5 },

    // Info strip
    infoStrip: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
        paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: '#FFF', marginHorizontal: 20,
        marginTop: -1, borderRadius: 16,
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
        transform: [{ translateY: -20 }],
    },
    infoChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoChipIcon: { fontSize: 13 },
    infoChipText: { fontSize: 12, color: '#475569', fontWeight: '600', maxWidth: 130 },

    // Sections
    sectionsContainer: { paddingHorizontal: 20, marginTop: -4 },
    sectionGroupLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 10, marginLeft: 4, marginTop: 30
    },

    // Menu items
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 18,
        padding: 16, marginBottom: 10,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5,
    },
    menuIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#F1F5F9', justifyContent: 'center',
        alignItems: 'center', marginRight: 14,
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

    // Logout
    logoutItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF2F2', borderRadius: 18,
        padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#FEE2E2',
    },
    logoutIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#FEE2E2', justifyContent: 'center',
        alignItems: 'center', marginRight: 14,
    },
    logoutText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#EF4444' },
});

export default ProfileScreen;