import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform,
    ScrollView, ActivityIndicator, StatusBar
} from 'react-native';
import { AUTH_URL } from '../Constants/Api';
import OtpInput from './OtpInput';

// Styled to match Login.js — purple brand header + white card
export default function VerifyOTP({ navigation, route }) {
    const { email, type } = route.params;
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < 4) {
            Alert.alert('Error', 'Please enter the 4-digit code.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${AUTH_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode, type }),
            });

            // ✅ Handle both JSON and plain-text responses from server
            const contentType = res.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                data = { message: text };
            }

            if (res.ok) {
                navigation.navigate('Login', { email, otp: otpCode });
            } else {
                Alert.alert('Verification Failed', data.message || 'Invalid code. Please try again.');
            }
        } catch (err) {
            Alert.alert('Connection Error', 'Could not reach server. Check your network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Brand Header — matches Login.js */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                    <Text style={styles.brandName}>AiTut</Text>
                    <Text style={styles.tagline}>Your AI-powered learning companion</Text>
                </View>

                {/* Card — matches Login.js card style */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Verify Account</Text>
                    <Text style={styles.cardSubtitle}>
                        Enter the 4-digit code sent to{'\n'}
                        <Text style={styles.emailHighlight}>{email}</Text>
                    </Text>

                    {/* OTP Input */}
                    <View style={styles.otpWrapper}>
                        <OtpInput otp={otp} setOtp={setOtp} />
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleVerify}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color="#FFF" />
                            : <Text style={styles.primaryBtnText}>Verify →</Text>
                        }
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Wrong email? </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Text style={styles.footerLink}>Go back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#4F46E5' },
    scrollContent: { flexGrow: 1, paddingBottom: 30 },

    // Brand header — identical to Login.js
    header: { alignItems: 'center', paddingTop: 70, paddingBottom: 36 },
    logoBox: {
        width: 60, height: 60, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    },
    logoText: { fontSize: 28, fontWeight: '900', color: '#FFF' },
    brandName: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
    tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

    // Card — identical to Login.js
    card: {
        backgroundColor: '#FFF', marginHorizontal: 20,
        borderRadius: 28, padding: 28, elevation: 12,
        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    cardSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 24, lineHeight: 20 },
    emailHighlight: { fontWeight: '700', color: '#4F46E5' },

    otpWrapper: { marginBottom: 24 },

    primaryBtn: {
        backgroundColor: '#4F46E5', borderRadius: 16,
        paddingVertical: 16, alignItems: 'center', marginBottom: 20,
        elevation: 4, shadowColor: '#4F46E5', shadowOpacity: 0.3, shadowRadius: 10,
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    footerRow: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { fontSize: 14, color: '#94A3B8' },
    footerLink: { fontSize: 14, color: '#4F46E5', fontWeight: '700' },
});