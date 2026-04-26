import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, Keyboard
} from 'react-native';
import axios from 'axios';
import { AUTH_URL } from '../Constants/Api';
import { AuthContext } from '../context/AuthContext';

const DURATION_OPTIONS = ['6 Months', '1 Year', '2 Years', '3 Years', '4 Years'];

const COURSE_CATEGORIES = [
    { label: '💻 Programming & CS', courses: ['Data Structures & Algorithms', 'Full Stack Development', 'React Native', 'Python Programming', 'Java', 'C++', 'System Design'] },
    { label: '🤖 AI & Data', courses: ['Machine Learning', 'Deep Learning', 'Data Science', 'NLP', 'Computer Vision'] },
    { label: '🌐 Web & Mobile', courses: ['React.js', 'Node.js', 'Flutter', 'Android Development', 'iOS Development'] },
    { label: '📊 Core Subjects', courses: ['Database Management', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Discrete Mathematics'] },
    { label: '☁️ Cloud & DevOps', courses: ['AWS', 'Docker & Kubernetes', 'DevOps', 'Cybersecurity'] },
];

const EditLearningInfo = ({ navigation }) => {
    // 🔥 ALIGNED: Destructuring context functions and data
    const { userData, userToken, updateUser, setIsComplete } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [expandedCategory, setExpandedCategory] = useState(null);

    const [formData, setFormData] = useState({
        university: '',
        college: '',
        department: '',
        targetCourse: '',
        courseDuration: '',
        dailyStudyHours: '',
    });

    useEffect(() => {
        prefillForm();
    }, [userData]);

    const prefillForm = () => {
        if (userData) {
            setFormData({
                university: userData.university || '',
                college: userData.college || '',
                department: userData.department || '',
                targetCourse: userData.currentLearning || '',
                courseDuration: userData.courseDuration || '',
                dailyStudyHours: userData.dailyStudyHours ? String(userData.dailyStudyHours) : '',
            });
        }
        setFetching(false);
    };

    const update = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        if (!formData.targetCourse) {
            Alert.alert("Required", "Please select a target course/subject.");
            return false;
        }
        if (!formData.courseDuration) {
            Alert.alert("Required", "Please select your preparation duration.");
            return false;
        }
        if (!formData.dailyStudyHours) {
            Alert.alert("Required", "Please select daily study hours.");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        Keyboard.dismiss();
        setLoading(true);

        try {
            const userId = userData?.id;
            if (!userId || !userToken) {
                Alert.alert("Session Error", "Please log in again.");
                return;
            }

            // 1. Prepare Payload - Ensuring keys match your Django Model
            const payload = {
                university: formData.university.trim() || "Solapur University",
                college: formData.college.trim() || "BMIT Solapur",
                department: formData.department.trim() || "CSE",
                currentLearning: formData.targetCourse,
                courseDuration: formData.courseDuration,
                dailyStudyHours: parseInt(formData.dailyStudyHours),
                profile_complete: true // Matches backend column
            };

            const response = await axios.put(
                `${AUTH_URL}/update-profile/learning/${userId}`, // Added trailing slash just in case
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {

                // 2. SUCCESSFUL BACKEND UPDATE
                // Now we force the Global Context to update
                if (updateUser) {
                    await updateUser({
                        ...userData, // Keep existing fields
                        ...payload,  // Overwrite with new info
                        isComplete: true, // Force the UI flag to true
                    });
                }

                // 3. Double-check secondary flag in Context
                if (setIsComplete) {
                    setIsComplete(true);
                }

                Alert.alert(
                    'Success 🎉',
                    'Academic profile updated! You can now proceed to assessments.',
                    [{
                        text: 'Continue',
                        onPress: () => {
                            // Reset navigation to Home so it triggers a fresh render
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Main' }],
                            });
                        }
                    }]
                );
            }
        } catch (error) {
            console.error("Update Profile Error:", error);
            const errorMsg = error.response?.data?.message || "Check your internet connection.";
            Alert.alert('Update Failed', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Update Learning</Text>
                    <Text style={styles.headerSubtitle}>BMIT Solapur | {formData.department || 'Student'}</Text>
                </View>
            </View>

            <View style={styles.formContainer}>
                <SectionHeader title="🏛️ Institution Details" />
                <InputField label="University" placeholder="Solapur University" value={formData.university} onChangeText={t => update('university', t)} />
                <InputField label="College" placeholder="BMIT College" value={formData.college} onChangeText={t => update('college', t)} />
                <InputField label="Branch" placeholder="e.g. Computer Science" value={formData.department} onChangeText={t => update('department', t)} />

                <SectionHeader title="🎯 Target Subject *" />
                {formData.targetCourse ? (
                    <View style={styles.selectedCourseBox}>
                        <View style={styles.selectedCourseBadge}>
                            <Text style={styles.selectedCourseText}>{formData.targetCourse}</Text>
                            <TouchableOpacity onPress={() => update('targetCourse', '')}><Text style={styles.clearBtn}>✕</Text></TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {!formData.targetCourse && COURSE_CATEGORIES.map(cat => (
                    <View key={cat.label} style={styles.categoryBlock}>
                        <TouchableOpacity
                            style={styles.categoryHeader}
                            onPress={() => setExpandedCategory(expandedCategory === cat.label ? null : cat.label)}
                        >
                            <Text style={styles.categoryLabel}>{cat.label}</Text>
                            <Text style={styles.categoryArrow}>{expandedCategory === cat.label ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        {expandedCategory === cat.label && (
                            <View style={styles.chipsRow}>
                                {cat.courses.map(course => (
                                    <TouchableOpacity
                                        key={course}
                                        style={[styles.chip, formData.targetCourse === course && styles.chipActive]}
                                        onPress={() => { update('targetCourse', course); setExpandedCategory(null); }}
                                    >
                                        <Text style={[styles.chipText, formData.targetCourse === course && styles.chipTextActive]}>{course}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}

                <SectionHeader title="📅 Preparation Duration *" />
                <View style={styles.chipsRow}>
                    {DURATION_OPTIONS.map(d => (
                        <TouchableOpacity key={d} style={[styles.chip, formData.courseDuration === d && styles.chipActive]} onPress={() => update('courseDuration', d)}>
                            <Text style={[styles.chipText, formData.courseDuration === d && styles.chipTextActive]}>{d}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SectionHeader title="⏰ Daily Study Target *" />
                <View style={styles.hoursRow}>
                    {['1', '2', '3', '4', '5', '6'].map(h => (
                        <TouchableOpacity key={h} style={[styles.hourChip, formData.dailyStudyHours === h && styles.hourChipActive]} onPress={() => update('dailyStudyHours', h)}>
                            <Text style={[styles.hourChipText, formData.dailyStudyHours === h && styles.hourChipTextActive]}>{h}h</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Confirm Learning Path →</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const SectionHeader = ({ title }) => <Text style={styles.sectionHeader}>{title}</Text>;
const InputField = ({ label, ...props }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#6366F1', paddingTop: 55, paddingBottom: 28, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
    formContainer: { padding: 20 },
    sectionHeader: { fontSize: 14, fontWeight: '800', color: '#6366F1', marginBottom: 12, marginTop: 15, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
    input: { backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', borderWidth: 1.5, borderColor: '#E2E8F0' },
    selectedCourseBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    selectedCourseBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#6366F1' },
    selectedCourseText: { fontSize: 13, color: '#6366F1', fontWeight: '700' },
    clearBtn: { fontSize: 12, color: '#6366F1', marginLeft: 5 },
    categoryBlock: { marginBottom: 8 },
    categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: '#E2E8F0' },
    categoryLabel: { fontSize: 13, fontWeight: '700', color: '#475569' },
    categoryArrow: { fontSize: 11, color: '#6366F1' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
    chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    chipTextActive: { color: '#FFF' },
    hoursRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    hourChip: { width: 46, height: 46, borderRadius: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2E8F0' },
    hourChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
    hourChipText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
    hourChipTextActive: { color: '#FFF' },
    submitBtn: { backgroundColor: '#6366F1', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 25 },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default EditLearningInfo;