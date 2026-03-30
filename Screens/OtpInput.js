import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";

const OtpInput = ({ otp, setOtp }) => {
    const inputs = useRef([]);

    const handleChange = (text, idx) => {
        if (/^\d?$/.test(text)) {
            const newOtp = [...otp];
            newOtp[idx] = text;
            setOtp(newOtp);
            if (text && idx < 3) inputs.current[idx + 1].focus();
        }
    };

    const handleKeyPress = (e, idx) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputs.current[idx - 1].focus();
        }
    };

    return (
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
    );
};

const styles = StyleSheet.create({
    otpContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 30 },
    otpInput: {
        width: 60, height: 65, backgroundColor: '#f0f0f0', borderRadius: 15,
        textAlign: "center", fontSize: 28, fontWeight: "bold", color: "#1E90FF",
        borderWidth: 1, borderColor: "#ddd",
    },
});

export default OtpInput;