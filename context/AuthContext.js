import React, { createContext, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [role, setRole] = useState(null); // ✅ ROLE STATE

    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            console.log("🛠️ [AuthContext]: Initializing session check...");

            const token = await AsyncStorage.getItem('accessToken');
            const complete = await AsyncStorage.getItem('isComplete');
            const storedRole = await AsyncStorage.getItem('role');
            const userDetails = await AsyncStorage.getItem('userDetails');

            let parsedRole = storedRole;

            // 🔥 FALLBACK: If role not directly stored, extract from userDetails
            if (!parsedRole && userDetails) {
                const parsed = JSON.parse(userDetails);
                parsedRole = parsed?.role;
            }

            setUserToken(token);
            setIsComplete(complete === 'true');
            setRole(parsedRole);

            console.log("🔍 [AuthContext]: Session loaded. Token exists:", !!token);
            console.log("👤 [AuthContext]: Role loaded:", parsedRole);

        } catch (e) {
            console.error("🚨 [AuthContext]: Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (data) => {
        try {
            console.log("🔑 [AuthContext]: Processing Sign-In data...");

            const token = data.accessToken || data.token || userToken;
            const completeStatus = data.complete ?? isComplete;

            // ✅ ALWAYS PICK ROLE FROM RESPONSE FIRST
            const userRole = data.role;

            if (!token) {
                console.error("❌ [AuthContext]: No token found!");
                return;
            }

            // 🔥 DEBUG LOG
            console.log("📦 [AuthContext]: Incoming Role from API:", userRole);

            // 1. Update State
            setUserToken(token);
            setIsComplete(!!completeStatus);
            setRole(userRole);

            // 2. Persist
            await AsyncStorage.setItem("accessToken", token);
            await AsyncStorage.setItem("isComplete", String(completeStatus));

            // ✅ STORE ROLE SEPARATELY (important for fast access)
            if (userRole) {
                await AsyncStorage.setItem("role", userRole);
            }

            // Save full user data
            if (data.id || data.name || data.role) {
                await AsyncStorage.setItem("userDetails", JSON.stringify(data));
            }

            console.log("✅ [AuthContext]: State and Storage updated successfully.");
            console.log("👤 [AuthContext]: Role set to:", userRole);

        } catch (error) {
            console.error("🚨 [AuthContext]: SignIn Error:", error);
        }
    };

    const signOut = async () => {
        try {
            console.log("🚪 [AuthContext]: Logging out...");

            setUserToken(null);
            setIsComplete(false);
            setRole(null);

            await AsyncStorage.multiRemove([
                'accessToken',
                'isComplete',
                'userDetails',
                'refreshToken',
                'role'
            ]);

            console.log("✅ [AuthContext]: Cleared all session data.");

        } catch (e) {
            console.error("🚨 [AuthContext]: Sign-out Error:", e);
        }
    };

    // 🔥 LOADER UI (optional but clean UX)
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isLoading,
                userToken,
                isComplete,
                role, // ✅ FINAL ROLE
                signIn,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};