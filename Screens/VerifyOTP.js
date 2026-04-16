import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Alert, SafeAreaView, ActivityIndicator } from "react-native";
import { AUTH_URL } from "../Constants/Api";
import OtpInput from "./OtpInput"; // Adjust path

const VerifyAccount = ({ navigation, route }) => {
    const { email } = route.params;
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < 4) return Alert.alert("Error", "Enter 4-digit code");

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
            } else {
                Alert.alert("Error", data.message || "Verification failed");
            }
        } catch (err) {
            Alert.alert("Error", "Connection failed.");
        } finally { setLoading(false); }
    };
// const VerifyAccount = ({ navigation, route }) => {
//     const { email, type } = route.params; // ← get type from params

//     const handleVerify = async () => {
//         const otpCode = otp.join("");
//         if (otpCode.length < 4) return Alert.alert("Error", "Enter 4-digit code");

//         setLoading(true);
//         try {
//             const res = await fetch(`${AUTH_URL}/verify-otp`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     email: email,
//                     otp: otpCode,
//                     type: type  // ← use the type from params, not hardcoded "RESET"
//                 }),
//             });

//             const contentType = res.headers.get("content-type");
//             let data;
//             if (contentType && contentType.includes("application/json")) {
//                 data = await res.json();
//             } else {
//                 const textData = await res.text();
//                 data = { message: textData };
//             }

//             if (res.ok) {
//                 // ← Route based on type
//                 if (type === "ACCOUNT") {
//                     navigation.navigate("Login"); // Registration complete → go to login
//                 } else {
//                     navigation.navigate("ResetPassword", { email, otp: otpCode }); // Reset flow
//                 }
//             } else {
//                 Alert.alert("Error", data.message || "Verification failed");
//             }
//         } catch (err) {
//             Alert.alert("Error", "Connection failed.");
//         } finally {
//             setLoading(false);
//         }
//     };
//     // ... rest of component
// // };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.logoText}>AiTut</Text>
            <View style={styles.card}>
                <Text style={styles.title}>Verify Account</Text>
                <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
                <OtpInput otp={otp} setOtp={setOtp} />
                <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
// Use your existing styles he
// re...
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
        backgroundColor: "#1E90FF", // The blue action button
        paddingVertical: 15,
        borderRadius: 20,
        marginTop: 10,
        shadowColor: "#1E90FF",
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
export default VerifyAccount;