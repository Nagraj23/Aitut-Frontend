import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import  {AUTH_URL} from "../Constants/Api";

const EditBasicInfoScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    // Initial state is empty as per your requirement
    const [formData, setFormData] = useState({
        name: '',
        phoneNo: '',
        gender: '',
    });

    const handleUpdate = async () => {
        if (!formData.name || !formData.phoneNo || !formData.gender) {
            Alert.alert("Missing Fields", "Please fill in all basic details.");
            return;
        }

        setLoading(true);
        try {
            const details = await AsyncStorage.getItem('userDetails');
            const user = JSON.parse(details);

            // API Call to the route shown in your logs
            const response = await axios.put(
                `${AUTH_URL}/update-profile/basic/${user.id}`,
                formData
            );

            if (response.data) {
                // Log for debugging to see exactly what Spring returned
                console.log("Spring Response:", response.data);

                const { accessToken, userId, name, role, isComplete } = response.data;

                // 1. Update userDetails (keep the ID, but update the Name)
                const updatedDetails = {
                    id: userId,
                    name: name,
                    role: role
                };
                await AsyncStorage.setItem('userDetails', JSON.stringify(updatedDetails));

                // 2. Update the completion gatekeeper
                // Note: Use 'isComplete' to match your Spring AuthResponse field name
                await AsyncStorage.setItem('isComplete', String(isComplete));

                // 3. Update token if your Spring service generates a new one on profile update
                if (accessToken) {
                    await AsyncStorage.setItem('userToken', accessToken);
                }

                Alert.alert("Success", "Basic profile updated!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to update profile. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Basic Info</Text>
                <Text style={styles.subtitle}>Step 1: Personal Details</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    value={formData.phoneNo}
                    onChangeText={(text) => setFormData({ ...formData, phoneNo: text })}
                />

                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderRow}>
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                        <TouchableOpacity
                            key={g}
                            style={[
                                styles.genderOption,
                                formData.gender === g && styles.genderSelected
                            ]}
                            onPress={() => setFormData({ ...formData, gender: g })}
                        >
                            <Text style={[
                                styles.genderText,
                                formData.gender === g && styles.genderTextActive
                            ]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.submitBtnText}>Update Basic Profile</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { padding: 30, backgroundColor: '#9788FB' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
    subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
    form: { padding: 20, marginTop: 10 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 20 },
    input: {
        backgroundColor: '#F8F9FE',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        fontSize: 16
    },
    genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    genderOption: {
        flex: 1,
        padding: 12,
        marginHorizontal: 5,
        borderRadius: 10,
        backgroundColor: '#F8F9FE',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    genderSelected: { backgroundColor: '#9788FB', borderColor: '#9788FB' },
    genderText: { color: '#64748B', fontWeight: 'bold' },
    genderTextActive: { color: '#FFF' },
    submitBtn: {
        backgroundColor: '#9788FB',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#9788FB',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5
    },
    submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default EditBasicInfoScreen;