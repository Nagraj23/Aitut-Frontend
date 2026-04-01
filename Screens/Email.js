import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {AUTH_URL} from "../Constants/Api";

const Email = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert("Validation Error", "Please enter your email address.");
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Validation Error", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${AUTH_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            // 🔥 FIX: Backend returns STRING, not object
            const textData = await response.text();  // Get raw text
            console.log("📨 Forgot response:", textData);

            if (response.ok) {
                Alert.alert("Success", textData || "OTP sent to your email!");  // Use raw text
                navigation.navigate("ResetOtp", {
                    email,
                    type: "RESET"  // 🔥 PASS TYPE for reset flow
                });
            } else {
                // Error responses are also plain strings
                const errorText = await response.text();
                Alert.alert("Error", errorText || "Failed to send OTP.");
            }
        } catch (error) {
            console.error("❌ Forgot error:", error);
            Alert.alert("Error", "No internet or server down.");
        } finally {
            setLoading(false);
        }

    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                    Enter your email address to receive an OTP for verification.
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="example@mail.com"
                        keyboardType="email-address"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleSendOtp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.link}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Email;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9788FB", // Your primary purple
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        width: "100%",
        height:"55%",
        justifyContent: "center",
        borderRadius: 30,
        paddingVertical: 40,
        paddingHorizontal: 25,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#333",
        marginBottom: 10,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 17,
        color: "#777",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
    },
    inputContainer: {
        marginBottom: 25,
    },
    input: {
        width: "100%",
        height: 55,
        backgroundColor: "#F1F4FF",
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#333",
        borderWidth: 1,
        borderColor: "#D1D1D1",
    },
    button: {
        backgroundColor: "#4f46e5",
        height: 55,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#1E90FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    link: {
        color: "#666",
        fontSize: 18,
        textAlign: "center",
        marginTop: 10,
        fontWeight: "600",
    },
});