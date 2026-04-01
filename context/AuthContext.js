import React, { createContext, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            console.log("🛠️ [AuthContext]: Initializing session check...");
            const token = await AsyncStorage.getItem('accessToken');
            const complete = await AsyncStorage.getItem('isComplete');

            setUserToken(token);
            setIsComplete(complete === 'true');
            console.log("🔍 [AuthContext]: Session loaded. Token exists:", !!token);
        } catch (e) {
            console.error("🚨 [AuthContext]: Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (data) => {
        try {
            console.log("🔑 [AuthContext]: Processing Sign-In data...");

            // 1. Get the new token OR keep the current one
            const token = data.accessToken || data.token || userToken;
            const completeStatus = data.complete ?? isComplete;

            // 2. Only fail if we have NO token at all (new or old)
            if (!token) {
                console.error("❌ [AuthContext]: No token found!");
                return;
            }

            // 3. Update State
            setUserToken(token);
            setIsComplete(!!completeStatus);

            // 4. Persist
            await AsyncStorage.setItem("accessToken", token);
            await AsyncStorage.setItem("isComplete", String(completeStatus));

            // If the data contains user details, save them
            if (data.id || data.name) {
                await AsyncStorage.setItem("userDetails", JSON.stringify(data));
            }

            console.log("✅ [AuthContext]: State and Storage updated successfully.");
        } catch (error) {
            console.error("🚨 [AuthContext]: SignIn Error:", error);
        }
    };

    const signOut = async () => {
        try {
            console.log("🚪 [AuthContext]: Logging out...");
            setUserToken(null);
            setIsComplete(false);
            await AsyncStorage.multiRemove(['accessToken', 'isComplete', 'userDetails', 'refreshToken']);
        } catch (e) {
            console.error("🚨 [AuthContext]: Sign-out Error:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ isLoading, userToken, isComplete, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};