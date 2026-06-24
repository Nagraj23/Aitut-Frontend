import React, { useState, useContext } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Modal
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { AuthContext } from '../context/AuthContext';
import { scheduleHardwareStudyAlarm } from './LocalScheduler';

export default function ReminderScreen() {
    const { userData, userToken } = useContext(AuthContext);
    const { roadmap } = useContext(UserContext);

    // Alarm Clock States (Preserved Exactly)
    const [alarmHour, setAlarmHour] = useState('08');
    const [alarmMinute, setAlarmMinute] = useState('00');
    const [isPm, setIsPm] = useState(true);

    // UI View Sheet States
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Robust Subject Parser (Preserved Exactly)
    const getDistinctSubjects = () => {
        if (!roadmap) return userData?.targetCourse ? [userData.targetCourse] : [];

        if (Array.isArray(roadmap)) {
            return Array.from(new Set(roadmap.map(item => item.subject).filter(Boolean)));
        }

        const targetList = roadmap.data || roadmap.modules || roadmap.items || [];
        if (Array.isArray(targetList) && targetList.length > 0) {
            return Array.from(new Set(targetList.map(item => item.subject).filter(Boolean)));
        }

        const fallbackSubject = roadmap.title || roadmap.subject || userData?.targetCourse;
        return fallbackSubject ? [fallbackSubject] : [];
    };

    const distinctSubjects = getDistinctSubjects();

    // Clock Stepper Up / Down Handlers (Preserved Exactly)
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

    // Alarm Execution Pipeline (Preserved Exactly)
    const handleConfirmSchedule = async () => {
        if (!selectedSubject) return;

        let activeTask = null;
        if (Array.isArray(roadmap)) {
            activeTask = roadmap.find(item => item.subject === selectedSubject);
        } else if (roadmap && Array.isArray(roadmap.data || roadmap.modules)) {
            const list = roadmap.data || roadmap.modules;
            activeTask = list.find(item => item.subject === selectedSubject);
        }

        const trackingSubject = activeTask?.subject || selectedSubject;
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

            setSelectedSubject(null); // Dismiss modal securely

            Alert.alert(
                "⏰ Alarm Activated!",
                `Study session for "${trackingSubject}" successfully configured for ${dayString} at ${timeString}.\n\nWhen it rings, tap [Start] to begin learning "${trackingTopic}" instantly!`
            );
        } catch (error) {
            Alert.alert("Registry Sync Failure", error.message);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

                {/* Premium Modern Light Dashboard Header */}
                <View style={styles.header}>
                    <View style={styles.headerTopLine}>
                        <Text style={styles.headerTitle}>Custom Alarm Center</Text>
                        <View style={styles.livePulseContainer}>
                            <View style={styles.pulseCircle} />
                            <Text style={styles.pulseText}>CHIP LINKED</Text>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        STUDENT PROFILE: {userData?.name?.toUpperCase() || "USER"} • {userData?.department?.toUpperCase() || userData?.dept?.toUpperCase() || "CSE"}
                    </Text>
                </View>

                {/* Section Header Divider */}
                <View style={styles.sectionHeaderLine}>
                    <Text style={styles.sectionTitle}>Select Roadmap Subject:</Text>
                    <View style={styles.sectionBadge}>
                        <Text style={styles.sectionBadgeText}>{distinctSubjects.length} Courses</Text>
                    </View>
                </View>

                {/* Main Dashboard Subject Mappers List */}
                {distinctSubjects.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyText}>No subjects loaded inside active roadmap context.</Text>
                    </View>
                ) : (
                    distinctSubjects.map((subject, index) => (
                        <View key={index} style={styles.subjectCard}>
                            <View style={styles.cardInfo}>
                                <Text style={styles.subjectName}>{subject}</Text>
                                <Text style={styles.subjectMetaText}>Tap to set your target wakeup study timer</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.setAlarmTriggerBtn}
                                onPress={() => setSelectedSubject(subject)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.setAlarmTriggerBtnText}>Set Alarm</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modular Digital Watch Stepper Bottom Sheet Panel Overlay */}
            <Modal
                visible={selectedSubject !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedSubject(null)}
            >
                <View style={styles.modalBlurBackground}>
                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.dragNotch} />

                        <Text style={styles.modalMainTitle}>Set Wake-Up Timer</Text>
                        <Text style={styles.modalSubTitle}>{selectedSubject}</Text>

                        {/* 📟 Clean Contemporary Digital Watch Module */}
                        <View style={styles.digitalClockWidgetBox}>
                            <View style={styles.digitalRow}>

                                {/* Hour Stepper Segment Column */}
                                <View style={styles.timeColumn}>
                                    <TouchableOpacity onPress={() => incrementValue(alarmHour, 12, setAlarmHour)} style={styles.arrowBtn} activeOpacity={0.4}>
                                        <Text style={styles.arrowText}>▲</Text>
                                    </TouchableOpacity>
                                    <View style={styles.numberBox}>
                                        <Text style={styles.digitalNumber}>{alarmHour}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => decrementValue(alarmHour, 12, setAlarmHour)} style={styles.arrowBtn} activeOpacity={0.4}>
                                        <Text style={styles.arrowText}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.digitalColon}>:</Text>

                                {/* Minute Stepper Segment Column */}
                                <View style={styles.timeColumn}>
                                    <TouchableOpacity onPress={() => incrementValue(alarmMinute, 59, setAlarmMinute)} style={styles.arrowBtn} activeOpacity={0.4}>
                                        <Text style={styles.arrowText}>▲</Text>
                                    </TouchableOpacity>
                                    <View style={styles.numberBox}>
                                        <Text style={styles.digitalNumber}>{alarmMinute}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => decrementValue(alarmMinute, 59, setAlarmMinute)} style={styles.arrowBtn} activeOpacity={0.4}>
                                        <Text style={styles.arrowText}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Interactive Dual Stack Segment Buttons Selector */}
                                <View style={styles.ampmColumn}>
                                    <TouchableOpacity
                                        style={[styles.ampmButton, !isPm && styles.ampmActive]}
                                        onPress={() => setIsPm(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.ampmText, !isPm && styles.ampmActiveText]}>AM</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.ampmButton, isPm && styles.ampmActive]}
                                        onPress={() => setIsPm(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.ampmText, isPm && styles.ampmActiveText]}>PM</Text>
                                    </TouchableOpacity>
                                </View>

                            </View>
                        </View>

                        {/* Action Dialogue Window Bottom Control Triggers */}
                        <View style={styles.modalActionsFooterLine}>
                            <TouchableOpacity
                                style={styles.modalCancelDismissBtn}
                                onPress={() => setSelectedSubject(null)}
                            >
                                <Text style={styles.modalCancelDismissBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalSaveConfirmCta}
                                onPress={handleConfirmSchedule}
                            >
                                <Text style={styles.modalSaveConfirmCtaText}>Confirm Alarm</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 40 },

    // Smooth Slate Header
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? 56 : 36,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    headerTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#0F172A', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    livePulseContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
    pulseCircle: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#15803D', marginRight: 6 },
    pulseText: { color: '#15803D', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    headerSubtitle: { color: '#64748B', fontSize: 11, marginTop: 8, fontWeight: '700', letterSpacing: 0.8 },

    // Balanced List Splitters
    sectionHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, marginBottom: 16 },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B', letterSpacing: -0.2 },
    sectionBadge: { backgroundColor: '#EEF2F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
    sectionBadgeText: { color: '#4F46E5', fontSize: 11, fontWeight: '800' },

    // Minimal Card Substructure blueprints
    subjectCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 18,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6
    },
    cardInfo: { flex: 1, paddingRight: 12 },
    subjectName: { fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2 },
    subjectMetaText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 4 },
    setAlarmTriggerBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14 },
    setAlarmTriggerBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

    // Modal Sheet Interface System
    modalBlurBackground: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
    bottomSheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 32,
        paddingTop: 16,
        alignItems: 'center',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.12,
        shadowRadius: 16
    },
    dragNotch: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#CBD5E1', marginBottom: 18 },
    modalMainTitle: { fontSize: 19, fontWeight: '800', color: '#0F172A' },
    modalSubTitle: { fontSize: 13, fontWeight: '700', color: '#4F46E5', marginTop: 3, marginBottom: 25 },

    // Clean Digital Watch Matrix Widget Core
    digitalClockWidgetBox: {
        backgroundColor: '#F8FAFC',
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        width: '100%',
        alignItems: 'center',
        marginBottom: 30
    },
    digitalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    timeColumn: { alignItems: 'center', width: 75 },
    arrowBtn: { padding: 6, width: '100%', alignItems: 'center' },
    arrowText: { color: '#94A3B8', fontSize: 18, fontWeight: '900' },
    numberBox: { backgroundColor: '#FFFFFF', width: 68, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    digitalNumber: { color: '#0F172A', fontSize: 36, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
    digitalColon: { color: '#94A3B8', fontSize: 36, fontWeight: '800', marginHorizontal: 12, marginBottom: 4 },

    // AM/PM Switch Stack Layout Blueprints
    ampmColumn: { marginLeft: 18, justifyContent: 'space-between', height: 82 },
    ampmButton: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    ampmActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5', elevation: 2, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
    ampmText: { color: '#64748B', fontSize: 13, fontWeight: '800' },
    ampmActiveText: { color: '#FFFFFF' },

    // Confirmation Action Buttons Row Line Controls
    modalActionsFooterLine: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
    modalCancelDismissBtn: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    modalCancelDismissBtnText: { color: '#64748B', fontWeight: '800', fontSize: 14 },
    modalSaveConfirmCta: { flex: 2, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 16, alignItems: 'center', elevation: 3, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
    modalSaveConfirmCtaText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

    // Fallbacks
    emptyCard: { backgroundColor: '#FFFFFF', margin: 20, padding: 32, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    emptyIcon: { fontSize: 36, marginBottom: 12 },
    emptyText: { color: '#64748B', textAlign: 'center', fontSize: 13, fontWeight: '600' }
});