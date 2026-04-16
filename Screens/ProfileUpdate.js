import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, ToastAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { AUTH_URL } from '../Constants/Api';

const EditProfileScreen = ({ navigation }) => {
    const { signIn, userToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [targetCourses, setTargetCourses] = useState([]);
    const [courseInput, setCourseInput] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        gender: '',
        dateOfBirth: '',
        profilePicUrl: '',
        college: '',
        university: '',
        department: '',
        courseDuration: '',
        dailyStudyHours: '',
    });

    useEffect(() => {
        loadCurrentData();
    }, []);

    const loadCurrentData = async () => {
        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (details) {
                const user = JSON.parse(details);
                console.log(user,"profile update");
                setCurrentUserId(user.id);

                setFormData({
                    name: user.name || '',
                    phoneNo: user.phoneNo || '',
                    gender: user.gender || '',
                    dateOfBirth: user.dateOfBirth || '',
                    profilePicUrl: user.profilePicUrl || '',
                    college: user.college || '',
                    university: user.university || '',
                    department: user.department || '',
                    courseDuration: user.courseDuration || '',
                    dailyStudyHours: user.dailyStudyHours ? String(user.dailyStudyHours) : '',
                });

                if (user.targetCourse) {
                    setTargetCourses(user.targetCourse.split(',').map(s => s.trim()).filter(s => s !== ""));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    const addCourse = () => {
        const val = courseInput.trim();
        if (val && !targetCourses.includes(val)) {
            setTargetCourses([...targetCourses, val]);
            setCourseInput('');
        }
    };

    const removeCourse = (index) => {
        setTargetCourses(targetCourses.filter((_, i) => i !== index));
    };

    const handleUpdate = async () => {
        if (!currentUserId) return;
        setLoading(true);
        try {
            const payload = {
                ...formData,
                targetCourse: targetCourses.join(', '),
                dailyStudyHours: parseInt(formData.dailyStudyHours) || 0
            };

            const response = await fetch(`${AUTH_URL}/update-profile/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(payload),
            });

            const resultText = await response.text();

            if (response.ok) {
                const updatedDetails = { ...payload, id: currentUserId, complete: true };
                await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));
                await AsyncStorage.setItem('isComplete', 'true');
                await signIn(updatedDetails);

                ToastAndroid.show(resultText, ToastAndroid.LONG);
                navigation.goBack();
            } else {
                Alert.alert("Update Failed", resultText);
            }
        } catch (e) {
            Alert.alert("Error", "Server unreachable");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <ActivityIndicator style={{flex:1}} size="large" color="#9788FB" />;

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.title}>Academic Profile</Text>
                <Text style={styles.subtitle}>Help Ai-Tut personalize your journey</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.sectionLabel}>Personal & Contact</Text>
                <InputField label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                <InputField label="Phone Number" value={formData.phoneNo} onChange={(v) => setFormData({...formData, phoneNo: v})} keyboardType="phone-pad" />

                <Text style={styles.sectionLabel}>College Details</Text>
                <InputField label="College Name" value={formData.college} onChange={(v) => setFormData({...formData, college: v})} />
                <InputField label="University" value={formData.university} onChange={(v) => setFormData({...formData, university: v})} />
                <InputField label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} />

                <Text style={styles.sectionLabel}>Learning Goals</Text>

                <Text style={styles.label}>Target Courses</Text>
                <View style={styles.tagInputContainer}>
                    <View style={styles.chipWrapper}>
                        {targetCourses.map((course, index) => (
                            <View key={index} style={styles.chip}>
                                <Text style={styles.chipText}>{course}</Text>
                                <TouchableOpacity onPress={() => removeCourse(index)}>
                                    <Text style={styles.chipClose}> ✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TextInput
                            style={styles.ghostInput}
                            value={courseInput}
                            onChangeText={setCourseInput}
                            onSubmitEditing={addCourse}
                            placeholder={targetCourses.length === 0 ? "Add course..." : ""}
                            blurOnSubmit={false}
                        />
                    </View>
                </View>

                <InputField label="Daily Study Hours" value={formData.dailyStudyHours} onChange={(v) => setFormData({...formData, dailyStudyHours: v})} keyboardType="numeric" />

                <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate} disabled={loading}>
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Save Profile</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const InputField = ({ label, value, onChange, keyboardType = 'default', placeholder }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="#CBD5E1"
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { padding: 30, backgroundColor: '#9788FB', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
    form: { padding: 25 },
    sectionLabel: { color: '#9788FB', fontWeight: 'bold', marginTop: 15, marginBottom: 10, fontSize: 12, textTransform: 'uppercase' },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 14, color: '#475569', marginBottom: 5, fontWeight: '500' },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, color: '#1E293B' },

    tagInputContainer: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 8, minHeight: 50, marginBottom: 15 },
    chipWrapper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    chip: { flexDirection: 'row', backgroundColor: '#9788FB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, margin: 4, alignItems: 'center' },
    chipText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
    chipClose: { color: '#FFF', marginLeft: 5, fontWeight: 'bold' },
    ghostInput: { flex: 1, minWidth: 100, height: 40, fontSize: 15, color: '#1E293B', paddingLeft: 5 },

    submitBtn: { backgroundColor: '#9788FB', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 25, elevation: 5 },
    submitText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default EditProfileScreen;