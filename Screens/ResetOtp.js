import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from "react-native";
import { AUTH_URL } from "../Constants/Api";
import OtpInput from "./OtpInput";

const ResetSecurity = ({ navigation, route }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        const otpCode = otp.join("");

        // Log 1: Check what the state looks like before sending
        console.log("--- Frontend Request Start ---");
        console.log("Target URL:", `${AUTH_URL}/verify-otp`);
        console.log("Payload:", { email, otp: otpCode, type: "ACCOUNT" });

        if (otpCode.length < 4) {
            Alert.alert("Error", "Enter 4-digit code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${AUTH_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    otp: otpCode,
                    type: "RESET"
                }),
            });

            console.log("Response Status:", res.status);

            // --- FIX STARTS HERE ---
            const contentType = res.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            } else {
                // If server sends plain text like "OTP verified successfully!"
                const textData = await res.text();
                data = { message: textData };
            }
            console.log("Parsed Data:", data);
            // --- FIX ENDS HERE ---

            if (res.ok) {
                navigation.navigate("ResetPassword", { email, otp: otpCode });
                // Alert.alert("Success","verified");
            } else {
                Alert.alert("Error", data.message || "Verification failed");
            }
        } catch (err) {
            // Log 3: This catches the "Connection Failed" reason
            console.error("FETCH ERROR:", err);
            Alert.alert("Error", "Connection failed. Check Metro terminal for details.");
        } finally {
            setLoading(false);
            console.log("--- Frontend Request End ---");
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.logoText}>AiTut</Text>
            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={{fontSize: 20}}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Reset Security</Text>
                <Text style={styles.subtitle}>Security code sent to {email}</Text>
                <OtpInput otp={otp} setOtp={setOtp} />
                <TouchableOpacity style={styles.button} onPress={handleVerify}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
// Use your existing styles here...

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9788FB", // That purple background you had
        justifyContent: 'center',
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
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        // Elevation for Android
        elevation: 15,
    },
    backBtn: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        padding: 5
    },
    backArrow: {
        fontSize: 28,
        color: '#333',
        fontWeight: 'bold'
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
        marginVertical: 15,
        lineHeight: 22,
    },
    emailHighlight: {
        fontWeight: 'bold',
        color: '#333'
    },
    button: {
        backgroundColor: "#4f46e5", // The blue action button
        paddingVertical: 15,
        borderRadius: 20,
        marginTop: 10,
        shadowColor: "#4f46e5",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
    },
});
export default ResetSecurity;