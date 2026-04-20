import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, Linking, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_CONFIG = {
    Placed:   { color: '#00B894', bg: '#ECFDF5' },
    Active:   { color: '#6C5CE7', bg: '#EDE9FF' },
    Training: { color: '#FDCB6E', bg: '#FFFBEB' },
    Critical: { color: '#D63031', bg: '#FEF2F2' },
};

export default function BranchWiseStudent({ route, navigation }) {
    const { branchId } = route.params;
    const [branch, setBranch] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        loadBranch();
    }, []));

    const loadBranch = async () => {
        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem('tpo_branches');
            if (stored) {
                const branches = JSON.parse(stored);
                const found = branches.find(b => b.id === branchId);
                if (found) {
                    setBranch(found);
                    setStudents(found.students || []);
                }
            }
        } catch (e) {
            console.log('Load error:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (number) => {
        if (!number) { Alert.alert('No phone', 'This student has no phone number.'); return; }
        Linking.openURL(`tel:${number}`);
    };

    const handleDeleteStudent = (studentId, studentName) => {
        Alert.alert('Remove Student', `Remove ${studentName} from this branch?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: async () => {
                    try {
                        const stored = await AsyncStorage.getItem('tpo_branches');
                        const branches = JSON.parse(stored);
                        const idx = branches.findIndex(b => b.id === branchId);
                        if (idx !== -1) {
                            branches[idx].students = branches[idx].students.filter(s => s.id !== studentId);
                            await AsyncStorage.setItem('tpo_branches', JSON.stringify(branches));
                            setStudents(branches[idx].students);
                        }
                    } catch (e) {
                        Alert.alert('Error', 'Could not remove student.');
                    }
                }
            }
        ]);
    };

    const renderStudent = ({ item }) => {
        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.Active;

        return (
            <View style={styles.studentCard}>
                {/* Top Row */}
                <View style={styles.cardTop}>
                    <View style={[styles.studentAvatar, { backgroundColor: config.bg }]}>
                        <Text style={[styles.studentAvatarText, { color: config.color }]}>
                            {item.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    </View>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <Text style={styles.studentEmail}>{item.email}</Text>
                        <Text style={styles.studentYear}>Year {item.year || '—'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                        <Text style={[styles.statusText, { color: config.color }]}>{item.status}</Text>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{item.progress || 0}%</Text>
                    </View>
                    <View style={styles.progressBg}>
                        <View style={[styles.progressFill, {
                            width: `${item.progress || 0}%`,
                            backgroundColor: config.color
                        }]} />
                    </View>
                </View>

                {/* Stats + Actions */}
                <View style={styles.bottomRow}>
                    <View style={styles.miniStat}>
                        <Text style={styles.miniStatVal}>{item.tests || 0}</Text>
                        <Text style={styles.miniStatLabel}>Tests</Text>
                    </View>
                    <View style={styles.miniStat}>
                        <Text style={[styles.miniStatVal, { color: '#D63031' }]}>{item.missed || 0}</Text>
                        <Text style={styles.miniStatLabel}>Missed</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: config.bg }]}
                        onPress={() => handleCall(item.phone)}
                    >
                        <Text style={[styles.actionBtnText, { color: config.color }]}>📞 Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleDeleteStudent(item.id, item.name)}
                    >
                        <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: branch?.color || '#6C5CE7' }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>
                        {branch ? `${branch.emoji} ${branch.short}` : 'Branch'}
                    </Text>
                    <Text style={styles.headerSub}>
                        {students.length} student{students.length !== 1 ? 's' : ''} tracked
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addStudentBtn}
                    onPress={() => navigation.navigate('AddStudent', { branchId })}
                >
                    <Text style={styles.addStudentBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 50 }} />
            ) : students.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>👥</Text>
                    <Text style={styles.emptyTitle}>No Students Yet</Text>
                    <Text style={styles.emptySubtitle}>Add students to start tracking their progress.</Text>
                    <TouchableOpacity
                        style={styles.emptyBtn}
                        onPress={() => navigation.navigate('AddStudent', { branchId })}
                    >
                        <Text style={styles.emptyBtnText}>Add First Student →</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    renderItem={renderStudent}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FD' },

    header: {
        paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center',
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerCenter: { flex: 1, marginLeft: 14 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
    addStudentBtn: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14,
    },
    addStudentBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

    listContent: { padding: 16, paddingBottom: 50 },

    studentCard: {
        backgroundColor: '#FFF', borderRadius: 22, padding: 18,
        marginBottom: 14, elevation: 2,
    },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    studentAvatar: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    studentAvatarText: { fontSize: 18, fontWeight: '900' },
    studentInfo: { flex: 1 },
    studentName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    studentEmail: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
    studentYear: { fontSize: 11, color: '#CBD5E1', marginTop: 1 },
    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    },
    statusText: { fontSize: 10, fontWeight: '800' },

    progressSection: { marginBottom: 14 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    progressLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
    progressValue: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },
    progressBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3 },
    progressFill: { height: 6, borderRadius: 3 },

    bottomRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5', gap: 8,
    },
    miniStat: { flex: 1, alignItems: 'center' },
    miniStatVal: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
    miniStatLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
    actionBtn: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    },
    actionBtnText: { fontSize: 12, fontWeight: '700' },
    removeBtn: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
    },
    removeBtnText: { color: '#D63031', fontWeight: '800', fontSize: 13 },

    emptyState: {
        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 60,
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