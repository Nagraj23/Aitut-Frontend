import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AUTH_URL } from '../../Constants/Api';

export default function TPOPersonalInfo({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        college: '',
        university: '',
        department: '',
    });

    useEffect(() => { prefill(); }, []);

    const prefill = async () => {
        try {
            const local = await AsyncStorage.getItem('userDetails');
            if (local) {
                const u = JSON.parse(local);
                setForm({
                    college: u.college || '',
                    university: u.university || '',
                    department: u.department || '',
                });
            }
        } catch (e) { console.log(e); }
        finally { setFetching(false); }
    };

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        if (!form.college.trim() || !form.university.trim()) {
            Alert.alert('Required', 'College and University are required.');
            return;
        }
        setLoading(true);
        try {
            const local = await AsyncStorage.getItem('userDetails');
            const token = await AsyncStorage.getItem('accessToken');
            const u = JSON.parse(local);

            // Use the learning profile endpoint since it accepts college/university
            await axios.put(
                `${AUTH_URL}/update-profile/learning/${u.id}`,
                {
                    college: form.college.trim(),
                    university: form.university.trim(),
                    department: form.department.trim() || null,
                    targetCourse: u.targetCourse || 'Placement',
                    courseDuration: u.courseDuration || '4 Years',
                    dailyStudyHours: u.dailyStudyHours || 1,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local cache
            const merged = { ...u, ...form };
            await AsyncStorage.setItem('userDetails', JSON.stringify(merged));

            Alert.alert('✅ Saved!', 'Institution details updated.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Could not save. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color="#6C5CE7" size="large" /></View>;

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Institution Details</Text>
                    <Text style={styles.headerSub}>College & university info</Text>
                </View>
            </View>

            <View style={styles.content}>
                {[
                    { key: 'college', label: 'College / Institute *', placeholder: 'e.g. BMIT Solapur' },
                    { key: 'university', label: 'University *', placeholder: 'e.g. Solapur University' },
                    { key: 'department', label: 'Department (optional)', placeholder: 'e.g. Training & Placement Cell' },
                ].map(field => (
                    <View key={field.key} style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={field.placeholder}
                            placeholderTextColor="#CBD5E1"
                            value={form[field.key]}
                            onChangeText={(t) => update(field.key, t)}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Details →</Text>}
                </TouchableOpacity>
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
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1,
    },
    saveBtn: {
        backgroundColor: '#6C5CE7', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 10, elevation: 5,
    },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});