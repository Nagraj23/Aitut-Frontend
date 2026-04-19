import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';

const GENDER_OPTIONS = ['MALE', 'FEMALE', 'OTHER'];

const BasicEdit = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        gender: '',
        dateOfBirth: '',   // stored as string "YYYY-MM-DD"
        profilePicUrl: '',
    });

    const [errors, setErrors] = useState({});

    // Pre-fill with existing data
    useEffect(() => {
        prefillForm();
    }, []);

    const prefillForm = async () => {
        try {
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const user = JSON.parse(local);
                setFormData({
                    name: user.name || '',
                    phoneNo: user.phoneNo || '',
                    gender: user.gender || '',
                    dateOfBirth: user.dateOfBirth || '',
                    profilePicUrl: user.profilePicUrl || '',
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
        if (!formData.name.trim()) e.name = 'Name is required';
        if (!formData.phoneNo.trim()) e.phoneNo = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phoneNo.trim())) e.phoneNo = 'Must be exactly 10 digits';
        if (!formData.gender) e.gender = 'Please select a gender';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            const details = await AsyncStorage.getItem('userDetails');
            const token = await AsyncStorage.getItem('accessToken');
            const user = JSON.parse(details);

            const payload = {
                name: formData.name.trim(),
                phoneNo: formData.phoneNo.trim(),
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth || null,
                profilePicUrl: formData.profilePicUrl || null,
            };

            const response = await axios.put(
                `${AUTH_URL}/update-profile/basic/${user.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                const updated = response.data;

                // Update AsyncStorage with fresh data
                const currentDetails = JSON.parse(await AsyncStorage.getItem('userDetails') || '{}');
                const merged = {
                    ...currentDetails,
                    name: updated.name || formData.name,
                    id: updated.id || currentDetails.id,
                    role: updated.role || currentDetails.role,
                    isComplete: updated.isComplete,
                    phoneNo: formData.phoneNo,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth,
                };
                await AsyncStorage.setItem('userDetails', JSON.stringify(merged));
                if (updated.accessToken) {
                    await AsyncStorage.setItem('accessToken', updated.accessToken);
                }

                Alert.alert('✅ Updated!', 'Your basic info has been saved.', [
                    { text: 'Done', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Update failed.';
            Alert.alert('Error', String(msg));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FE' }}>
                <ActivityIndicator size="large" color="#9788FB" />
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
                    <Text style={styles.headerTitle}>Basic Info</Text>
                    <Text style={styles.headerSubtitle}>Personal details & contact</Text>
                </View>
            </View>

            <View style={styles.formContainer}>

                {/* Name */}
                <InputField
                    label="Full Name"
                    icon="👤"
                    placeholder="e.g. Nagraj Patil"
                    value={formData.name}
                    onChangeText={(t) => update('name', t)}
                    error={errors.name}
                />

                {/* Phone */}
                <InputField
                    label="Phone Number"
                    icon="📱"
                    placeholder="10-digit number"
                    value={formData.phoneNo}
                    onChangeText={(t) => update('phoneNo', t)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    error={errors.phoneNo}
                />

                {/* Date of Birth */}
                <InputField
                    label="Date of Birth"
                    icon="🎂"
                    placeholder="YYYY-MM-DD (e.g. 2003-05-15)"
                    value={formData.dateOfBirth}
                    onChangeText={(t) => update('dateOfBirth', t)}
                    error={errors.dateOfBirth}
                />

                {/* Gender */}
                <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>⚧ Gender</Text>
                    <View style={styles.genderRow}>
                        {GENDER_OPTIONS.map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.genderBtn,
                                    formData.gender === g && styles.genderBtnActive
                                ]}
                                onPress={() => update('gender', g)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.genderBtnText,
                                    formData.gender === g && styles.genderBtnTextActive
                                ]}>
                                    {g === 'MALE' ? '♂ Male' : g === 'FEMALE' ? '♀ Female' : '⊕ Other'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.submitBtnText}>Save Changes</Text>
                    }
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
};

// Reusable input field
const InputField = ({ label, icon, error, ...props }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{icon} {label}</Text>
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
        backgroundColor: '#9788FB', paddingTop: 55, paddingBottom: 28,
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

    fieldGroup: { marginBottom: 20 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4,
    },
    inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },

    genderRow: { flexDirection: 'row', gap: 10 },
    genderBtn: {
        flex: 1, paddingVertical: 13, borderRadius: 14,
        backgroundColor: '#FFF', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    genderBtnActive: { backgroundColor: '#9788FB', borderColor: '#9788FB' },
    genderBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    genderBtnTextActive: { color: '#FFF' },

    submitBtn: {
        backgroundColor: '#9788FB', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 10,
        elevation: 5, shadowColor: '#9788FB', shadowOpacity: 0.35, shadowRadius: 12,
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default BasicEdit;