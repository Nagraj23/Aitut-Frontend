import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AUTH_URL } from '../../Constants/Api';

const checkTPOCompletion = (user) => {
    const hasBasic = !!(user?.name && (user?.phoneNo || user?.phone_no) && user?.gender);
    const hasInstitution = !!(user?.college && user?.university);
    return { hasBasic, hasInstitution, allDone: hasBasic && hasInstitution };
};

export default function TPOProfile({ navigation }) {
    const { signOut } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completion, setCompletion] = useState({ hasBasic: false, hasInstitution: false, allDone: false });
    const [branchCount, setBranchCount] = useState(0);
    const [studentCount, setStudentCount] = useState(0);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async () => {
        setLoading(true);
        try {
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const parsed = JSON.parse(local);
                setUser(parsed);
                setCompletion(checkTPOCompletion(parsed));
            }

            // Refresh from backend
            const token = await AsyncStorage.getItem('accessToken');
            if (local && token) {
                const u = JSON.parse(local);
                const res = await axios.get(`${AUTH_URL}/user/${u.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) {
                    setUser(res.data);
                    setCompletion(checkTPOCompletion(res.data));
                    await AsyncStorage.setItem('userDetails', JSON.stringify(res.data));
                }
            }

            // Branch stats
            const stored = await AsyncStorage.getItem('tpo_branches');
            if (stored) {
                const branches = JSON.parse(stored);
                setBranchCount(branches.length);
                setStudentCount(branches.reduce((acc, b) => acc + (b.students?.length || 0), 0));
            }
        } catch (e) {
            console.log('TPO profile load error:', e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: signOut }
        ]);
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6C5CE7" /></View>;
    }

    const completionPct = (completion.hasBasic ? 50 : 0) + (completion.hasInstitution ? 50 : 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* Hero */}
            <View style={styles.hero}>
                <View style={styles.avatarRing}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.name}>{user?.name || 'Placement Officer'}</Text>
                <Text style={styles.roleTag}>PLACEMENT OFFICER</Text>
                {user?.college && <Text style={styles.institution}>{user.college}</Text>}

                {/* Completion */}
                <View style={[
                    styles.completionBadge,
                    { backgroundColor: completion.allDone ? 'rgba(0,184,148,0.2)' : 'rgba(255,200,0,0.2)' }
                ]}>
                    <Text style={styles.completionBadgeText}>
                        {completion.allDone ? '✅ Profile Verified' : `⚠️ ${completionPct}% Complete`}
                    </Text>
                </View>

                {!completion.allDone && (
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
                        </View>
                    </View>
                )}
            </View>

            {/* Stats Strip */}
            <View style={styles.statsStrip}>
                <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{branchCount}</Text>
                    <Text style={styles.statsSub}>Branches</Text>
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{studentCount}</Text>
                    <Text style={styles.statsSub}>Students</Text>
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.statsItem}>
                    <Text style={styles.statsValue}>{completion.allDone ? '✓' : '—'}</Text>
                    <Text style={styles.statsSub}>Verified</Text>
                </View>
            </View>

            {/* Menu */}
            <View style={styles.menuContainer}>
                <Text style={styles.menuGroupLabel}>PROFILE</Text>

                <MenuItem
                    icon="👤"
                    title="Personal Info"
                    subtitle={completion.hasBasic ? 'Name, phone & gender added' : 'Complete your personal details'}
                    status={completion.hasBasic ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('EditBasicInfo')}
                />
                <MenuItem
                    icon="🏛️"
                    title="Institution Details"
                    subtitle={completion.hasInstitution ? `${user?.college} · ${user?.university}` : 'Add college & university'}
                    status={completion.hasInstitution ? 'done' : 'pending'}
                    onPress={() => navigation.navigate('TPOPersonalInfo')}
                />

                <Text style={[styles.menuGroupLabel, { marginTop: 20 }]}>MANAGEMENT</Text>

                <MenuItem
                    icon="📝"
                    title="Register Student"
                    subtitle="Invite a new student via email"
                    status="neutral"
                    onPress={() => navigation.navigate('AddStudent', {})}
                />
                <MenuItem
                    icon="📊"
                    title="Branch Reports"
                    subtitle="View placement analytics"
                    status="neutral"
                    onPress={() => navigation.navigate('BranchReport')}
                />

                <Text style={[styles.menuGroupLabel, { marginTop: 20 }]}>ACCOUNT</Text>

                <TouchableOpacity style={styles.logoutItem} onPress={handleSignOut}>
                    <View style={styles.logoutIconBox}><Text style={{ fontSize: 20 }}>🚪</Text></View>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
}

const MenuItem = ({ icon, title, subtitle, status, onPress }) => {
    const colors = { done: '#00B894', pending: '#FDCB6E', neutral: '#6C5CE7' };
    const icons = { done: '✓', pending: '!', neutral: '→' };
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuIconBox}><Text style={{ fontSize: 20 }}>{icon}</Text></View>
            <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuSub} numberOfLines={1}>{subtitle}</Text>
            </View>
            <View style={[styles.menuDot, { backgroundColor: colors[status] }]}>
                <Text style={styles.menuDotText}>{icons[status]}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    hero: {
        backgroundColor: '#6C5CE7', paddingTop: 60, paddingBottom: 32,
        alignItems: 'center', paddingHorizontal: 20,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
    },
    avatarRing: {
        width: 104, height: 104, borderRadius: 52,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    avatar: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 36, fontWeight: '900', color: '#6C5CE7' },
    name: { color: '#FFF', fontSize: 22, fontWeight: '800' },
    roleTag: { color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.5, marginTop: 4, fontWeight: '700' },
    institution: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 },
    completionBadge: {
        marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12,
    },
    completionBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    progressBarContainer: { marginTop: 12, width: '70%' },
    progressBarBg: { height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
    progressBarFill: { height: 5, backgroundColor: '#FFF', borderRadius: 3 },

    statsStrip: {
        flexDirection: 'row', backgroundColor: '#FFF',
        marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 16,
        elevation: 3, transform: [{ translateY: -4 }],
    },
    statsItem: { flex: 1, alignItems: 'center' },
    statsValue: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
    statsSub: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 3 },
    statsDivider: { width: 1, backgroundColor: '#E2E8F0' },

    menuContainer: { paddingHorizontal: 20, marginTop: 12 },
    menuGroupLabel: {
        fontSize: 10, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 10, marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 10, elevation: 2,
    },
    menuIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    menuText: { flex: 1 },
    menuTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    menuSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    menuDot: {
        width: 26, height: 26, borderRadius: 13,
        justifyContent: 'center', alignItems: 'center',
    },
    menuDotText: { color: '#FFF', fontSize: 11, fontWeight: '800' },

    logoutItem: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFF2F2', borderRadius: 18, padding: 16,
        borderWidth: 1, borderColor: '#FEE2E2',
    },
    logoutIconBox: {
        width: 44, height: 44, borderRadius: 13,
        backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    logoutText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#EF4444' },
});