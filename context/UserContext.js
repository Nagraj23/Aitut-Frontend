import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { ASSESSMENT_URL } from '../Constants/Api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // 1. Pulling state from AuthContext (userData now contains uni, year, dept)
    const { userToken, userData, hasRoadmap } = useContext(AuthContext);

    const [roadmap, setRoadmap] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    /**
     * FETCH: API call to Django Assessment Service
     */
    const fetchLatestFromDB = useCallback(async (userId, token) => {
        try {
            // Using ID from Spring Boot (userData.id)
            const res = await axios.get(`${ASSESSMENT_URL}/roadmaps/latest/${userId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 200 && res.data) {
                const dbData = res.data;
                setRoadmap(dbData);
                await AsyncStorage.setItem('userRoadmap', JSON.stringify(dbData));
                console.log("✅ [UserContext]: Roadmap synced from Django");
                return dbData;
            }
        } catch (error) {
            if (error.response?.status === 404) {
                console.log("ℹ️ [UserContext]: No roadmap found in DB.");
                setRoadmap(null);
                await AsyncStorage.removeItem('userRoadmap');
            } else {
                console.log("🚨 [UserContext]: DB Fetch Failed", error.message);
            }
        }
        return null;
    }, []);

    /**
     * SYNC: Prioritize Cache then Update from Network
     */
    const syncRoadmapWithDB = useCallback(async () => {
        // Ensure we have the Spring UUID and Token
        if (!userData?.id || !userToken) return;

        setIsDataLoading(true);
        try {
            // 1. Check Local Storage first for speed
            const cached = await AsyncStorage.getItem('userRoadmap');
            if (cached) {
                const parsed = JSON.parse(cached);

                // Security check: ensure roadmap belongs to the ID in our AuthResponse
                if (parsed.spring_user_id === userData.id || parsed.user_id === userData.id) {
                    setRoadmap(parsed);
                } else {
                    await AsyncStorage.removeItem('userRoadmap');
                }
            }

            // 2. Fetch fresh data only if the Auth state says a roadmap exists
            if (hasRoadmap) {
                await fetchLatestFromDB(userData.id, userToken);
            }
        } catch (err) {
            console.log("🚨 [UserContext]: Sync Error", err.message);
        } finally {
            setIsDataLoading(false);
        }
    }, [userData?.id, userToken, hasRoadmap, fetchLatestFromDB]);

    /**
     * EFFECT: Automatically trigger sync when status changes
     */
    useEffect(() => {
        if (userToken && userData?.id) {
            if (hasRoadmap) {
                syncRoadmapWithDB();
            } else {
                // If hasRoadmap becomes false, clear the view
                setRoadmap(null);
            }
        } else {
            // Cleanup on logout
            setRoadmap(null);
        }
    }, [userToken, userData?.id, hasRoadmap, syncRoadmapWithDB]);

    /**
     * CLEAR: Used during Sign Out
     */
    const clearRoadmap = async () => {
        setRoadmap(null);
        setIsDataLoading(false);
        await AsyncStorage.removeItem('userRoadmap');
    };

    return (
        <UserContext.Provider value={{
            roadmap,
            setRoadmap,
            isDataLoading,
            refreshRoadmap: syncRoadmapWithDB,
            clearRoadmap,
            // Pro Tip: Expose academic context for other components to use easily
            userAcademicContext: {
                university: userData?.university,
                year: userData?.year,
                department: userData?.department,
                college: userData?.college
            }
        }}>
            {children}
        </UserContext.Provider>
    );
};