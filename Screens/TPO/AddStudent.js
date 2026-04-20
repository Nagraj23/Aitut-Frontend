import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_URL } from '../../Constants/Api';

const YEAR_OPTIONS = ['1', '2', '3', '4'];

export default function AddStudent({ navigation, route }) {
    const { branchId } = route.params || {};
    const [saving, setSaving] = useState(false);
    const [branch, setBranch] = useState(null);
    const [tpoId, setTpoId] = useState(null);

    // Common branch info (pre-filled from branch data)
    const [branchInfo, setBranchInfo] = useState({
        college: '',
        university: '',
        department: '',
        courseDuration: '4 Years',
    });

    // Student info
    const [student, setStudent] = useState({
        name: '',
        email: '',
        year: '1',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadBranchAndUser();
    }, []);

    const loadBranchAndUser = async () => {
        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (details) {
                const user = JSON.parse(details);
                setTpoId(user.id);
                setBranchInfo(prev => ({
                    ...prev,
                    college: user.college || user.name || '',
                    university: user.university || '',
                }));
            }

            if (branchId) {
                const stored = await AsyncStorage.getItem('tpo_branches');
                if (stored) {
                    const branches = JSON.parse(stored);
                    const found = branches.find(b => b.id === branchId);
                    if (found) {
                        setBranch(found);
                        setBranchInfo(prev => ({
                            ...prev,
                            department: found.short,
                        }));
                    }
                }
            }
        } catch (e) {
            console.log('Load error:', e);
        }
    };

    const updateStudent = (key, val) => {
        setStudent(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    const updateBranchInfo = (key, val) => {
        setBranchInfo(prev => ({ ...prev, [key]: val }));
    };

    const validate = () => {
        const e = {};
        if (!student.name.trim()) e.name = 'Name is required';
        if (!student.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email))
            e.email = 'Valid email is required';
        if (!branchInfo.university.trim()) e.university = 'University is required';
        if (!branchInfo.college.trim()) e.college = 'College is required';
        if (!branchInfo.department.trim()) e.department = 'Department is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAdd = async () => {
        if (!validate()) return;
        setSaving(true);

        try {
            // Build payload matching BulkRequest + StudentBasicInfo DTOs
            const payload = {
                college: branchInfo.college.trim(),
                university: branchInfo.university.trim(),
                department: branchInfo.department.trim(),
                courseDuration: branchInfo.courseDuration,
                tpoId: tpoId,
                students: [
                    {
                        name: student.name.trim(),
                        email: student.email.trim().toLowerCase(),
                        year: parseInt(student.year),
                    }
                ]
            };

            const token = await AsyncStorage.getItem('accessToken');
            await axios.post(
                `${AUTH_URL}/tpo/invite-bulk`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Save student locally to the branch
            if (branchId) {
                const stored = await AsyncStorage.getItem('tpo_branches');
                if (stored) {
                    const branches = JSON.parse(stored);
                    const idx = branches.findIndex(b => b.id === branchId);
                    if (idx !== -1) {
                        branches[idx].students = branches[idx].students || [];
                        branches[idx].students.push({
                            id: Date.now().toString(),
                            name: student.name.trim(),
                            email: student.email.trim().toLowerCase(),
                            year: parseInt(student.year),
                            status: 'Active',
                            progress: 0,
                            tests: 0,
                            missed: 0,
                        });
                        await AsyncStorage.setItem('tpo_branches', JSON.stringify(branches));
                    }
                }
            }

            Alert.alert(
                '✅ Student Added!',
                `Welcome email sent to ${student.email}. They can now login with their email as password.`,
                [{ text: 'Done', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            const msg = error.response?.data || 'Could not add student. Check your connection.';
            Alert.alert('Error', String(msg));
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add Student</Text>
                    <Text style={styles.headerSub}>
                        {branch ? `${branch.emoji} ${branch.short} Department` : 'Invite via email'}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Text style={styles.infoText}>
                        📧 Student will receive a welcome email with login credentials. Their initial password is their email address.
                    </Text>
                </View>

                {/* Student Info */}
                <Text style={styles.sectionLabel}>STUDENT DETAILS</Text>

                <InputField
                    label="Full Name *"
                    placeholder="e.g. Nagraj Patil"
                    value={student.name}
                    onChangeText={(t) => updateStudent('name', t)}
                    error={errors.name}
                />

                <InputField
                    label="Email Address *"
                    placeholder="student@college.edu"
                    value={student.email}
                    onChangeText={(t) => updateStudent('email', t)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                />

                {/* Year Selection */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Academic Year *</Text>
                    <View style={styles.yearRow}>
                        {YEAR_OPTIONS.map(y => (
                            <TouchableOpacity
                                key={y}
                                style={[styles.yearChip, student.year === y && styles.yearChipActive]}
                                onPress={() => updateStudent('year', y)}
                            >
                                <Text style={[styles.yearChipText, student.year === y && styles.yearChipTextActive]}>
                                    Year {y}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Branch Info */}
                <Text style={styles.sectionLabel}>INSTITUTION DETAILS</Text>

                <InputField
                    label="College / Institute *"
                    placeholder="e.g. BMIT College"
                    value={branchInfo.college}
                    onChangeText={(t) => updateBranchInfo('college', t)}
                    error={errors.college}
                />
                <InputField
                    label="University *"
                    placeholder="e.g. Solapur University"
                    value={branchInfo.university}
                    onChangeText={(t) => updateBranchInfo('university', t)}
                    error={errors.university}
                />
                <InputField
                    label="Department *"
                    placeholder="e.g. CSE"
                    value={branchInfo.department}
                    onChangeText={(t) => updateBranchInfo('department', t)}
                    error={errors.department}
                />

                {/* Add Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleAdd}
                    disabled={saving}
                >
                    {saving
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.saveBtnText}>Send Invite & Add Student →</Text>
                    }
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const InputField = ({ label, error, ...props }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholderTextColor="#CBD5E1"
            {...props}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        backgroundColor: '#00B894', paddingTop: 55, paddingBottom: 28,
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
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },

    content: { padding: 20 },

    infoBanner: {
        backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14,
        marginBottom: 20, borderLeftWidth: 3, borderLeftColor: '#00B894',
    },
    infoText: { color: '#065F46', fontSize: 13, lineHeight: 20 },

    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 12, marginTop: 8,
    },

    fieldGroup: { marginBottom: 16 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1,
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 11, marginTop: 4 },

    yearRow: { flexDirection: 'row', gap: 10 },
    yearChip: {
        flex: 1, paddingVertical: 12, borderRadius: 12,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    yearChipActive: { backgroundColor: '#00B894', borderColor: '#00B894' },
    yearChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    yearChipTextActive: { color: '#FFF' },

    saveBtn: {
        backgroundColor: '#00B894', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 20,
        elevation: 5, shadowColor: '#00B894', shadowOpacity: 0.35, shadowRadius: 12,
    },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});