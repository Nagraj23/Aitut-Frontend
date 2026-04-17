import React, { useState } from "react";
import {
    View,
    Text,
    Alert,
    ToastAndroid,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Image,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { AUTH_URL } from "../Constants/Api";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const ROLES = [
    { label: "Student", value: "STUDENT" },
    { label: "Teacher", value: "TEACHER" },
    { label: "TPO", value: "TPO" },
];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
    });

    const navigation = useNavigation();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [agree, setAgree] = useState(true);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    };

    const validateForm = () => {
        let e = {};
        if (!formData.name) e.name = "Name required";
        if (!validateEmail(formData.email)) e.email = "Invalid email";
        if (formData.password.length < 6) e.password = "Min 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm() || !agree) {
            if (!agree) Alert.alert("Terms", "Please agree to Terms & Conditions");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${AUTH_URL}/register`, formData);

            const message = res.data;

            if (Platform.OS === "android") {
                ToastAndroid.show(message, ToastAndroid.LONG);
            } else {
                Alert.alert("Success", message);
            }

            navigation.navigate("VerifyOTP", {
                email: formData.email,
                type: "ACCOUNT",
            });

        } catch (err) {
            const errorMsg = err.response?.data || "Registration failed";

            Alert.alert(
                "Error",
                errorMsg.includes("Email already registered")
                    ? "Email already exists. Try login or different email."
                    : errorMsg
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={styles.headerBackground}>
                <Text style={styles.brandName}>AiTut</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.formCard}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.welcomeTitle}>Register</Text>
                    <Text style={styles.welcomeSubtitle}>
                        Create new account for better service
                    </Text>

                    {/* 🔥 Name + Role Row */}
                    <View style={styles.row}>
                        {/* Name */}
                        <View style={[styles.inputWrapper, { flex: 0.6 }]}>
                            <Text style={styles.label}>Name</Text>
                            <View style={[styles.inputContainer, errors.name && styles.errorBorder]}>
                                <Feather name="user" size={18} color="#CBD5E1" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Johan"
                                    placeholderTextColor="#CBD5E1"
                                    value={formData.name}
                                    onChangeText={(v) => handleChange("name", v)}
                                />
                            </View>
                        </View>

                        {/* Role */}
                        <View style={[styles.inputWrapper, { flex: 0.4, marginLeft: 10 }]}>
                            <Text style={styles.label}>Role</Text>
                            <View style={styles.inputContainer}>
                                <Picker
                                    selectedValue={formData.role}
                                    style={styles.picker}
                                    dropdownIconColor="#64748B"
                                    onValueChange={(itemValue) =>
                                        handleChange("role", itemValue)
                                    }
                                >
                                    {ROLES.map((r) => (
                                        <Picker.Item
                                            key={r.value}
                                            label={r.label}
                                            value={r.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, errors.email && styles.errorBorder]}>
                            <Feather name="mail" size={18} color="#CBD5E1" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="example@gmail.com"
                                placeholderTextColor="#CBD5E1"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(v) => handleChange("email", v)}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputContainer, errors.password && styles.errorBorder]}>
                            <Feather name="lock" size={18} color="#CBD5E1" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="password"
                                placeholderTextColor="#CBD5E1"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) => handleChange("password", v)}
                            />
                        </View>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Sign up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.signInText}> Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#9788FB" },

    headerBackground: {
        height: "25%",
        alignItems: "center",
        paddingTop: 50,
    },

    brandName: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },

    formCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -30,
        paddingHorizontal: 25,
    },

    scrollContent: { paddingTop: 20, paddingBottom: 40 },

    welcomeTitle: {
        fontSize: 34,
        fontWeight: "bold",
        textAlign: "center",
        color: "#1E293B",
    },

    welcomeSubtitle: {
        fontSize: 15,
        color: "#ADADAD",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 25,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
    },

    inputWrapper: { marginBottom: 18 },

    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1E293B",
        marginBottom: 6,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 10,
    },

    inputIcon: { marginRight: 8 },

    input: { flex: 1, fontSize: 16, color: "#1E293B" },

    picker: {
        flex: 1,
        color: "#1E293B",
    },

    errorBorder: { borderColor: "#ef233c" },

    signUpButton: {
        backgroundColor: "#4f46e5",
        height: 55,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },

    signUpButtonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
    },

    footerText: {
        color: "#94A3B8",
        fontSize: 16,
    },

    signInText: {
        fontWeight: "bold",
        color: "#1E293B",
        fontSize: 16,
    },
});

export default Register;