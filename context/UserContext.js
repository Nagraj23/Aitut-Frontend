import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { ASSESSMENT_URL } from '../Constants/Api';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const { userToken } = useContext(AuthContext);

    const [roadmap, setRoadmap] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    // 🚀 INIT
    useEffect(() => {
        if (userToken) {
            console.log("🚀 Token detected → loading roadmap...");
            initializeRoadmap();
        } else {
            console.log("🧹 No token → clearing roadmap");
            setRoadmap(null);
        }
    }, [userToken]);

    // 🚀 INIT ROADMAP
    const initializeRoadmap = async () => {
        setIsDataLoading(true);

        try {
            const localRoadmap = await AsyncStorage.getItem('userRoadmap');

            console.log("📦 Cached roadmap:", localRoadmap);

            if (localRoadmap) {
                const parsed = JSON.parse(localRoadmap);

                const normalized = {
                    ...parsed,
                    days: parsed.daily_plan || []
                };

                setRoadmap(normalized);

                console.log("✅ Loaded roadmap from storage");
                console.log("📊 Days:", normalized.days.length);
            } else {
                console.log("🌐 No cache → fetching roadmap");
                await fetchRoadmap();
            }

        } catch (err) {
            console.error("🚨 Init error:", err);
        } finally {
            setIsDataLoading(false);
        }
    };

    // 🚀 FETCH ROADMAP ONLY
    const fetchRoadmap = async () => {
        setIsDataLoading(true);

        try {
            const storedDetails = await AsyncStorage.getItem('userDetails');

            if (!storedDetails) {
                console.warn("⚠️ No userDetails found");
                return;
            }

            const { id } = JSON.parse(storedDetails);

            console.log("🆔 User ID:", id);

            const res = await fetch(
                `${ASSESSMENT_URL}/roadmaps/latest/${id}/`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!res.ok) {
                console.error("❌ Roadmap fetch failed:", res.status);
                return;
            }

            const data = await res.json();

            console.log("📥 RAW ROADMAP:", data);

            const normalized = {
                ...data,
                days: data.daily_plan || []
            };

            setRoadmap(normalized);

            await AsyncStorage.setItem(
                'userRoadmap',
                JSON.stringify(normalized)
            );

            console.log("✅ Roadmap stored & set");

        } catch (error) {
            console.error("🚨 Fetch error:", error);

            try {
                const cached = await AsyncStorage.getItem('userRoadmap');
                if (cached) {
                    setRoadmap(JSON.parse(cached));
                    console.log("📂 fallback roadmap loaded");
                }
            } catch (e) {
                console.error("❌ fallback failed:", e);
            }

        } finally {
            setIsDataLoading(false);
        }
    };

    return (
        <UserContext.Provider
            value={{
                roadmap,
                isDataLoading,
                fetchRoadmap
            }}
        >
            {children}
        </UserContext.Provider>
    );
};