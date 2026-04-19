import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DURATION_OPTIONS = ['6 Months', '1 Year', '2 Years', '3 Years', '4 Years'];

const EditLearningInfo = ({ navigation }) => {
    
    const { refreshIsComplete } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        university: '',
        college: '',
        department: '',
        targetCourse: '',
        courseDuration: '',
        dailyStudyHours: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => { prefillForm(); }, []);

    const prefillForm = async () => {
        try {
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const user = JSON.parse(local);
                setFormData({
                    university: user.university || '',
                    college: user.college || '',
                    department: user.department || '',
                    targetCourse: user.targetCourse || '',
                    courseDuration: user.courseDuration || '',
                    dailyStudyHours: user.dailyStudyHours ? String(user.dailyStudyHours) : '',
                });
            }
        } catch (e) {
            console.log('Prefill error:', e);
        } finally {
            setFetching(false);
        }
    };

    const update = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    const validate = () => {
        const e = {};
        if (!formData.targetCourse.trim()) e.targetCourse = 'Target course is required';
        if (!formData.courseDuration) e.courseDuration = 'Please select course duration';
        if (!formData.dailyStudyHours) e.dailyStudyHours = 'Daily study hours is required';
        else {
            const h = parseInt(formData.dailyStudyHours);
            if (isNaN(h) || h < 1 || h > 24) e.dailyStudyHours = 'Must be between 1 and 24 hours';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const details = await AsyncStorage.getItem('userDetails');
            const token = await AsyncStorage.getItem('accessToken');
            const user = JSON.parse(details);

            const payload = {
                university: formData.university.trim() || null,
                college: formData.college.trim() || null,
                department: formData.department.trim() || null,
                targetCourse: formData.targetCourse.trim(),
                courseDuration: formData.courseDuration,
                dailyStudyHours: parseInt(formData.dailyStudyHours),
            };

            const response = await axios.put(
                `${AUTH_URL}/update-profile/learning/${user.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                const updated = response.data;

                // Merge into local cache
                const currentDetails = JSON.parse(await AsyncStorage.getItem('userDetails') || '{}');
                const merged = {
                    ...currentDetails,
                    ...formData,
                    dailyStudyHours: parseInt(formData.dailyStudyHours),
                    isComplete: updated.isComplete,
                    id: updated.id || currentDetails.id,
                    name: updated.name || currentDetails.name,
                    role: updated.role || currentDetails.role,
                };
                await AsyncStorage.setItem('userDetails', JSON.stringify(merged));
                if (updated.accessToken) {
                    await AsyncStorage.setItem('accessToken', updated.accessToken);
                }
                // await AsyncStorage.setItem('isComplete', String(updated.isComplete));
                await AsyncStorage.setItem('isComplete', String(updated.isComplete || false));
                await refreshIsComplete?.();

                setSaved(true);

                Alert.alert(
                    '✅ Profile Updated!',
                    updated.isComplete
                        ? 'Profile complete! You can now take the diagnostic test.'
                        : 'Academic info saved.',
                    [
                        {
                            text: updated.isComplete ? 'Start Test' : 'OK',
                            onPress: () => {
                                if (updated.isComplete) {
                                    navigation.navigate('DiagnosticTest');
                                } else {
                                    navigation.goBack();
                                }
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Could not save.';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' }}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Academic Info</Text>
                    <Text style={styles.headerSubtitle}>University, course & study goals</Text>
                </View>
            </View>

            <View style={styles.formContainer}>

                {/* Section: Institution */}
                <SectionHeader title="🏛️ Institution" />

                <InputField
                    label="University"
                    placeholder="e.g. Solapur University"
                    value={formData.university}
                    onChangeText={(t) => update('university', t)}
                />
                <InputField
                    label="College / Institute"
                    placeholder="e.g. BMIT College"
                    value={formData.college}
                    onChangeText={(t) => update('college', t)}
                />
                <InputField
                    label="Branch / Department"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChangeText={(t) => update('department', t)}
                />

                {/* Section: Course */}
                <SectionHeader title="📚 Course Details" />

                <InputField
                    label="Target Course / Subject *"
                    placeholder="e.g. Data Structures, Full Stack Dev"
                    value={formData.targetCourse}
                    onChangeText={(t) => update('targetCourse', t)}
                    error={errors.targetCourse}
                />

                {/* Course Duration Chips */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Course Duration *</Text>
                    <View style={styles.chipsRow}>
                        {DURATION_OPTIONS.map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[styles.chip, formData.courseDuration === d && styles.chipActive]}
                                onPress={() => update('courseDuration', d)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.chipText, formData.courseDuration === d && styles.chipTextActive]}>
                                    {d}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.courseDuration && <Text style={styles.errorText}>{errors.courseDuration}</Text>}
                </View>

                {/* Section: Study Habit */}
                <SectionHeader title="⏰ Study Habit" />

                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Daily Study Hours *</Text>
                    <View style={styles.hoursRow}>
                        {['1', '2', '3', '4', '5', '6', '8'].map(h => (
                            <TouchableOpacity
                                key={h}
                                style={[styles.hourChip, formData.dailyStudyHours === h && styles.hourChipActive]}
                                onPress={() => update('dailyStudyHours', h)}
                            >
                                <Text style={[styles.hourChipText, formData.dailyStudyHours === h && styles.hourChipTextActive]}>
                                    {h}h
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {/* Manual input fallback */}
                    <TextInput
                        style={[styles.input, { marginTop: 10 }, errors.dailyStudyHours && styles.inputError]}
                        placeholder="Or type custom hours (1-24)"
                        placeholderTextColor="#CBD5E1"
                        keyboardType="numeric"
                        value={formData.dailyStudyHours}
                        onChangeText={(t) => update('dailyStudyHours', t)}
                        maxLength={2}
                    />
                    {errors.dailyStudyHours && <Text style={styles.errorText}>{errors.dailyStudyHours}</Text>}
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.submitBtnText}>Save & Continue →</Text>
                    }
                </TouchableOpacity>

                <Text style={styles.hint}>
                    * Required fields. Completing this unlocks the AI diagnostic test.
                </Text>

            </View>
        </ScrollView>
    );
};

const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
);

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
        backgroundColor: '#6366F1', paddingTop: 55, paddingBottom: 28,
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
    headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    formContainer: { padding: 20 },

    sectionHeader: {
        fontSize: 14, fontWeight: '800', color: '#6366F1',
        marginBottom: 14, marginTop: 8,
        paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2FF',
    },
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0',
        elevation: 1,
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },

    // Duration chips
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
        backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    chipTextActive: { color: '#FFF' },

    // Hours chips
    hoursRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hourChip: {
        width: 46, height: 46, borderRadius: 13, justifyContent: 'center',
        alignItems: 'center', backgroundColor: '#FFF',
        borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    hourChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    hourChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    hourChipTextActive: { color: '#FFF' },

    submitBtn: {
        backgroundColor: '#6366F1', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 10,
        elevation: 5, shadowColor: '#6366F1', shadowOpacity: 0.35, shadowRadius: 12,
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    hint: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 14, lineHeight: 18 },
});

export default EditLearningInfo;