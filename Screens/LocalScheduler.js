import * as Notifications from 'expo-notifications';
import axios from 'axios';
import {REMINDER_URL} from "../Constants/Api";
import {Platform} from "react-native";

// Configure how the OS displays alerts when the app is active in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Register [Start] & [Snooze] buttons directly into the Android System Shade
export async function registerAiTutorAlarmCategories() {
    await Notifications.setNotificationCategoryAsync('study-reminder', [
        {
            identifier: 'start-session',
            buttonTitle: 'Start',
            options: { opensAppToForeground: true },
        },
        {
            identifier: 'snooze-session',
            buttonTitle: 'Snooze',
            options: { opensAppToForeground: false },
        },
    ]);
}

/**
 * Dual Sync Engine: Registers hardware chip timer and posts context payload to FastAPI
 */
export async function scheduleHardwareStudyAlarm(subject, dayNumber, topic, targetTimestamp, userToken) {
    // 1. Confirm notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Permission for notifications was denied!');
    }

    // 2. Initialize interactive action button frames
    await registerAiTutorAlarmCategories();

    // 3. Clear old alarm queues to optimize local device memory
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 4. Calculate local millisecond delay for hardware trigger execution
    const triggerTime = new Date(targetTimestamp).getTime();
    const currentTime = Date.now();
    const secondsToTrigger = Math.max(1, Math.floor((triggerTime - currentTime) / 1000));

    const generatedAlarmId = Math.floor(Math.random() * 100000);

    let channelId = "default";
    if (Platform.OS === 'android') {
        channelId = "study-alarms";

        await Notifications.setNotificationChannelAsync(channelId, {
            name: 'Study Alarms',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'alarm_tone.mp3',
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F71',
        });

        console.log("🔊 Notification channel created with sound: alarm_tone.mp3");
    }

    // ==========================================
    // ACTION A: LOCAL HARDWARE REGISTRY (FAIL-SAFE)
    // ==========================================
    const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
            title: '🔊 Alarm rings',
            body: `Study ${subject} Now!`,
            sound: 'alarm_tone.mp3',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'study-reminder',
            data: {
                alarmId: generatedAlarmId,
                task: `Study ${subject}`,
                screen: 'Teach',
                subjectName: subject,
                topicName: topic,
                dayNumber: Number(dayNumber),
            },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsToTrigger,
        },
    });

    console.log(`📡 Local Chip Engine armed for ${secondsToTrigger}s. ID: ${notificationId}`);

    // ==========================================
    // ACTION B: FASTAPI CLOUD SYNC (ALIGNED WITH BACKEND)
    // ==========================================
    if (userToken) {
        try {
            // Your FastAPI application route details mapped from your architecture review
            const FASTAPI_REMINDER_URL = `${REMINDER_URL}/alarms/`;

            const cloudPayload = {
                title: `Study ${subject} - Day ${dayNumber}: ${topic}`,
                trigger_time: new Date(targetTimestamp).toISOString() // Standard ISO format for PostgreSQL
            };

            const response = await axios.post(FASTAPI_REMINDER_URL, cloudPayload, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`☁️ Cloud Sync Active! PostgreSQL entry written successfully. Backend ID: ${response.data.id}`);
        } catch (cloudError) {
            // Log the error but don't crash the app — local hardware alarm is already running as fail-safe!
            console.warn("⚠️ FastAPI Cloud Sync skipped/offline:", cloudError.message);
        }
    }
}