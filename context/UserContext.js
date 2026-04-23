import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { ASSESSMENT_URL } from '../Constants/Api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { userToken, userData } = useContext(AuthContext);
    const [roadmap, setRoadmap] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    useEffect(() => {
        if (userToken && userData?.id) {
            syncRoadmapWithDB();
        } else {
            setRoadmap(null);
        }
    }, [userToken, userData?.id]); // Only re-run if token or specific user ID changes

    const syncRoadmapWithDB = async () => {
        if (!userData?.id) return;
        setIsDataLoading(true);
        try {
            // 1. Try Cache
            const cached = await AsyncStorage.getItem('userRoadmap');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.user_id === userData.id) {
                    setRoadmap(parsed);
                }
            }

            // 2. Fetch Latest from Django
            await fetchLatestFromDB(userData.id);
        } catch (err) {
            console.log("Roadmap Sync Error:", err);
        } finally {
            setIsDataLoading(false);
        }
    };

    const fetchLatestFromDB = async (userId) => {
        try {
            // URL matches your Django: /roadmaps/latest/<id>/
            const res = await fetch(`${ASSESSMENT_URL}/roadmaps/latest/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const dbData = await res.json();
                // Check if roadmap exists in the response
                if (dbData && !dbData.error) {
                    setRoadmap(dbData);
                    await AsyncStorage.setItem('userRoadmap', JSON.stringify(dbData));
                }
            }
        } catch (error) {
            console.log("🚨 Roadmap DB Fetch Failed:", error.message);
        }
    };

    return (
        <UserContext.Provider value={{
            roadmap,
            setRoadmap,
            isDataLoading,
            refreshRoadmap: syncRoadmapWithDB
        }}>
            {children}
        </UserContext.Provider>
    );
};