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

import { AuthContext } from "../context/AuthContext";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { signIn } = useContext(AuthContext);

    // ✅ FIXED LOGIN SUCCESS FUNCTION
    const onLoginSuccess = async (data) => {
        console.log("📦 Backend Response:", data);

        const token = data.accessToken;
        const refresh = data.refreshToken;
        const isComplete = data.complete;

        if (!token) {
            console.error("❌ No token received!");
            return;
        }

        try {
            await AsyncStorage.setItem("accessToken", token);

            if (refresh) {
                await AsyncStorage.setItem("refreshToken", refresh);
            }

            const userDetails = {
                id: data.id,
                name: data.name,
                role: data.role
            };

            await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
            await AsyncStorage.setItem("isComplete", String(isComplete));

            console.log("✅ Stored user:", userDetails);
            console.log("ROLE:", userDetails.role);

            // ✅ IMPORTANT FIX HERE
             await signIn({
            accessToken: token,
            complete: isComplete,
            role: data.role,
            id: data.id,
            name: data.name
        });

        } catch (error) {
            console.error("🚨 Storage Error:", error);
        }
    };

    // ✅ STANDARD LOGIN
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter Email and Password");
            return;
        }

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
            console.error("🚨 Fetch Error:", error);
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
                    <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={styles.link}>Don't have an account? Sign up</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#9788FB" },
    headerBackground: { height: "25%", justifyContent: "center", alignItems: "center" },
    brandName: { color: "#fff", fontSize: 40, fontWeight: "bold" },
    formCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 20
    },
    scrollContent: { paddingTop: 20 },
    welcomeTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
    welcomeSubtitle: { textAlign: "center", marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15
    },
    loginButton: {
        backgroundColor: "#4f46e5",
        padding: 15,
        borderRadius: 10,
        alignItems: "center"
    },
    loginButtonText: { color: "#fff", fontWeight: "bold" },
    link: { textAlign: "center", marginTop: 15 }
});