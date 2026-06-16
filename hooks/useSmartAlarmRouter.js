import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { registerAiTutorAlarmCategories } from '../Screens/LocalScheduler'; // Adjust path to LocalScheduler if needed

export function useSmartAlarmRouter() {
    const navigation = useNavigation();

    useEffect(() => {
        // 1. Register interactive actions [Start] / [Snooze] on boot
        registerAiTutorAlarmCategories().catch(err =>
            console.error("⚠️ Actions failed to register:", err)
        );

        // SCENARIO A: App was KILLED or COMPLETELY CLOSED
        // If user hits '[Start]' from a cold phone state, this intercepts the boot intent
        Notifications.getLastNotificationResponseAsync().then((response) => {
            if (response) {
                handleNotificationRouting(response);
            }
        });

        // SCENARIO B: App is in the BACKGROUND or active FOREGROUND
        // Listens to real-time interactive user clicks on the notification shade
        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            handleNotificationRouting(response);
        });

        const handleNotificationRouting = (response) => {
            const actionIdentifier = response.actionIdentifier;
            const dataPayload = response.notification.request.content.data;

            // Check if our custom payload block exists cleanly
            if (dataPayload && dataPayload.screen) {

                // If user clicks the custom 'Start' action button OR taps the notification banner body directly
                if (
                    actionIdentifier === 'start-session' ||
                    actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
                ) {
                    console.log(`🚀 Smart Alarm Action Caught! Deep-linking to screen: ${dataPayload.screen}`);

                    // Force React Navigation to transition directly into your target Teach screen
                    navigation.navigate(dataPayload.screen, {
                        subjectName: dataPayload.subjectName,
                        topicName: dataPayload.topicName, // Carries your topic e.g., "React Navigation"
                        dayNumber: Number(dataPayload.dayNumber),
                        autoBegin: true // Custom operational flag to start lesson instantly
                    });

                } else if (actionIdentifier === 'snooze-session') {
                    console.log(`⏰ Snooze selected for subject: ${dataPayload.subjectName}`);
                    handleSnoozeReschedule(dataPayload);
                }
            }
        };

        const handleSnoozeReschedule = async (payload) => {
            try {
                // Instantly re-schedule the exact same payload data block to ring 10 minutes from now
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: '🔊 Alarm rings (Snoozed)',
                        body: `${payload.task} Now!`,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                        categoryIdentifier: 'study-reminder',
                        data: payload // Preserves the exact dataset blueprint intact
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        seconds: 600, // 10 minutes delay
                    },
                });
                console.log(`📡 Snooze successfully registered.`);
            } catch (err) {
                console.error("❌ Failed to register snooze loop:", err);
            }
        };

        return () => subscription.remove();
    }, [navigation]);
}