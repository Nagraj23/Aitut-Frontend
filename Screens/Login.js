import React, { useState, useContext } from "react";
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
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// 1. Import the AuthContext
import { AuthContext } from "../context/AuthContext";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // 2. Access the signIn function from context
    const { signIn } = useContext(AuthContext);

    // Initial Configuration
    // GoogleSignin.configure({
    //     webClientId: '511625866788-i1cj7pgim65c9splvnd2chmptr1mrath.apps.googleusercontent.com',
    //     offlineAccess: true,
    // });

    // Helper to process successful login
    const onLoginSuccess = async (data) => {
        console.log("📦 [Login] Backend Response Data:", data);

        // EXTRACT THE DATA (Be very careful with naming here)
        const token = data.accessToken;
        const refresh = data.refreshToken;
        const isComplete = data.complete; // This matches your "complete": false in JSON

        // CRITICAL: Check if token exists before hitting AsyncStorage
        if (!token) {
            console.error("❌ [Login]: accessToken is undefined in the response!");
            return;
        }

        try {
            // Save to Storage
            await AsyncStorage.setItem("accessToken", token);

            if (refresh) {
                await AsyncStorage.setItem("refreshToken", refresh);
            }

            // Save User Details (id, name, role)
            const userDetails = {
                id: data.id,
                name: data.name,
                role: data.role
            };
            await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
            await AsyncStorage.setItem("isComplete", String(isComplete));

            console.log("✅ [Login]: Storage saved. Calling Context SignIn...");

            // TRIGGER THE NAVIGATOR SWITCH
            // We pass the token and the 'complete' status to our AuthContext
            await signIn(data);

        } catch (error) {
            console.error("🚨 [Login] Storage Error:", error);
        }
    };

    // --- SOCIAL LOGIN LOGIC ---
    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            console.log("🟡 [Login]: Starting Google Login...");
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data ? userInfo.data.idToken : userInfo.idToken;

            if (!idToken) throw new Error("Google did not return an ID Token.");

            console.log("✅ [Login]: Google Token received, hitting backend...");

            const response = await fetch(`${AUTH_URL}/google-login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
            });

            const data = await response.json();
            if (response.ok) {
                await onLoginSuccess(data);
            } else {
                Alert.alert("Google Login Failed", data.message || "Backend rejected token");
            }
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                ToastAndroid.show("Sign-in cancelled", ToastAndroid.SHORT);
            } else {
                console.error("🚨 [Login]: Google Auth Error:", error);
                Alert.alert("Auth Error", "Could not complete Google Sign-In");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        try {
            console.log("🔵 [Login]: Starting GitHub Login...");
            const githubCode = "GITHUB_AUTH_CODE"; // Placeholder for actual flow

            const response = await fetch(`${AUTH_URL}/github`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: githubCode }),
            });

            const data = await response.json();
            if (response.ok) {
                await onLoginSuccess(data);
            } else {
                Alert.alert("GitHub Login Failed", data.message || "OAuth Error");
            }
        } catch (error) {
            console.error("🚨 [Login]: GitHub Auth Error:", error);
            Alert.alert("Error", "Could not connect to GitHub Service");
        } finally {
            setLoading(false);
        }
    };

    // --- STANDARD LOGIN LOGIC ---
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter Email and Password");
            return;
        }
        setLoading(true);
        try {
            console.log("📨 [Login]: Attempting standard email login...");
            const response = await fetch(`${AUTH_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password }),
            });
            const data = await response.json();
            if (response.ok) {
                if (rememberMe) {
                    await AsyncStorage.setItem("savedEmail", email);
                    await AsyncStorage.setItem("savedPassword", password);
                    await AsyncStorage.setItem("rememberMe", "true");
                }
                await onLoginSuccess(data);
            } else {
                Alert.alert("Login Failed", data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("🚨 [Login]: Fetch Error:", error);
            Alert.alert("Connection Error", "Server unreachable");
        } finally {
            setLoading(false);
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

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="example@mail.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    {/* Options Row */}
                    <View style={styles.optionsRow}>
                        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]} />
                            <Text style={styles.optionText}>Remember me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate("Email")}>
                            <Text style={styles.forgotText}>Forget Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Log in</Text>}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>Or login with</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Social Row */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialCircle} onPress={handleGoogleLogin} disabled={loading}>
                            <Image source={require("../assets/google.png")} style={styles.socialIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialCircle} onPress={handleGithubLogin} disabled={loading}>
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
    inputContainer: { borderWidth: 1, borderColor: "#F1F5F9", borderRadius: 25, height: 45, justifyContent: "center", paddingHorizontal: 20 },
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
    footerText: { color: "#94A3B8", fontSize: 20 , marginBottom: 30 },
    signUpText: { fontWeight: "bold", color: "#1E293B", fontSize: 20 },
});