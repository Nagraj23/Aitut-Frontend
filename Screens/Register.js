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
// import axios from ""
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import {AUTH_URL} from "../Constants/Api";
import axios from "axios";

const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'];  // Backend enum

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: 'STUDENT',
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
            console.log("📤 Payload:", formData);
            const res = await axios.post(`${AUTH_URL}/register`, formData);

            console.log("✅ Success:", res.data);

            const message = res.data;  // "Registration successful! Check email for verification OTP."

            if (Platform.OS === "android") {
                ToastAndroid.show(message, ToastAndroid.LONG);
            } else {
                Alert.alert("Success", message);
            }

            // 🔥 CRITICAL: Navigate to OTP Verify screen with email
            navigation.navigate("VerifyOTP", { email: formData.email, type: "ACCOUNT" });

        } catch (err) {
            console.error("❌ Error:", err.response?.data || err.message);
            const errorMsg = err.response?.data || "Registration failed";
            Alert.alert("Error", errorMsg.includes('Email already registered') ?
                "Email already exists. Try login or different email." : errorMsg);
        } finally {
            setIsLoading(false);  // 🔥 REMOVED duplicate timeout
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 🎨 Top Purple Header */}
            <View style={styles.headerBackground}>
                <Text style={styles.brandName}>AiTut</Text>
                <View style={styles.logoContainer}>
                    {/*<Image*/}
                    {/*    source={require("../assets/logo.png")} // Add your logo here*/}
                    {/*    style={styles.logo}*/}
                    {/*    resizeMode="contain"*/}
                    {/*/>*/}
                </View>
            </View>

            {/* ⚪ White Form Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.formCard}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.welcomeTitle}>Register</Text>
                    <Text style={styles.welcomeSubtitle}>Create new account for better service</Text>

                    {/* Name Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Name</Text>
                        <View style={[styles.inputContainer, errors.name && styles.errorBorder]}>
                            <Feather name="user" size={18} color="#CBD5E1" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Johan Mandela"
                                placeholderTextColor="#CBD5E1"
                                value={formData.name}
                                onChangeText={(v) => handleChange("name", v)}
                            />
                        </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputContainer, errors.email && styles.errorBorder]}>
                            <Feather name="mail" size={18} color="#CBD5E1" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="brittnilonda5487@gmail.com"
                                placeholderTextColor="#CBD5E1"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(v) => handleChange("email", v)}
                            />
                        </View>
                    </View>

                    {/* Password Input */}
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

                    {/* Terms & Conditions */}
                    <TouchableOpacity
                        style={styles.termsRow}
                        onPress={() => setAgree(!agree)}
                    >
                    </TouchableOpacity>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#1E293B" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Sign up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>Or Sign up with</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Social Circles */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialCircle}>
                            <Image source={require("../assets/google.png")} style={styles.socialIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}>
                            <Image source={require("../assets/git.png")} style={styles.socialIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.signInText}>Sign in</Text>
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
        // justifyContent: "center",
        alignItems: "center",
        paddingTop: 50,
    },
    brandName: { color: "#fff", fontSize: 36, fontWeight: "bold", marginBottom: 10 },
    logo: { width: 70, height: 70 },
    formCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -30,
        paddingHorizontal: 25,
    },
    scrollContent: { paddingTop: 20, paddingBottom: 40 },
    welcomeTitle: { fontSize: 34, fontWeight: "bold", textAlign: "center", color: "#1E293B" },
    welcomeSubtitle: { fontSize: 15, color: "#ADADAD", textAlign: "center", marginTop: 8, marginBottom: 25 },
    inputWrapper: { marginBottom: 18 },
    label: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        borderRadius: 25,
        backgroundColor: "#fff",
        height: 50,
        paddingHorizontal: 15,
        elevation: 1,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 18, color: "#1E293B" },
    errorBorder: { borderColor: "#ef233c" },
    termsRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#CBD5E1", marginRight: 10, justifyContent: "center", alignItems: "center" },
    checkboxActive: { backgroundColor: "#9788FB", borderColor: "#9788FB" },
    termsText: { fontSize: 12, color: "#64748B" },
    boldText: { fontWeight: "bold", color: "#1E293B" },
    signUpButton: { backgroundColor: "#4f46e5", height: 55, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 20 },
    signUpButtonText: { fontSize: 26, fontWeight: "bold", color: "#f5f5f5" },
    dividerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    line: { flex: 1, height: 1, backgroundColor: "#F1F5F9" },
    dividerText: { marginHorizontal: 12, color: "#94A3B8", fontSize: 18 },
    socialRow: { flexDirection: "row", justifyContent: "center", gap: 15, marginBottom: 25 },
    socialCircle: { width: 55, height: 55, borderRadius: 25, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    socialIcon: { width: 45, height: 45 },
    footer: { flexDirection: "row", justifyContent: "center" },
    footerText: { color: "#94A3B8", fontSize: 18 },
    signInText: { fontWeight: "bold", color: "#1E293B", fontSize: 20 },
});

export default Register;