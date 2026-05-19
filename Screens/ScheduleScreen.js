import React, { useState, useContext, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { UserContext } from './UserContext'; // Path to your UserContext file
import { AuthContext } from './AuthContext'; // Path to your AuthContext file
import { scheduleHardwareStudyAlarm } from './LocalScheduler';

export default function ScheduleScreen() {
    // 1. Extract roadmap and profile identities directly from your custom global providers
    const { roadmap, isDataLoading } = useContext(UserContext);
    const { userData } = useContext(AuthContext);

    const [selectedSubject, setSelectedSubject] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    // 2. Parse out unique, distinct subject lists from the 50-day task tracking array
    const extractedSubjects = useMemo(() => {
        if (!roadmap || !roadmap.roadmap_tasks) return [];

        // Group tasks by unique subject keys
        const subjectsMap = {};
        roadmap.roadmap_tasks.forEach(task => {
            if (!subjectsMap[task.subject]) {
                subjectsMap[task.subject] = [];
            }
            subjectsMap[task.subject].push(task);
        });

        return Object.keys(subjectsMap).map(subjectName => ({
            name: subjectName,
            totalTasks: subjectsMap[subjectName].length,
            tasks: subjectsMap[subjectName].sort((a, b) => a.day_number - b.day_number)
        }));
    }, [roadmap]);

    const handleSelectSubjectCard = (subject) => {
        setSelectedSubject(subject);
        setDatePickerVisibility(true);
    };

    const handleConfirmSchedule = async (date) => {
        setDatePickerVisibility(false);

        if (date.getTime() <= Date.now()) {
            Alert.alert('Scheduling Error', 'Please select a future point in time.');
            return;
        }

        // Grab the first unfinished topic milestone for the selected target subject
        // (In production, you can replace this with their active sequential day counter)
        const targetTask = selectedSubject.tasks[0];

        try {
            await scheduleHardwareStudyAlarm(
                selectedSubject.name,
                targetTask.day_number,
                targetTask.topic,
                date
            );

            Alert.alert(
                'Alarm Secured! ⏰',
                `AItut has registered an offline-safe hardware alarm for ${selectedSubject.name}.\n\nTime: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            );
        } catch (error) {
            Alert.alert('Hardware Sync Error', 'Failed to anchor configurations to system clock.');
        }
    };

    if (isDataLoading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.infoText}>Analyzing active study parameters...</Text>
            </View>
        );
    }

    if (!roadmap || extractedSubjects.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.warningText}>⚠️ No Active Roadmap Tracking Found</Text>
                <Text style={styles.subWarningText}>Complete your diagnostic testing tiers first to unlock scheduling prompts.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>📆 Study Scheduler</Text>
                <Text style={styles.subtitle}>Student Profile: {userData?.name || "AItut User"}</Text>
            </View>

            <Text style={styles.sectionLabel}>Select a subject to target:</Text>

            <FlatList
                data={extractedSubjects}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listWrapper}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.subjectCard, selectedSubject?.name === item.name && styles.activeCard]}
                        onPress={() => handleSelectSubjectCard(item)}
                    >
                        <View>
                            <Text style={styles.subjectName}>{item.name}</Text>
                            <Text style={styles.taskCount}>{item.totalTasks} Sequential Sessions Cached</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Set Alert</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirmSchedule}
                onCancel={() => setDatePickerVisibility(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 24, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#E5E7EB' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionLabel: { fontSize: 16, fontWeight: '600', color: '#374151', marginHorizontal: 24, marginTop: 20, marginBottom: 10 },
    listWrapper: { paddingHorizontal: 24, paddingBottom: 20 },
    subjectCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', elevation: 1 },
    activeCard: { borderColor: '#4F46E5', backgroundColor: '#EEF2F6' },
    subjectName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    taskCount: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    badge: { backgroundColor: '#4F46E5', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    badgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    infoText: { fontSize: 16, color: '#4F46E5', fontWeight: '500' },
    warningText: { fontSize: 18, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
    subWarningText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 }
});
