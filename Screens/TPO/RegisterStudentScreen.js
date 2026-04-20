import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';

const BulkInviteScreen = () => {
    const { role } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        university: '',
        college: '',
        department: '',
        year: '',
        courseDuration: '',
        targetCourse: '',
        tpoId: '',
        students: [] // 🟢 Starts empty now
    });

    useEffect(() => {
        const loadUserId = async () => {
            const user = await AsyncStorage.getItem('userDetails');
            if (user) {
                const parsed = JSON.parse(user);
                setFormData(prev => ({
                    ...prev,
                    tpoId: parsed?.id
                }));
            }
        };
        loadUserId();
    }, []);

    const handleMainChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentChange = (index, name, value) => {
        const updated = [...formData.students];
        updated[index][name] = value;
        setFormData(prev => ({ ...prev, students: updated }));
    };

    const addStudentRow = () => {
        setFormData(prev => ({
            ...prev,
            students: [...prev.students, { name: '', email: '' }]
        }));
    };

    const removeStudentRow = (index) => {
        const updated = formData.students.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, students: updated }));
    };

    const handleSubmit = async () => {
        if (formData.students.length === 0) {
            Alert.alert("Empty List", "Please add at least one student.");
            return;
        }

        try {
            await axios.post(
                'http://localhost:8080/api/auth/tpo/invite-bulk',
                formData
            );
            Alert.alert("🎉 Success", "Invites sent!");
        } catch (err) {
            console.log(err);
            Alert.alert("❌ Error", "Server failed");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.mainWrapper}>
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.header}>🎓 TPO Bulk Invite</Text>

                    {/* Academic Section */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📚 Academic Details</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="🏫 University"
                            placeholderTextColor="#94a3b8"
                            onChangeText={(v) => handleMainChange('university', v)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="🏢 College"
                            placeholderTextColor="#94a3b8"
                            onChangeText={(v) => handleMainChange('college', v)}
                        />

                        <View style={styles.pickerBox}>
                            <Text style={styles.label}>💻 Department</Text>
                            <Picker
                                selectedValue={formData.department}
                                onValueChange={(v) => handleMainChange('department', v)}
                            >
                                <Picker.Item label="Select Department" value="" />
                                <Picker.Item label="CSE" value="CSE" />
                                <Picker.Item label="IT" value="IT" />
                                <Picker.Item label="ECE" value="ECE" />
                                <Picker.Item label="MECH" value="MECH" />
                                <Picker.Item label="CIVIL" value="CIVIL" />
                            </Picker>
                        </View>

                        <View style={styles.pickerBox}>
                            <Text style={styles.label}>🎓 Year</Text>
                            <Picker
                                selectedValue={formData.year}
                                onValueChange={(v) => handleMainChange('year', v)}
                            >
                                <Picker.Item label="Select Year" value="" />
                                <Picker.Item label="1st Year" value="1" />
                                <Picker.Item label="2nd Year" value="2" />
                                <Picker.Item label="3rd Year" value="3" />
                                <Picker.Item label="4th Year" value="4" />
                            </Picker>
                        </View>
                    </View>

                    {/* Dynamic Students Section */}
                    <View style={styles.studentListHeader}>
                        <Text style={styles.cardTitle}>👨‍🎓 Student List ({formData.students.length})</Text>
                        {formData.students.length === 0 && (
                            <Text style={styles.emptyMsg}>No students added yet. Use the + button.</Text>
                        )}
                    </View>

                    {formData.students.map((s, i) => (
                        <View key={i} style={styles.studentCard}>
                            <TouchableOpacity
                                onPress={() => removeStudentRow(i)}
                                style={styles.crossBtn}
                            >
                                <Text style={styles.crossText}>✕</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.input}
                                placeholder="🙋 Name"
                                placeholderTextColor="#94a3b8"
                                value={s.name}
                                onChangeText={(v) => handleStudentChange(i, 'name', v)}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="📧 Email"
                                placeholderTextColor="#94a3b8"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={s.email}
                                onChangeText={(v) => handleStudentChange(i, 'email', v)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>🚀 SEND INVITES</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* 👇 Floating Action Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={addStudentRow}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafc' },
    mainWrapper: { flex: 1 },
    container: { flex: 1, padding: 15 },
    scrollContent: { paddingBottom: 120 },
    header: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginVertical: 20, color: '#1e293b' },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    studentListHeader: { marginBottom: 10, paddingHorizontal: 5 },
    emptyMsg: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#1e293b'
    },
    pickerBox: { backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    label: { fontSize: 12, paddingLeft: 12, paddingTop: 8, fontWeight: '600', color: '#64748b' },
    studentCard: {
        backgroundColor: '#fff',
        padding: 15,
        paddingTop: 20,
        borderRadius: 16,
        marginBottom: 15, // Space between student cards
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        position: 'relative',
        elevation: 2
    },
    crossBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    crossText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    submitBtn: {
        backgroundColor: '#0ea5e9',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20
    },
    submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        backgroundColor: '#22c55e',
        width: 65,
        height: 65,
        borderRadius: 32.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
    },
    fabText: { color: '#fff', fontSize: 35, fontWeight: '300' }
});

export default BulkInviteScreen;