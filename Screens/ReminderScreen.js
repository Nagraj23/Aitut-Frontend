import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { scheduleHardwareStudyAlarm } from './LocalScheduler';

export default function ReminderScreen() {
    const { userData, userToken } = useContext(AuthContext);
    const { roadmap } = useContext(UserContext);

    // Alarm clock states
    const [alarmHour, setAlarmHour] = useState('08');
    const [alarmMinute, setAlarmMinute] = useState('00');
    const [isPm, setIsPm] = useState(true);

    // Robust subject parser handling both Array, Object with nested structures, or Object fields
    const getDistinctSubjects = () => {
        if (!roadmap) return userData?.targetCourse ? [userData.targetCourse] : [];

        // If roadmap context itself is an array
        if (Array.isArray(roadmap)) {
            return Array.from(new Set(roadmap.map(item => item.subject).filter(Boolean)));
        }

        // If nested inside an object property (e.g., roadmap.data or roadmap.modules)
        const targetList = roadmap.data || roadmap.modules || roadmap.items || [];
        if (Array.isArray(targetList) && targetList.length > 0) {
            return Array.from(new Set(targetList.map(item => item.subject).filter(Boolean)));
        }

        // Fallback to primary titles stored on Django/Spring response
        const fallbackSubject = roadmap.title || roadmap.subject || userData?.targetCourse;
        return fallbackSubject ? [fallbackSubject] : [];
    };

    const distinctSubjects = getDistinctSubjects();

    // Clock Increment / Decrement Handlers
    const incrementValue = (current, max, setter) => {
        let val = parseInt(current, 10) + 1;
        if (val > max) val = (max === 12 ? 1 : 0);
        setter(val.toString().padStart(2, '0'));
    };

    const decrementValue = (current, max, setter) => {
        let val = parseInt(current, 10) - 1;
        if (max === 12 && val < 1) val = 12;
        else if (max === 59 && val < 0) val = 59;
        setter(val.toString().padStart(2, '0'));
    };

    const handleSetExactAlarm = async (subjectName) => {
        // Safe entity extraction matching parsed source
        let activeTask = null;
        if (Array.isArray(roadmap)) {
            activeTask = roadmap.find(item => item.subject === subjectName);
        } else if (roadmap && Array.isArray(roadmap.data || roadmap.modules)) {
            const list = roadmap.data || roadmap.modules;
            activeTask = list.find(item => item.subject === subjectName);
        }

        // Context fallback container construct
        const trackingSubject = activeTask?.subject || subjectName;
        const trackingDay = activeTask?.day_number || activeTask?.day || 1;
        const trackingTopic = activeTask?.topic || "Introduction Lecture";

        let hours = parseInt(alarmHour, 10);
        const minutes = parseInt(alarmMinute, 10);

        if (isPm && hours !== 12) hours += 12;
        if (!isPm && hours === 12) hours = 0;

        const targetTimestamp = new Date();
        targetTimestamp.setHours(hours);
        targetTimestamp.setMinutes(minutes);
        targetTimestamp.setSeconds(0);
        targetTimestamp.setMilliseconds(0);

        if (targetTimestamp.getTime() <= Date.now()) {
            targetTimestamp.setDate(targetTimestamp.getDate() + 1);
        }

        try {
            await scheduleHardwareStudyAlarm(
                trackingSubject,
                trackingDay,
                trackingTopic,
                targetTimestamp,
                userToken
            );

            const timeString = `${alarmHour}:${alarmMinute} ${isPm ? 'PM' : 'AM'}`;
            const dayString = targetTimestamp.getDate() === new Date().getDate() ? 'Today' : 'Tomorrow';

            Alert.alert(
                "⏰ Alarm Activated!",
                `Study session for "${trackingSubject}" successfully configured for ${dayString} at ${timeString}.\n\nWhen it rings, tap [Start] to begin learning "${trackingTopic}" instantly!`
            );
        } catch (error) {
            Alert.alert("Registry Sync Failure", error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header Block */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⏰ Custom Alarm Center</Text>
                <Text style={styles.headerSubtitle}>
                    Student Profile: {userData?.name || "User"} ({userData?.department || userData?.dept || "CSE"})
                </Text>
            </View>

            {/* 📟 The Custom Digital Clock Widget Grid */}
            <View style={styles.clockWidgetContainer}>
                <Text style={styles.clockWidgetTitle}>Set Study Wake-up Time</Text>

                <View style={styles.digitalRow}>
                    {/* Hour Picker Column */}
                    <View style={styles.timeColumn}>
                        <TouchableOpacity onPress={() => incrementValue(alarmHour, 12, setAlarmHour)} style={styles.arrowBtn}>
                            <Text style={styles.arrowText}>▲</Text>
                        </TouchableOpacity>
                        <View style={styles.numberBox}>
                            <Text style={styles.digitalNumber}>{alarmHour}</Text>
                        </View>
                        <TouchableOpacity onPress={() => decrementValue(alarmHour, 12, setAlarmHour)} style={styles.arrowBtn}>
                            <Text style={styles.arrowText}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.digitalColon}>:</Text>

                    {/* Minute Picker Column */}
                    <View style={styles.timeColumn}>
                        <TouchableOpacity onPress={() => incrementValue(alarmMinute, 59, setAlarmMinute)} style={styles.arrowBtn}>
                            <Text style={styles.arrowText}>▲</Text>
                        </TouchableOpacity>
                        <View style={styles.numberBox}>
                            <Text style={styles.digitalNumber}>{alarmMinute}</Text>
                        </View>
                        <TouchableOpacity onPress={() => decrementValue(alarmMinute, 59, setAlarmMinute)} style={styles.arrowBtn}>
                            <Text style={styles.arrowText}>▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* AM / PM Selector Column */}
                    <View style={styles.ampmColumn}>
                        <TouchableOpacity
                            style={[styles.ampmButton, !isPm && styles.ampmActive]}
                            onPress={() => setIsPm(false)}
                        >
                            <Text style={[styles.ampmText, !isPm && styles.ampmActiveText]}>AM</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.ampmButton, isPm && styles.ampmActive]}
                            onPress={() => setIsPm(true)}
                        >
                            <Text style={[styles.ampmText, isPm && styles.ampmActiveText]}>PM</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Assign Selected Time to a Subject:</Text>

            {distinctSubjects.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No subjects loaded inside active roadmap context.</Text>
                </View>
            ) : (
                distinctSubjects.map((subject, index) => (
                    <View key={index} style={styles.subjectCard}>
                        <View style={styles.cardInfo}>
                            <Text style={styles.subjectName}>{subject}</Text>
                            <Text style={styles.metaText}>
                                Will ring at {alarmHour}:{alarmMinute} {isPm ? 'PM' : 'AM'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleSetExactAlarm(subject)}
                        >
                            <Text style={styles.actionButtonText}>Set Alarm</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    contentContainer: { paddingBottom: 30 },
    header: { backgroundColor: '#4F46E5', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 20 },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
    clockWidgetContainer: { backgroundColor: '#1E1B4B', marginHorizontal: 20, padding: 20, borderRadius: 24, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, marginBottom: 25 },
    clockWidgetTitle: { color: '#93C5FD', fontSize: 14, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    digitalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    timeColumn: { alignItems: 'center', width: 70 },
    arrowBtn: { padding: 6, width: '100%', alignItems: 'center' },
    arrowText: { color: '#6366F1', fontSize: 16, fontWeight: 'bold' },
    numberBox: { backgroundColor: '#312E81', width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    digitalNumber: { color: '#FFF', fontSize: 32, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
    digitalColon: { color: '#FFF', fontSize: 32, fontWeight: '700', marginHorizontal: 10, marginBottom: 4 },
    ampmColumn: { marginLeft: 16, justifyContent: 'space-between', height: 74 },
    ampmButton: { backgroundColor: '#312E81', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
    ampmActive: { backgroundColor: '#4F46E5' },
    ampmText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
    ampmActiveText: { color: '#FFF' },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', paddingHorizontal: 20, marginBottom: 12 },
    subjectCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1 },
    cardInfo: { flex: 1 },
    subjectName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    metaText: { fontSize: 12, color: '#4F46E5', fontWeight: '600', marginTop: 4 },
    actionButton: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12 },
    actionButtonText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
    emptyCard: { backgroundColor: '#FFF', margin: 20, padding: 24, borderRadius: 16, alignItems: 'center' },
    emptyText: { color: '#64748B', textAlign: 'center' }
});