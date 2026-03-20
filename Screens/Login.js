import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    StatusBar,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_URL } from "../Constants/Api";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 1. Load Credentials on Startup
    useEffect(() => {
        const loadCredentials = async () => {
            console.log("📂 Checking for saved credentials...");
            try {
                const savedRememberMe = await AsyncStorage.getItem("rememberMe");
                if (savedRememberMe === "true") {
                    const savedEmail = await AsyncStorage.getItem("savedEmail");
                    const savedPassword = await AsyncStorage.getItem("savedPassword");

                    setEmail(savedEmail || "");
                    setPassword(savedPassword || "");
                    setRememberMe(true);
                    console.log("✅ Credentials auto-filled for:", savedEmail);
                }
            } catch (err) {
                console.error("❌ Error loading credentials:", err);
            }
        };
        loadCredentials();
    }, []);

    // 2. Login Logic
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Email and Password fields cannot be empty");
            return;
        }

        console.log("🚀 Attempting login for:", email);
        setLoading(true);

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                }),
            });

            const data = await response.json();
            console.log("📥 Login API Response Data:", data);

            if (response.ok) {
                const { accessToken, refreshToken, userData } = data;

                if (!accessToken) {
                    console.log("❌ Error: Access token missing in response");
                    Alert.alert("Login Failed", "Access token missing in response");
                    return;
                }

                // Store Tokens
                await AsyncStorage.setItem("accessToken", accessToken);
                if (refreshToken) {
                    await AsyncStorage.setItem("refreshToken", refreshToken);
                }

                // Store User Details
                if (userData) {
                    await AsyncStorage.setItem("userDetails", JSON.stringify(userData));
                    if (userData.id) {
                        await AsyncStorage.setItem("userId", String(userData.id));
                        console.log("🆔 User ID Stored:", userData.id);
                    }
                    console.log("👤 User Data Stored:", userData);
                }

                await AsyncStorage.setItem("isLoggedin", "true");

                // Handle Remember Me logic
                if (rememberMe) {
                    await AsyncStorage.setItem("savedEmail", email);
                    await AsyncStorage.setItem("savedPassword", password);
                    await AsyncStorage.setItem("rememberMe", "true");
                    console.log("💾 Credentials saved to storage");
                } else {
                    await AsyncStorage.removeItem("savedEmail");
                    await AsyncStorage.removeItem("savedPassword");
                    await AsyncStorage.setItem("rememberMe", "false");
                    console.log("🧹 Credentials cleared (Remember Me off)");
                }

                // Final Verification Logs
                console.log("🎯 Access Token saved:", await AsyncStorage.getItem("accessToken"));
                console.log("🔄 Refresh Token saved:", await AsyncStorage.getItem("refreshToken"));

                ToastAndroid.show("Login successful", ToastAndroid.LONG);
                navigation.replace("Home");
            } else {
                console.log("❌ Login Rejected:", data.message);
                Alert.alert("Login Failed", data.message || "Invalid email or password");
            }
        } catch (error) {
            console.error("🌐 Connection Error:", error.message);
            Alert.alert("Login Failed", "Unable to connect to server. Check your internet or IP.");
        } finally {
            setLoading(false);
            console.log("🏁 Login execution complete.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#9788FB" />

            <View style={styles.headerBackground}>
                <Text style={styles.brandName}>AiTut</Text>
            </View>

            <View style={styles.formCard}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.welcomeTitle}>Welcome back</Text>
                    <Text style={styles.welcomeSubtitle}>Sign in to enjoy the best experience</Text>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="example@mail.com"
                                placeholderTextColor="#CBD5E1"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="password"
                                placeholderTextColor="#CBD5E1"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    <View style={styles.optionsRow}>
                        <TouchableOpacity
                            onPress={() => setRememberMe(!rememberMe)}
                            style={styles.checkboxContainer}
                        >
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]} />
                            <Text style={styles.optionText}>Remember me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.forgotText}>Forget Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { backgroundColor: "#818cf8" }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Log in</Text>}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>Or login with</Text>
                        <View style={styles.line} />
                    </View>

                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialCircle}>
                            <Image source={require("../assets/google.png")} style={styles.socialIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle}>
                            <Image source={require("../assets/git.png")} style={styles.socialIcon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text style={styles.signUpText}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#9788FB" },
    headerBackground: { height: "23%", alignItems: "center", paddingTop: 20 },
    brandName: { color: "#fff", fontSize: 50, fontWeight: "bold", marginTop: 15 },
    formCard: { flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30 },
    scrollContent: { paddingTop: 30, paddingBottom: 20 },
    welcomeTitle: { fontSize: 35, fontWeight: "bold", textAlign: "center", color: "#1E293B" },
    welcomeSubtitle: { fontSize: 18, color: "#94A3B8", textAlign: "center", marginTop: 10, marginBottom: 30 },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 18, fontWeight: "bold", color: "#1E293B", marginBottom: 8 },
    inputContainer: { borderWidth: 1, borderColor: "#F1F5F9", borderRadius: 25, height: 45, justifyContent: "center", paddingHorizontal: 20, },
    input: { fontSize: 15, color: "#1E293B" },
    optionsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
    checkboxContainer: { flexDirection: "row", alignItems: "center" },
    checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: "#CBD5E1", marginRight: 8 },
    checkboxActive: { backgroundColor: "#9788FB", borderColor: "#9788FB" },
    optionText: { fontSize: 15, color: "#64748B" },
    forgotText: { fontSize: 15, fontWeight: "bold", color: "#1E293B" },
    loginButton: { backgroundColor: "#4f46e5", height: 50, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 30 },
    loginButtonText: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
    dividerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
    line: { flex: 1, height: 1, backgroundColor: "#C4C4C4" },
    dividerText: { marginHorizontal: 15, color: "#242424", fontSize: 18 },
    socialRow: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 30 },
    socialCircle: { width: 50, height: 50, borderRadius: 30, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#F1F5F9" },
    socialIcon: { width: 35, height: 35, resizeMode: "contain" },
    footer: { flexDirection: "row", justifyContent: "center" },
    footerText: { color: "#94A3B8", fontSize: 20 },
    signUpText: { fontWeight: "bold", color: "#1E293B", fontSize: 20 },
});