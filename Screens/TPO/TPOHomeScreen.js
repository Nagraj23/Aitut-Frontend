import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar, ActivityIndicator,
    Alert, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function TPOHomeScreen({ navigation }) {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (details) setUser(JSON.parse(details));

            const stored = await AsyncStorage.getItem('tpo_branches');
            setBranches(stored ? JSON.parse(stored) : []);
        } catch (e) {
            console.log('TPO load error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeleteBranch = (branchId, branchName) => {
        Alert.alert(
            'Delete Branch',
            `Remove ${branchName} from dashboard?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive',
                    onPress: async () => {
                        const updated = branches.filter(b => b.id !== branchId);
                        await AsyncStorage.setItem('tpo_branches', JSON.stringify(updated));
                        setBranches(updated);
                    }
                }
            ]
        );
    };

    const renderBranchCard = (item) => {
        const studentCount = item.students?.length || 0;
        const placed = item.students?.filter(s => s.status === 'Placed').length || 0;
        const progress = item.total > 0 ? Math.round((placed / item.total) * 100) : 0;

        return (
            <TouchableOpacity
                key={item.id}
                style={styles.branchCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('BranchStudents', { branchId: item.id })}
                onLongPress={() => handleDeleteBranch(item.id, item.short)}
            >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.emojiBox, { backgroundColor: item.color + '18' }]}>
                        <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                    </View>
                    <View style={styles.cardHeaderText}>
                        <Text style={styles.branchName}>{item.short} Engineering</Text>
                        <Text style={styles.branchFullName}>{item.name}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: item.color + '18' }]}>
                        <Text style={[styles.statusPillText, { color: item.color }]}>Active</Text>
                    </View>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statBig, { color: item.color }]}>{studentCount}</Text>
                        <Text style={styles.statSub}>Added</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statBig}>{item.total}</Text>
                        <Text style={styles.statSub}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statBig}>{placed}</Text>
                        <Text style={styles.statSub}>Placed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statBig, { color: '#2D3436' }]}>{progress}%</Text>
                        <Text style={styles.statSub}>Success</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, {
                        width: `${progress}%`,
                        backgroundColor: item.color
                    }]} />
                </View>

                <Text style={styles.tapHint}>Tap to view students • Long press to delete</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F9" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={['#6C5CE7']} />
                }
            >
                {/* TPO Header */}
                <View style={styles.tpoHeader}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                        </Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.tpoName}>{user?.name || 'Placement Officer'}</Text>
                        <Text style={styles.tpoRole}>
                            {user?.college || user?.university || 'TPO Dashboard'}
                        </Text>
                    </View>
                </View>

                {/* Summary Strip */}
                <View style={styles.summaryStrip}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{branches.length}</Text>
                        <Text style={styles.summarySub}>Branches</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {branches.reduce((acc, b) => acc + (b.students?.length || 0), 0)}
                        </Text>
                        <Text style={styles.summarySub}>Students</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                            {branches.reduce((acc, b) =>
                                acc + (b.students?.filter(s => s.status === 'Placed').length || 0), 0)}
                        </Text>
                        <Text style={styles.summarySub}>Placed</Text>
                    </View>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Branch Overview</Text>
                    <TouchableOpacity
                        style={styles.addBranchBtn}
                        onPress={() => navigation.navigate('AddBranch')}
                    >
                        <Text style={styles.addBranchBtnText}>+ Add Branch</Text>
                    </TouchableOpacity>
                </View>

                {/* Branch Cards */}
                <View style={styles.cardsContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 40 }} />
                    ) : branches.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🏫</Text>
                            <Text style={styles.emptyTitle}>No Branches Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Tap "Add Branch" to start tracking your departments.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate('AddBranch')}
                            >
                                <Text style={styles.emptyBtnText}>Add First Branch →</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        branches.map(renderBranchCard)
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F9' },

    tpoHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24,
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        elevation: 3,
    },
    avatarCircle: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#6C5CE7', justifyContent: 'center',
        alignItems: 'center', marginRight: 14,
    },
    avatarText: { fontSize: 22, fontWeight: '900', color: '#FFF' },
    headerText: { flex: 1 },
    greeting: { fontSize: 13, color: '#94A3B8' },
    tpoName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    tpoRole: { fontSize: 11, color: '#6C5CE7', fontWeight: '700', marginTop: 2 },

    summaryStrip: {
        flexDirection: 'row', backgroundColor: '#FFF',
        marginHorizontal: 20, marginTop: 16, borderRadius: 18,
        padding: 16, elevation: 2,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
    summarySub: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 3 },
    summaryDivider: { width: 1, backgroundColor: '#E2E8F0' },

    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20,
        marginTop: 24, marginBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    addBranchBtn: {
        backgroundColor: '#6C5CE7', paddingHorizontal: 16,
        paddingVertical: 8, borderRadius: 20,
    },
    addBranchBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

    cardsContainer: { paddingHorizontal: 20 },

    branchCard: {
        backgroundColor: '#FFF', borderRadius: 24, padding: 20,
        marginBottom: 16, elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
    emojiBox: {
        width: 52, height: 52, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    cardHeaderText: { flex: 1 },
    branchName: { fontSize: 17, fontWeight: '800', color: '#1A1A1A' },
    branchFullName: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    statusPill: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    statusPillText: { fontSize: 10, fontWeight: '800' },

    statsRow: {
        flexDirection: 'row', backgroundColor: '#F8F9FD',
        borderRadius: 16, padding: 14, marginBottom: 14,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statBig: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
    statSub: { fontSize: 9, color: '#A0A0A0', fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
    statDivider: { width: 1, backgroundColor: '#E2E8F0' },

    progressBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3 },
    progressFill: { height: 6, borderRadius: 3 },
    tapHint: { fontSize: 10, color: '#CBD5E1', marginTop: 10, textAlign: 'center' },

    emptyState: {
        alignItems: 'center', paddingVertical: 50,
        backgroundColor: '#FFF', borderRadius: 24, marginTop: 10, padding: 30,
    },
    emptyEmoji: { fontSize: 52, marginBottom: 16 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
    emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
    emptyBtn: {
        backgroundColor: '#6C5CE7', marginTop: 24,
        paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16,
    },
    emptyBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});