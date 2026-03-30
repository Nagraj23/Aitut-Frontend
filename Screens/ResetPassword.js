import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    ActivityIndicator
} from "react-native";
import { AUTH_URL } from '../Constants/Api'; // Using your constant

const ResetPassword = ({ route, navigation }) => {
    const { email } = route.params;
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            // Updated to use your shared AUTH_URL constant
            const response = await fetch(`${AUTH_URL}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    newPassword: newPassword
                }),
            });

            // Handling potential string response vs JSON response
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const textData = await response.text();
                data = { message: textData };
            }

            if (response.ok) {
                Alert.alert("Success ✅", "Password has been reset! Please login.");
                navigation.replace("Login"); // Use replace so they can't go back to reset
            } else {
                Alert.alert("Error", data.message || "Failed to reset password.");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            Alert.alert("Error", "Connection failed. Check your server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.logoText}>AiTut</Text>

            <View style={styles.card}>
                <Text style={styles.title}>New Password</Text>
                <Text style={styles.subtitle}>
                    Set a strong password for{"\n"}
                    <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        secureTextEntry
                        placeholderTextColor="#999"
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        secureTextEntry
                        placeholderTextColor="#999"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && { opacity: 0.7 }]}
                    onPress={handleReset}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9788FB",
        justifyContent: "center",
    },
    logoText: {
        fontSize: 36,
        fontWeight: "900",
        color: "#fff",
        textAlign: 'center',
        marginBottom: 30,
        letterSpacing: 2,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 35,
        padding: 30,
        marginHorizontal: 20,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        textAlign: "center",
        color: "#1a1a1a",
    },
    subtitle: {
        fontSize: 15,
        color: "#777",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 25,
        lineHeight: 22,
    },
    emailHighlight: {
        fontWeight: 'bold',
        color: '#333'
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
        marginLeft: 5,
    },
    input: {
        height: 55,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    button: {
        backgroundColor: "#4f46e5",
        paddingVertical: 16,
        borderRadius: 20,
        marginTop: 10,
        shadowColor: "#1E90FF",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        fontWeight: "bold",
    },
});

export default ResetPassword;