import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    ToastAndroid,
    Alert,
    Image,
    ActivityIndicator,
    Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Login({ navigation, setIsSignUp }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Load credentials if 'rememberMe' was true
    useEffect(() => {
        const loadCredentials = async () => {
            const savedEmail = await AsyncStorage.getItem("savedEmail");
            const savedRememberMe = await AsyncStorage.getItem("rememberMe");
            if (savedRememberMe === "true" && savedEmail) {
                setEmail(savedEmail);
            }
        };
        loadCredentials();
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both credentials");
            return;
        }

        setLoading(true);
        try {
            // Your API logic remains the same
            // Simulating API call...
            setTimeout(() => {
                setLoading(false);
                ToastAndroid.show("Success! 🚀", ToastAndroid.SHORT);
                navigation.navigate("Initial");
            }, 1500);
        } catch (err) {
            setLoading(false);
            Alert.alert("Error", "Check your internet connection");
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* 🎨 Header Section */}
                <View style={styles.header}>
                    {/*<View style={styles.circle} />*/}
                    <Text style={styles.title}>Welcome</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                {/* 📝 Input Section */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate("Email")}
                        style={styles.forgotContainer}
                    >
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* 🚀 Primary Action Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.8 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* 🌐 Social Login Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Google Login Button */}
                    <View style={styles.socialRow}>
                        {/* Google Button */}
                        <TouchableOpacity style={[styles.socialBtn, styles.googleBtn]}>
                            <Image
                                source={require("../assets/google.png")} // Make sure this path is correct
                                style={styles.socialIcon}
                            />
                            <Text style={styles.googleText}>Google</Text>
                        </TouchableOpacity>

                        {/* GitHub Button */}
                        <TouchableOpacity style={[styles.socialBtn, styles.githubBtn]}>
                            <Image
                                source={require("../assets/github.png")} // Make sure this path is correct
                                style={[styles.socialIcon]} // tintColor makes a PNG white
                            />
                            <Text style={styles.githubText}>GitHub</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 👣 Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New here? </Text>
                        <TouchableOpacity onPress={() => setIsSignUp(true)}>
                            <Text style={styles.linkText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        marginTop:14
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 30,
        paddingTop: 60
    },
    header: {
        marginBottom: 40,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: "#4F46E5",
        marginBottom: 20,
    },
    title: {
        fontSize: 38,
        fontWeight: "800",
        color: "#1e293b",
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 20,
        color: "#64748b",
        marginTop: 5,
    },
    form: {
        width: "100%",
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 20,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 46,
        fontSize: 18,
        color: "#1e293b",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    forgotContainer: {
        alignSelf: "flex-end",
        marginBottom: 30,
    },
    forgotText: {
        color: "#4F46E5",
        fontWeight: "600",
        fontSize: 18,
    },
    loginButton: {
        backgroundColor: "#4F46E5",
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    loginButtonText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "700",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#969696",
    },
    dividerText: {
        marginHorizontal: 10,
        color: "#94a3b8",
        fontSize: 18,
        fontWeight: "600",
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    socialBtn: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        flexDirection: "row", // 👈 This aligns icon and text side-by-side
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    socialIcon: {
        width: 35,
        height: 35,
        marginRight: 8, // 👈 Adds space between icon and text
        resizeMode: "contain",
    },
    googleBtn: {
        backgroundColor: "#fff"
    },
    githubBtn: {
        backgroundColor: "#ffffff",
        borderColor: "#DBDBDB"
    },
    googleText: {
        color: "#1e293b",
        fontWeight: "600",
        fontSize: 20
    },
    githubText: {
        color: "#000000",
        fontWeight: "600",
        fontSize: 20
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    footerText: {
        color: "#64748b",
        fontSize: 18,
    },
    linkText: {
        color: "#4F46E5",
        fontWeight: "700",
        fontSize: 18,
    },
});