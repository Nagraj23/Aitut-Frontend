import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, ToastAndroid,
    KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { AUTH_URL } from '../Constants/Api';

const EditProfileScreen = ({ route, navigation }) => {
    const { type } = route.params;
    const { signIn, userToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [formData, setFormData] = useState({
        name: '', phoneNo: '', gender: '', profilePicUrl: '',
        college: '', university: '', department: '',
        courseDuration: '', dailyStudyHours: ''
    });
    const [targetCourses, setTargetCourses] = useState([]);
    const [courseInput, setCourseInput] = useState('');

    useEffect(() => {
        loadCurrentData();
    }, []);

    const loadCurrentData = async () => {
        try {
            const details = await AsyncStorage.getItem('userDetails');
            if (details) {
                const user = JSON.parse(details);
                setCurrentUserId(user.id);
                setFormData({
                    ...user,
                    dailyStudyHours: user.dailyStudyHours ? String(user.dailyStudyHours) : ''
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

    const handleUpdate = async () => {
        if (!formData.name && type === 'basic') {
            Alert.alert("Required", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            const endpoint = type === 'basic' ? 'update-profile/basic' : 'update-profile/learning';
            const payload = type === 'basic' ? {
                name: formData.name,
                phoneNo: formData.phoneNo,
                gender: formData.gender,
                profilePicUrl: formData.profilePicUrl
            } : {
                college: formData.college,
                university: formData.university,
                department: formData.department,
                targetCourse: targetCourses.join(', '),
                courseDuration: formData.courseDuration,
                dailyStudyHours: parseInt(formData.dailyStudyHours) || 0
            };

            const response = await fetch(`${AUTH_URL}/${endpoint}/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const existingDetails = JSON.parse(await AsyncStorage.getItem('userDetails'));
                const updatedDetails = { ...existingDetails, ...payload };
                await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));
                await signIn(updatedDetails);

                ToastAndroid.show("Profile Updated!", ToastAndroid.SHORT);
                navigation.goBack();
            } else {
                const err = await response.text();
                Alert.alert("Update Failed", err);
            }
        } catch (e) {
            Alert.alert("Error", "Server is unreachable. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#9788FB" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {/* Enhanced Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {type === 'basic' ? 'Personal Details' : 'Academic Setup'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {type === 'basic'
                            ? 'Update your account identity'
                            : 'Refine your learning path and goals'}
                    </Text>
                </View>

                <View style={styles.formCard}>
                    {type === 'basic' ? (
                        <>
                            <InputField label="FULL NAME" icon="👤" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} placeholder="Enter full name" />
                            <InputField label="PHONE NUMBER" icon="📞" value={formData.phoneNo} onChange={(v) => setFormData({...formData, phoneNo: v})} keyboardType="phone-pad" placeholder="+91 ..." />
                            <InputField label="GENDER" icon="⚧" value={formData.gender} onChange={(v) => setFormData({...formData, gender: v})} placeholder="Male / Female / Other" />
                        </>
                    ) : (
                        <>
                            <InputField label="COLLEGE NAME" icon="🏫" value={formData.college} onChange={(v) => setFormData({...formData, college: v})} placeholder="e.g. BMIT Solapur" />
                            <InputField label="UNIVERSITY" icon="🏢" value={formData.university} onChange={(v) => setFormData({...formData, university: v})} placeholder="e.g. Solapur University" />

                            <Text style={styles.sectionTitle}>TARGET COURSES</Text>
                            <View style={styles.tagInputContainer}>
                                <View style={styles.chipWrapper}>
                                    {targetCourses.map((course, index) => (
                                        <View key={index} style={styles.chip}>
                                            <Text style={styles.chipText}>{course}</Text>
                                            <TouchableOpacity onPress={() => setTargetCourses(targetCourses.filter((_, i) => i !== index))}>
                                                <Text style={styles.chipClose}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TextInput
                                        style={styles.ghostInput}
                                        value={courseInput}
                                        onChangeText={setCourseInput}
                                        placeholderTextColor="#94A3B8"
                                        onSubmitEditing={() => {
                                            if(courseInput.trim()){
                                                setTargetCourses([...targetCourses, courseInput.trim()]);
                                                setCourseInput('');
                                            }
                                        }}
                                        placeholder={targetCourses.length === 0 ? "Add course (e.g. Java)" : "Add more..."}
                                    />
                                </View>
                            </View>

                            <InputField label="DAILY STUDY HOURS" icon="⏱️" value={formData.dailyStudyHours} onChange={(v) => setFormData({...formData, dailyStudyHours: v})} keyboardType="numeric" placeholder="e.g. 4" />
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.disabledBtn]}
                        onPress={handleUpdate}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Reusable Enhanced Input Component
const InputField = ({ label, value, onChange, keyboardType = 'default', placeholder, icon }) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={styles.inputContainer}>
            <Text style={styles.fieldIcon}>{icon}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="#CBD5E1"
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 25,
        paddingTop: 50,
        paddingBottom: 30,
        backgroundColor: '#9788FB',
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35
    },
    backBtn: { marginBottom: 15 },
    backIcon: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#FFF', fontSize: 26, fontWeight: '800', letterSpacing: 0.5 },
    subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 6, lineHeight: 20 },

    formCard: {
        marginTop: -20,
        marginHorizontal: 20,
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 20,
        elevation: 10,
        shadowColor: '#9788FB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        marginBottom: 30
    },

    inputWrapper: { marginBottom: 20 },
    inputLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    fieldIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1E293B', fontWeight: '500' },

    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 8, marginLeft: 4 },
    tagInputContainer: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 15,
        padding: 10,
        minHeight: 60,
        marginBottom: 20
    },
    chipWrapper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
    chip: {
        flexDirection: 'row',
        backgroundColor: '#9788FB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        margin: 4,
        alignItems: 'center'
    },
    chipText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    chipClose: { color: '#FFF', marginLeft: 8, fontSize: 14, fontWeight: 'bold' },
    ghostInput: { flex: 1, minWidth: 120, height: 40, fontSize: 14, color: '#1E293B', paddingLeft: 5 },

    submitBtn: {
        backgroundColor: '#9788FB',
        paddingVertical: 16,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#9788FB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    disabledBtn: { backgroundColor: '#CBD5E1' },
    submitText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});

export default EditProfileScreen;