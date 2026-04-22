import React, { useState } from "react";
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, ToastAndroid
} from "react-native";
import { AUTH_URL } from "../Constants/Api";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const ROLES = [
    { label: "Student", value: "STUDENT", icon: "🎓" },
    { label: "Teacher", value: "TEACHER", icon: "📖" },
    { label: "TPO", value: "TPO", icon: "🏢" },
];

const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function Register() {
    const navigation = useNavigation();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "STUDENT" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const update = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!validateEmail(form.email)) e.email = "Valid email required";
        if (form.password.length < 6) e.password = "Min 6 characters";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await axios.post(`${AUTH_URL}/register`, form);
            const msg = res.data;
            if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
            else Alert.alert("Success", msg);
            navigation.navigate("VerifyOTP", { email: form.email, type: "ACCOUNT" });
        } catch (err) {
            const msg = err.response?.data || "Registration failed";
            Alert.alert("Error", msg.includes("already") ? "Email already exists. Try signing in." : String(msg));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                    <Text style={styles.brandName}>AiTut</Text>
                    <Text style={styles.tagline}>Start your learning journey today</Text>
                </View>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create account</Text>
                    <Text style={styles.cardSubtitle}>Join thousands of learners</Text>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={[styles.inputRow, errors.name && styles.inputError]}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Your full name"
                                placeholderTextColor="#94A3B8"
                                value={form.name}
                                onChangeText={v => update("name", v)}
                            />
                        </View>
                        {errors.name && <Text style={styles.errText}>{errors.name}</Text>}
                    </View>

                    {/* Role — below name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>I am a...</Text>
                        <View style={styles.roleRow}>
                            {ROLES.map(r => (
                                <TouchableOpacity
                                    key={r.value}
                                    style={[styles.roleChip, form.role === r.value && styles.roleChipActive]}
                                    onPress={() => update("role", r.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.roleIcon}>{r.icon}</Text>
                                    <Text style={[styles.roleLabel, form.role === r.value && styles.roleLabelActive]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputRow, errors.email && styles.inputError]}>
                            <Text style={styles.inputIcon}>✉️</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#94A3B8"
                                value={form.email}
                                onChangeText={v => update("email", v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                        {errors.email && <Text style={styles.errText}>{errors.email}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputRow, errors.password && styles.inputError]}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Min 6 characters"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPass}
                                value={form.password}
                                onChangeText={v => update("password", v)}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.showBtn}>
                                <Text style={styles.showBtnText}>{showPass ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errText}>{errors.password}</Text>}
                    </View>

                    {/* Sign Up */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#FFF" />
                            : <Text style={styles.primaryBtnText}>Create Account</Text>
                        }
                    </TouchableOpacity>

                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.footerLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#4F46E5" },
    scrollContent: { flexGrow: 1, paddingBottom: 30 },

    header: { alignItems: "center", paddingTop: 60, paddingBottom: 30 },
    logoBox: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center", alignItems: "center", marginBottom: 12,
    },
    logoText: { fontSize: 26, fontWeight: "900", color: "#FFF" },
    brandName: { fontSize: 26, fontWeight: "900", color: "#FFF" },
    tagline: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },

    card: {
        backgroundColor: "#FFF", marginHorizontal: 20,
        borderRadius: 28, padding: 26, elevation: 12,
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20,
    },
    cardTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 22 },

    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: "700", color: "#475569", marginBottom: 8 },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#F8FAFC", borderRadius: 14,
        borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14,
    },
    inputError: { borderColor: "#EF4444" },
    inputIcon: { fontSize: 15, marginRight: 10 },
    input: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#1A1A1A" },
    showBtn: { paddingLeft: 8 },
    showBtnText: { fontSize: 12, color: "#4F46E5", fontWeight: "700" },
    errText: { color: "#EF4444", fontSize: 11, marginTop: 4, marginLeft: 4 },

    roleRow: { flexDirection: "row", gap: 8 },
    roleChip: {
        flex: 1, paddingVertical: 10, borderRadius: 12,
        backgroundColor: "#F8FAFC", alignItems: "center",
        borderWidth: 1.5, borderColor: "#E2E8F0",
    },
    roleChipActive: { backgroundColor: "#EEF2FF", borderColor: "#4F46E5" },
    roleIcon: { fontSize: 18, marginBottom: 4 },
    roleLabel: { fontSize: 11, fontWeight: "700", color: "#64748B" },
    roleLabelActive: { color: "#4F46E5" },

    primaryBtn: {
        backgroundColor: "#4F46E5", borderRadius: 16,
        paddingVertical: 15, alignItems: "center", marginBottom: 18, marginTop: 6,
        elevation: 4, shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 10,
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    footerRow: { flexDirection: "row", justifyContent: "center" },
    footerText: { fontSize: 14, color: "#94A3B8" },
    footerLink: { fontSize: 14, color: "#4F46E5", fontWeight: "700" },
});