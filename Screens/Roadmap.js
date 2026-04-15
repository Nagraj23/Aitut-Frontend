import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // Or your preferred icon library

const RoadmapDetailScreen = ({ route }) => {
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRoadmapDetails = async () => {
        try {
            // 1. Ensure this IP matches your COMPUTER'S local IP if using a physical phone
            // 2. Ensure the path matches your Django URL configuration
            const userId = "550e8400-e29b-41d4-a716-446655440000";
            const response = await axios.get(`http://localhost:8001/api/roadmaps/latest/${userId}/`);
console.log(response);
            setRoadmap(response.data);
        } catch (error) {
            // Detailed logging to help you find the cause
            if (error.response) {
                console.error("Server Error:", error.response.status);
            } else if (error.request) {
                console.error("Network Error: No response received. Check your server IP/Port.");
            } else {
                console.error("Error:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmapDetails();
    }, []);

    const renderStep = ({ item, index }) => (
        <View style={styles.stepContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineContainer}>
                <View style={[styles.dot, item.is_completed && styles.completedDot]} />
                {index !== roadmap.daily_plan.length - 1 && <View style={styles.line} />}
            </View>

            {/* Task Card */}
            <TouchableOpacity style={styles.taskCard} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                    <Text style={styles.dayText}>Day {item.day}</Text>
                    {item.is_completed && <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />}
                </View>
                <Text style={styles.topicText}>{item.topic}</Text>
                <Text style={styles.taskDescription}>{item.task}</Text>

                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#9788FB" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={roadmap?.daily_plan}
                keyExtractor={(item) => item.day.toString()}
                renderItem={renderStep}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.header}>
                        <Text style={styles.title}>{roadmap?.title}</Text>
                        <Text style={styles.overview}>{roadmap?.overview}</Text>

                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>Overall Progress: {roadmap?.progress}%</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${roadmap?.progress}%` }]} />
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 25, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    overview: { fontSize: 14, color: '#64748B', marginTop: 5, lineHeight: 20 },

    progressSection: { marginTop: 20 },
    progressLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 8 },
    progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4 },
    progressBarFill: { height: 8, backgroundColor: '#9788FB', borderRadius: 4 },

    listContent: { padding: 20 },
    stepContainer: { flexDirection: 'row', marginBottom: 0 },
    timelineContainer: { alignItems: 'center', width: 30 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1', zIndex: 1, marginTop: 5 },
    completedDot: { backgroundColor: '#9788FB' },
    line: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: -5 },

    taskCard: {
        flex: 1,
        backgroundColor: '#FFF',
        marginLeft: 15,
        marginBottom: 25,
        padding: 16,
        borderRadius: 18,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayText: { fontSize: 12, fontWeight: '800', color: '#9788FB', textTransform: 'uppercase' },
    topicText: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
    taskDescription: { fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 20 },

    typeBadge: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 12 },
    typeText: { fontSize: 11, fontWeight: '700', color: '#475569' }
});

export default RoadmapDetailScreen;