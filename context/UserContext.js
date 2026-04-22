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
        console.log("🔁 UserContext init triggered");

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
            console.log("📦 Checking AsyncStorage cache...");

            const cached = await AsyncStorage.getItem('userRoadmap');

            if (cached) {
                const parsed = JSON.parse(cached);

                console.log("📂 CACHE FOUND");
                console.log("📊 Cached roadmap title:", parsed?.title);
                console.log("📊 Cached days:", parsed?.daily_plan?.length);

                setRoadmap(parsed);
            } else {
                console.log("❌ No cache found");
            }

            console.log("🌐 Calling API refresh...");
            await fetchRoadmap();

        } catch (err) {
            console.error("🚨 Init error:", err);
            await fetchRoadmap();
        } finally {
            setIsDataLoading(false);
        }
    };

    // 🚀 FETCH FROM API
    const fetchRoadmap = async () => {
        setIsDataLoading(true);

        try {
            const storedDetails = await AsyncStorage.getItem('userDetails');

            if (!storedDetails) {
                console.warn("⚠️ No userDetails found in storage");
                return;
            }

            const { id } = JSON.parse(storedDetails);

            console.log("🆔 USER ID:", id);
            console.log("🌍 API:", `${ASSESSMENT_URL}/roadmaps/latest/${id}/`);

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

            console.log("📡 Response status:", res.status);

            if (!res.ok) {
                const errText = await res.text();
                console.error("❌ API ERROR BODY:", errText);
                return;
            }

            const data = await res.json();

            // console.log("📥 RAW ROADMAP RESPONSE:");
            // console.log(JSON.stringify(data, null, 2));

            // console.log("📊 Title:", data?.title);
            // console.log("📊 Subject:", data?.subject);
            // console.log("📊 Days count:", data?.daily_plan?.length);

            setRoadmap({ ...data });

            await AsyncStorage.setItem(
                'userRoadmap',
                JSON.stringify(data)
            );

            console.log("💾 Roadmap cached successfully");

        } catch (error) {
            console.error("🚨 FETCH FAILED:", error);

            try {
                const cached = await AsyncStorage.getItem('userRoadmap');

                if (cached) {
                    const parsed = JSON.parse(cached);
                    console.log("📂 FALLBACK CACHE USED");
                    console.log("📊 Days:", parsed?.daily_plan?.length);

                    setRoadmap(parsed);
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