import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function BranchReport({ navigation }) {
    const [branches, setBranches] = useState([]);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async () => {
        const stored = await AsyncStorage.getItem('tpo_branches');
        if (stored) setBranches(JSON.parse(stored));
    };

    const totalStudents = branches.reduce((acc, b) => acc + (b.students?.length || 0), 0);
    const totalPlaced = branches.reduce((acc, b) =>
        acc + (b.students?.filter(s => s.status === 'Placed').length || 0), 0);
    const overallRate = totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Branch Reports</Text>
                    <Text style={styles.headerSub}>Placement analytics overview</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Summary Cards */}
                <View style={styles.summaryRow}>
                    <View style={[styles.summaryCard, { backgroundColor: '#EDE9FF' }]}>
                        <Text style={[styles.summaryValue, { color: '#6C5CE7' }]}>{branches.length}</Text>
                        <Text style={styles.summarySub}>Branches</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#ECFDF5' }]}>
                        <Text style={[styles.summaryValue, { color: '#00B894' }]}>{totalPlaced}</Text>
                        <Text style={styles.summarySub}>Placed</Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: '#FFF7ED' }]}>
                        <Text style={[styles.summaryValue, { color: '#F97316' }]}>{overallRate}%</Text>
                        <Text style={styles.summarySub}>Success Rate</Text>
                    </View>
                </View>

                {/* Per Branch Breakdown */}
                <Text style={styles.sectionLabel}>BRANCH BREAKDOWN</Text>
                {branches.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📊</Text>
                        <Text style={styles.emptyTitle}>No Data Yet</Text>
                        <Text style={styles.emptySubtitle}>Add branches and students to see reports.</Text>
                    </View>
                ) : (
                    branches.map(branch => {
                        const count = branch.students?.length || 0;
                        const placed = branch.students?.filter(s => s.status === 'Placed').length || 0;
                        const rate = count > 0 ? Math.round((placed / count) * 100) : 0;

                        return (
                            <View key={branch.id} style={styles.reportCard}>
                                <View style={styles.reportCardHeader}>
                                    <Text style={{ fontSize: 24 }}>{branch.emoji}</Text>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.reportBranchName}>{branch.short}</Text>
                                        <Text style={styles.reportBranchFull}>{branch.name}</Text>
                                    </View>
                                    <Text style={[styles.reportRate, { color: branch.color }]}>{rate}%</Text>
                                </View>

                                <View style={styles.reportStats}>
                                    <Text style={styles.reportStatText}>👥 {count} students tracked</Text>
                                    <Text style={styles.reportStatText}>✅ {placed} placed</Text>
                                    <Text style={styles.reportStatText}>🎯 {branch.total} total target</Text>
                                </View>

                                <View style={styles.reportBarBg}>
                                    <View style={[styles.reportBarFill, {
                                        width: `${rate}%`,
                                        backgroundColor: branch.color
                                    }]} />
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>📈 Detailed graphs & exports coming soon</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        backgroundColor: '#6C5CE7', paddingTop: 55, paddingBottom: 28,
        paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    content: { padding: 20 },

    summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    summaryCard: { flex: 1, borderRadius: 18, padding: 16, alignItems: 'center' },
    summaryValue: { fontSize: 26, fontWeight: '900' },
    summarySub: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 4 },

    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 14,
    },

    reportCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 18,
        marginBottom: 14, elevation: 2,
    },
    reportCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    reportBranchName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    reportBranchFull: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    reportRate: { fontSize: 22, fontWeight: '900' },
    reportStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reportStatText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
    reportBarBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3 },
    reportBarFill: { height: 6, borderRadius: 3 },

    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    emptySubtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8 },

    comingSoon: {
        backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14,
        marginTop: 10, alignItems: 'center',
    },
    comingSoonText: { color: '#6C5CE7', fontSize: 13, fontWeight: '600' },
});