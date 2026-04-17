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
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Image,
    ScrollView,
} from "react-native";

import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { AUTH_URL } from "../Constants/Api";
import axios from "axios";

const ROLES = ["STUDENT", "TEACHER", "TPO"]; // ❌ removed ADMIN (security)

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
    });

    const navigation = useNavigation();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [agree, setAgree] = useState(true);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
    };

    const validateForm = () => {
        let e = {};
        if (!formData.name) e.name = "Name required";
        if (!validateEmail(formData.email)) e.email = "Invalid email";
        if (formData.password.length < 6)
            e.password = "Min 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm() || !agree) {
            if (!agree)
                Alert.alert(
                    "Terms",
                    "Please agree to Terms & Conditions"
                );
            return;
        }

        setIsLoading(true);
        try {
            console.log("📤 Payload:", formData);

            const res = await axios.post(
                ` ${AUTH_URL}/register ` ,
                formData
            );
            
            
            const message = res.data;

            if (Platform.OS === "android") {
                ToastAndroid.show(message, ToastAndroid.LONG);
            } else {
                Alert.alert("Success", message);
            }

            navigation.navigate("VerifyOTP", {
                email: formData.email,
                type: "ACCOUNT",
            });
        } catch (err) {
            const errorMsg =
                err.response?.data || "Registration failed";
            Alert.alert("Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />

            {/* Header */}
            <View style={styles.headerBackground}>
                <Text style={styles.brandName}>AiTut</Text>
            </View>

            {/* Form */}
            <KeyboardAvoidingView
                behavior={
                    Platform.OS === "ios" ? "padding" : "height"
                }
                style={styles.formCard}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.welcomeTitle}>
                        Register
                    </Text>

                    {/* Name */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Name</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                errors.name && styles.errorBorder,
                            ]}
                        >
                            <Feather
                                name="user"
                                size={18}
                                color="#CBD5E1"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Your Name"
                                value={formData.name}
                                onChangeText={(v) =>
                                    handleChange("name", v)
                                }
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                errors.email &&
                                    styles.errorBorder,
                            ]}
                        >
                            <Feather
                                name="mail"
                                size={18}
                                color="#CBD5E1"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="email@gmail.com"
                                keyboardType="email-address"
                                value={formData.email}
                                onChangeText={(v) =>
                                    handleChange("email", v)
                                }
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Password</Text>
                        <View
                            style={[
                                styles.inputContainer,
                                errors.password &&
                                    styles.errorBorder,
                            ]}
                        >
                            <Feather
                                name="lock"
                                size={18}
                                color="#CBD5E1"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="password"
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(v) =>
                                    handleChange("password", v)
                                }
                            />
                        </View>
                    </View>

                    {/* 🔥 ROLE SELECTOR */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>
                            Select Role
                        </Text>

                        <View style={styles.roleContainer}>
                            {ROLES.map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleButton,
                                        formData.role === role &&
                                            styles.roleActive,
                                    ]}
                                    onPress={() =>
                                        handleChange("role", role)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.roleText,
                                            formData.role ===
                                                role &&
                                                styles.roleTextActive,
                                        ]}
                                    >
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        style={styles.signUpButton}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator
                                color="#fff"
                            />
                        ) : (
                            <Text
                                style={
                                    styles.signUpButtonText
                                }
                            >
                                Sign Up
                            </Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#9788FB" },

    headerBackground: {
        height: "25%",
        alignItems: "center",
        paddingTop: 50,
    },

    brandName: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },

    formCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 20,
    },

    scrollContent: { paddingBottom: 40 },

    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },

    inputWrapper: { marginBottom: 15 },

    label: {
        fontWeight: "bold",
        marginBottom: 5,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        borderRadius: 10,
        padding: 10,
    },

    input: {
        flex: 1,
        marginLeft: 10,
    },

    errorBorder: {
        borderColor: "red",
    },

    /* 🔥 ROLE STYLES */
    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    roleButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: "center",
        borderColor: "#ccc",
    },

    roleActive: {
        backgroundColor: "#4f46e5",
        borderColor: "#4f46e5",
    },

    roleText: {
        color: "#333",
    },

    roleTextActive: {
        color: "#fff",
        fontWeight: "bold",
    },

    signUpButton: {
        backgroundColor: "#4f46e5",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
    },

    signUpButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Register;