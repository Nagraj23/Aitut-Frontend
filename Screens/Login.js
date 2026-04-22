import React, { useState, useContext } from "react";
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, StatusBar, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_URL } from "../Constants/Api";
import { AuthContext } from "../context/AuthContext";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const { signIn } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Fields", "Please enter your email and password.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });
            const data = await response.json();
            if (response.ok) {
                const userDetails = {
                    id: data.id, name: data.name,
                    role: data.role, isComplete: data.isComplete || data.complete || false,
                    accessToken: data.accessToken, refreshToken: data.refreshToken,
                };
                await AsyncStorage.multiSet([
                    ["accessToken", data.accessToken],
                    ["refreshToken", data.refreshToken || ""],
                    ["userDetails", JSON.stringify(userDetails)],
                    ["isComplete", String(data.isComplete || data.complete || false)],
                ]);
                if (rememberMe) {
                    await AsyncStorage.multiSet([
                        ["savedEmail", email], ["savedPassword", password], ["rememberMe", "true"]
                    ]);
                }
                await signIn({ ...data, isComplete: data.isComplete || data.complete || false });
            } else {
                Alert.alert("Login Failed", data.message || "Invalid credentials.");
            }
        } catch (e) {
            Alert.alert("Connection Error", "Could not reach server. Check your network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Brand Header */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                    <Text style={styles.brandName}>AiTut</Text>
                    <Text style={styles.tagline}>Your AI-powered learning companion</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to continue learning</Text>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>✉️</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputRow}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.showBtn}>
                                <Text style={styles.showBtnText}>{showPass ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkRow}>
                            <View style={[styles.checkbox, rememberMe && styles.checkboxOn]} />
                            <Text style={styles.checkLabel}>Remember me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Email")}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#FFF" />
                            : <Text style={styles.primaryBtnText}>Sign In</Text>
                        }
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.footerLink}>Sign up</Text>
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

    header: { alignItems: "center", paddingTop: 70, paddingBottom: 36 },
    logoBox: {
        width: 60, height: 60, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center", alignItems: "center", marginBottom: 14,
    },
    logoText: { fontSize: 28, fontWeight: "900", color: "#FFF" },
    brandName: { fontSize: 28, fontWeight: "900", color: "#FFF", letterSpacing: 0.5 },
    tagline: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },

    card: {
        backgroundColor: "#FFF", marginHorizontal: 20,
        borderRadius: 28, padding: 28, elevation: 12,
        shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 20,
    },
    cardTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A", marginBottom: 4 },
    cardSubtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 24 },

    fieldGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: "700", color: "#475569", marginBottom: 8 },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#F8FAFC", borderRadius: 14,
        borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14,
    },
    inputIcon: { fontSize: 16, marginRight: 10 },
    input: { flex: 1, paddingVertical: 13, fontSize: 15, color: "#1A1A1A" },
    showBtn: { paddingLeft: 8 },
    showBtnText: { fontSize: 12, color: "#4F46E5", fontWeight: "700" },

    optionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    checkRow: { flexDirection: "row", alignItems: "center" },
    checkbox: {
        width: 18, height: 18, borderRadius: 5,
        borderWidth: 1.5, borderColor: "#CBD5E1", marginRight: 8,
    },
    checkboxOn: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
    checkLabel: { fontSize: 13, color: "#64748B" },
    forgotText: { fontSize: 13, color: "#4F46E5", fontWeight: "700" },

    primaryBtn: {
        backgroundColor: "#4F46E5", borderRadius: 16,
        paddingVertical: 16, alignItems: "center", marginBottom: 20,
        elevation: 4, shadowColor: "#4F46E5", shadowOpacity: 0.3, shadowRadius: 10,
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800" },

    footerRow: { flexDirection: "row", justifyContent: "center" },
    footerText: { fontSize: 14, color: "#94A3B8" },
    footerLink: { fontSize: 14, color: "#4F46E5", fontWeight: "700" },
});