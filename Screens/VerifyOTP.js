import React, { useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    ToastAndroid,
    Alert,
    SafeAreaView
} from "react-native";
import { AUTH_URL } from "../Constants/Api";

const Verify = ({ navigation, route }) => {
    // Assuming you passed email from the Register screen
    const { email } = route.params;
    // Updated to 4 digits to match the UI image provided
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);

    const inputs = useRef([]);

    const handleChange = (text, idx) => {
        if (/^\d?$/.test(text)) {
            const newOtp = [...otp];
            newOtp[idx] = text;
            setOtp(newOtp);

            // Auto-focus logic
            if (text && idx < 3) {
                inputs.current[idx + 1].focus();
            }
        }
    };

    const handleKeyPress = (e, idx) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputs.current[idx - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join("");

        if (otpCode.length < 4) {
            Alert.alert("Error", "Please enter the 4-digit code.");
            return;
        }

        setLoading(true);
        try {
            // Updated Endpoint and Body Format
            const res = await fetch(`${AUTH_URL}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    otp: otpCode,
                    type: "ACCOUNT"
                }),
            });

            const data = await res.json();

            if (res.ok) {
                ToastAndroid.show("Verified successfully ✅", ToastAndroid.SHORT);
                navigation.replace("Login");
            } else {
                Alert.alert("Error", data.message || "Invalid OTP");
            }
        } catch (err) {
            Alert.alert("Error", "Connection failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>

                <Text style={styles.logoText}>AiTut</Text>
            </View>

            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{fontSize: 20}}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Verify Code</Text>
                <Text style={styles.subtitle}>
                    Please enter verify code that we've sent to your email.
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, idx) => (
                        <TextInput
                            key={idx}
                            ref={(el) => (inputs.current[idx] = el)}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, idx)}
                            onKeyPress={(e) => handleKeyPress(e, idx)}
                            autoFocus={idx === 0}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleVerify}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? "Verifying..." : "Verify"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#9788FB", // Pink background like image
        paddingTop: 40,
        justifyContent: 'center',

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logo: { width: 40, height: 40 },
    logoText: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 10,
    },
    card: {
        height: '60%', // Adjust this % to make it taller or shorter
        backgroundColor: "#f5f5f5",
        borderRadius: 30, // Rounded on all corners
        padding: 30,
        marginHorizontal: 15,

        // elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        marginBottom:40
    },
    backBtn: { marginBottom: 20 },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginVertical: 15,
        lineHeight: 20,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 30,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: "#C4C4C4",
        borderRadius: 12,
        textAlign: "center",
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    button: {
        backgroundColor: "#4f46e5", // Pinkish-Red gradient color
        paddingVertical: 13,
        borderRadius: 25,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 26,
        textAlign: "center",
        fontWeight: "bold",
    },
});

export default Verify;