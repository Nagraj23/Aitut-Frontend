import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const    AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Global UI Flags
    const [isComplete, setIsComplete] = useState(false);
    const [testCount, setTestCount] = useState(0);
    const [hasRoadmap, setHasRoadmap] = useState(false);

    useEffect(() => { loadStoredData(); }, []);

    const loadStoredData = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const details = await AsyncStorage.getItem('userDetails');
            if (token) setUserToken(token);
            if (details) {
                const parsed = JSON.parse(details);
                setUserData(parsed);
                // Sync internal flags from storage (AuthResponse fields)
                setIsComplete(parsed.isComplete || false);
                setTestCount(parsed.testCount || 0);
                setHasRoadmap(parsed.hasRoadmap || false);
            }
        } catch (e) { console.error("Auth Load Error", e); }
        finally { setIsLoading(false); }
    };

    const updateUser = async (newDetails) => {
        try {
            const updatedData = { ...userData, ...newDetails };
            setUserData(updatedData);

            // Sync specific flags for the Home Screen logic from AuthResponse fields
            if (newDetails.isComplete !== undefined) setIsComplete(newDetails.isComplete);
            if (newDetails.testCount !== undefined) setTestCount(newDetails.testCount);
            if (newDetails.hasRoadmap !== undefined) setHasRoadmap(newDetails.hasRoadmap);

            await AsyncStorage.setItem('userDetails', JSON.stringify(updatedData));
            console.log("✅ Profile Sync Successful");
        } catch (e) { console.error("Failed to update user storage", e); }
    };

    const signIn = async (data) => {
        // Data here matches your Spring Boot AuthResponse DTO
        const token = data.accessToken;
        const refreshToken = data.refreshToken;

        setUserToken(token);

        // This will now include: id, name, role, university, year, dept, clg, etc.
        setUserData(data);

        setIsComplete(data.isComplete || false);
        setTestCount(data.testCount || 0);
        setHasRoadmap(data.hasRoadmap || false);

        await AsyncStorage.setItem("accessToken", token);
        if (refreshToken) await AsyncStorage.setItem("refreshToken", refreshToken);
        await AsyncStorage.setItem("userDetails", JSON.stringify(data));
    };

    const signOut = async () => {
        setUserToken(null);
        setUserData(null);
        setIsComplete(false);
        setHasRoadmap(false);
        setTestCount(0);
        await AsyncStorage.clear();
    };

    return (
        <AuthContext.Provider value={{
            userToken,
            userData, // Access university, year, dept via userData.university etc.
            isLoading,
            isComplete,
            testCount,
            hasRoadmap,
            role: userData?.role,
            signIn,
            signOut,
            updateUser,
            setIsComplete,
            setTestCount,
            setHasRoadmap
        }}>
            {children}
        </AuthContext.Provider>
    );
};