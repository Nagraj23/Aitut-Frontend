import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const RoadmapDetailScreen = ({ navigation }) => {
    const { roadmap, isDataLoading } = useContext(UserContext);

    const handleStartLearning = (item) => {
        navigation.navigate('LearningScreen', {
            day: item.day,
            topic: item.topic,
            task: item.task,
            type: item.type
        });
    };

    const renderDayCard = ({ item }) => (
        <View style={styles.card}>

            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.day}>DAY {item.day}</Text>

                {item.is_completed ? (
                    <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                ) : (
                    <Ionicons name="ellipse-outline" size={18} color="#94A3B8" />
                )}
            </View>

            {/* Content */}
            <Text style={styles.topic}>{item.topic}</Text>
            <Text style={styles.task} numberOfLines={2}>
                {item.task}
            </Text>

            {/* Type */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.type}</Text>
            </View>

            {/* Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    item.is_completed && styles.buttonDone
                ]}
                onPress={() => handleStartLearning(item)}
            >
                <Text style={styles.buttonText}>
                    {item.is_completed ? "Review Again" : "Start Learning"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (isDataLoading || !roadmap) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ marginTop: 10, color: '#64748B' }}>
                    Loading roadmap...
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* HEADER */}
            <View style={styles.topHeader}>
                <Text style={styles.title}>{roadmap?.title}</Text>
                <Text style={styles.subtitle}>{roadmap?.overview}</Text>
            </View>

            {/* LIST */}
            <FlatList
                data={roadmap?.daily_plan || []}
                keyExtractor={(item) => item.day.toString()}
                renderItem={renderDayCard}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB'
    },

    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    topHeader: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        elevation: 3
    },

    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A'
    },

    subtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    day: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6366F1',
        letterSpacing: 1
    },

    topic: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 6
    },

    task: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
        lineHeight: 18
    },

    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 10
    },

    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4F46E5'
    },

    button: {
        marginTop: 12,
        backgroundColor: '#6366F1',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center'
    },

    buttonDone: {
        backgroundColor: '#22C55E'
    },

    buttonText: {
        color: '#fff',
        fontWeight: '700'
    }
});
export default RoadmapDetailScreen;
