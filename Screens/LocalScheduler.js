import notifee, { TriggerType, AndroidImportance, AndroidCategory, AndroidVisibility } from '@notifee/react-native';

export const scheduleHardwareStudyAlarm = async (subjectName, targetDay, topicTitle, triggerTime) => {
    // 1. Prompt explicit system level notification approvals (Mandatory Android 13+)
    await notifee.requestPermission();

    // 2. Map the high importance channel to our native sound track asset
    const channelId = await notifee.createChannel({
        id: 'aitut_study_alarms',
        name: 'AItut Critical Study Prompts',
        importance: AndroidImportance.HIGH,
        sound: 'wakeup_alarm', // Maps natively to android/app/src/main/res/raw/wakeup_alarm.mp3 [cite: 324]
        bypassDnd: true,       // Pierces through active system "Do Not Disturb" states [cite: 347]
    });

    // 3. Configure the Point-In-Time hardware trigger hook
    const trigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTime.getTime(), // Converts JavaScript date object to epoch milliseconds
        alarmManager: {
            allowWhileIdle: true, // Forces execution even when Android drops into a deep Doze power state [cite: 320]
        },
    };

    // 4. Register the alert directly into the Android System Kernel [cite: 345, 346]
    await notifee.createTriggerNotification(
        {
            // Create an un-hashed unique ID string using subject and day properties
            id: `alarm_${subjectName.replace(/\s+/g, '_')}_day_${targetDay}`,
            title: '🚨 AItut Core Session Awake!',
            body: `Day ${targetDay}: ${subjectName} -> Reviewing ${topicTitle}`,
            android: {
                channelId,
                category: AndroidCategory.ALARM, // Escalates CPU scheduling priority above social apps [cite: 345, 346]
                importance: AndroidImportance.HIGH,
                visibility: AndroidVisibility.PUBLIC, // Reveals contents over the physical lock screen
                sound: 'wakeup_alarm',
                ongoing: true,   // Forces the notification card to stay sticky on the view panel
                autoCancel: false,
                pressAction: {
                    id: 'open_quiz_screen',
                    launchActivity: 'default', // Instantly boots the React Native frontend app context [cite: 315]
                },
                // Secure context parameters to allow automatic deep-link routing on launch [cite: 315]
                data: {
                    subject: subjectName,
                    day: targetDay.toString(),
                    topic: topicTitle
                }
            },
        },
        trigger
    );
};