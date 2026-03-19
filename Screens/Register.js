import React, { useState } from "react";
import {
    View,
    Text,
    Alert,
    ToastAndroid,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
// import { AUTH_URL } from "../constants/api";
import { useNavigation } from "@react-navigation/native";

const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhoneNo = (phoneNo) =>
    phoneNo.length === 10 && /^\d+$/.test(phoneNo);

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNo: "",
        password: "",
        role: "PARENT",
    });
    const navigation = useNavigation();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    };

    const validateForm = () => {
        let e = {};
        if (!formData.name) e.name = "Name required";
        if (!validateEmail(formData.email)) e.email = "Invalid email";
        if (!validatePhoneNo(formData.phoneNo)) e.phoneNo = "Invalid phone";
        if (formData.password.length < 6)
            e.password = "Min 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // 🚀 REGISTER WITH FULL LOGS
    const handleRegister = async () => {
        if (!validateForm()) return;

        console.log("🚀 [REGISTER] Button pressed");
        console.log("📤 [REGISTER] Payload:", formData);

        setIsLoading(true);

        try {
            // const res = await axios.post(
            //     `${AUTH_URL}/auth/register`,
            //     formData
            // );

            console.log("✅ [REGISTER] Response received");
            console.log("🔢 Status:", res.status);
            console.log("📥 Data:", res.data);
            console.log("📦 Full Response:", res);

            const message = res.data;

            if (Platform.OS === "android") {
                ToastAndroid.show(message, ToastAndroid.LONG);
                navigation.navigate("Verify", { email: formData.email });
            } else {
                Alert.alert("Success", message, [
                    {
                        text: "OK",
                        onPress: () =>
                            navigation.navigate("Verify", {
                                email: formData.email,
                            }),
                    },
                ]);
            }
        } catch (err) {
            console.log("❌ [REGISTER] Error occurred");
            console.log("🧨 Full Error Object:", err);

            if (err.response) {
                console.log("🔢 Error Status:", err.response.status);
                console.log("📥 Error Data:", err.response.data);
                console.log("📦 Error Headers:", err.response.headers);
            } else if (err.request) {
                console.log("📡 No response received:", err.request);
            } else {
                console.log("⚠️ Request setup error:", err.message);
            }

            Alert.alert(
                "Registration Failed",
                err.response?.data || "Something went wrong"
            );
        } finally {
            console.log("🏁 [REGISTER] Request finished");
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                    Sign up to start protecting your world with ShieldX
                </Text>

                {/* INPUTS */}
                {[
                    ["user", "Full Name", "name"],
                    ["mail", "Email Address", "email"],
                    ["phone", "Phone Number", "phoneNo"],
                    ["lock", "Password", "password", true],
                ].map(([icon, placeholder, key, secure]) => (
                    <View key={key} style={styles.inputBlock}>
                        <View
                            style={[
                                styles.inputBox,
                                errors[key] && styles.errorBorder,
                            ]}
                        >
                            <Feather
                                name={icon}
                                size={20}
                                color="#8d99ae"
                                style={styles.icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder={placeholder}
                                secureTextEntry={secure}
                                keyboardType={
                                    key === "email"
                                        ? "email-address"
                                        : key === "phoneNo"
                                            ? "phone-pad"
                                            : "default"
                                }
                                onChangeText={(v) => handleChange(key, v)}
                            />
                        </View>
                        {errors[key] && (
                            <Text style={styles.errorText}>{errors[key]}</Text>
                        )}
                    </View>
                ))}

                {/* ROLE PICKER */}
                <View style={styles.inputBlock}>
                    <View style={styles.pickerBox}>
                        <Feather
                            name="users"
                            size={20}
                            color="#8d99ae"
                            style={styles.icon}
                        />
                        <Picker
                            selectedValue={formData.role}
                            onValueChange={(v) => handleChange("role", v)}
                            style={styles.picker}
                        >
                            <Picker.Item label="I am a Parent" value="PARENT" />
                            <Picker.Item label="I am a Child" value="CHILD" />
                        </Picker>
                    </View>
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    scroll: {
        padding: 25,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#2b2d42",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: "#8d99ae",
        marginBottom: 25,
    },
    inputBlock: {
        marginBottom: 15,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        height: 55,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#edf2f4",
        paddingHorizontal: 15,
        elevation: 2,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#2b2d42",
    },
    pickerBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        height: 55,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#edf2f4",
        paddingHorizontal: 15,
        elevation: 2,
    },
    picker: {
        flex: 1,
        color: "#2b2d42",
    },
    button: {
        backgroundColor: "#1E90FF",
        height: 55,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        elevation: 3,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    errorText: {
        color: "#ef233c",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 8,
    },
    errorBorder: {
        borderColor: "#ef233c",
    },
});
