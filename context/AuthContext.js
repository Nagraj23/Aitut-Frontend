import React, { createContext, useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [role, setRole] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const complete = await AsyncStorage.getItem('isComplete');
            const userDetails = await AsyncStorage.getItem('userDetails');

            if (token) setUserToken(token);
            if (complete) setIsComplete(complete === 'true');

            if (userDetails) {
                const parsed = JSON.parse(userDetails);
                setUserData(parsed);
                setRole(parsed?.role);
            }
        } catch (e) {
            console.error("🚨 [AuthContext]: Load Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (data) => {
        try {
            const token = data.accessToken || data.token;
            setUserToken(token);
            setIsComplete(!!data.complete);
            setUserData(data);
            setRole(data.role);

            await AsyncStorage.setItem("accessToken", token);
            await AsyncStorage.setItem("isComplete", String(data.complete));
            await AsyncStorage.setItem("userDetails", JSON.stringify(data));
        } catch (error) {
            console.error("🚨 [AuthContext]: SignIn Error:", error);
        }
    };

    const signOut = async () => {
        setUserToken(null);
        setIsComplete(false);
        setUserData(null);
        setRole(null);
        await AsyncStorage.multiRemove(['accessToken', 'isComplete', 'userDetails', 'role', 'userRoadmap']);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{
            isLoading,
            userToken,
            isComplete,
            setIsComplete, // ✅ Exported
            role,
            userData,
            setUserData,   // ✅ Exported (Fixes the undefined error)
            signIn,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};