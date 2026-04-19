import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Dimensions
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RoadmapDetailScreen = () => {
    const { roadmap, isDataLoading } = useContext(UserContext);

    const renderStep = ({ item, index }) => (
        <View style={styles.stepRow}>

            {/* Timeline */}
            <View style={styles.timeline}>
                <View style={[styles.dot, item.is_completed && styles.dotDone]} />
                {index !== (roadmap?.daily_plan?.length - 1) && (
                    <View style={styles.line} />
                )}
            </View>

            {/* Card */}
            <TouchableOpacity activeOpacity={0.85} style={[
                styles.card,
                item.is_completed && styles.cardDone
            ]}>

                {/* Top row */}
                <View style={styles.cardTop}>
                    <Text style={styles.day}>DAY {item.day}</Text>

                    {item.is_completed ? (
                        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                    ) : (
                        <Ionicons name="ellipse-outline" size={18} color="#94A3B8" />
                    )}
                </View>

                {/* Topic */}
                <Text style={styles.topic}>{item.topic}</Text>

                {/* Task */}
                <Text style={styles.task} numberOfLines={2}>
                    {item.task}
                </Text>

                {/* Badge */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                </View>
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
            <FlatList
                data={roadmap?.daily_plan || []}
                keyExtractor={(item) => item.day.toString()}
                renderItem={renderStep}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                ListHeaderComponent={() => (
                    <View style={styles.headerCard}>

                        <Text style={styles.title}>
                            {roadmap?.title}
                        </Text>

                        <Text style={styles.subtitle}>
                            {roadmap?.overview}
                        </Text>

                        {/* Progress */}
                        <View style={styles.progressWrap}>
                            <Text style={styles.progressText}>
                                Progress • {roadmap?.progress || 0}%
                            </Text>

                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${roadmap?.progress || 0}%` }
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                )}
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

    headerCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 10,
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
        marginTop: 8,
        lineHeight: 18
    },

    progressWrap: {
        marginTop: 15
    },

    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6
    },

    progressBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 20,
        overflow: 'hidden'
    },

    progressFill: {
        height: 8,
        backgroundColor: '#6366F1',
        borderRadius: 20
    },

    stepRow: {
        flexDirection: 'row',
        marginBottom: 18
    },

    timeline: {
        width: 30,
        alignItems: 'center'
    },

    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
        marginTop: 14
    },

    dotDone: {
        backgroundColor: '#22C55E'
    },

    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0',
        marginTop: 2
    },

    card: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginLeft: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },

    cardDone: {
        borderLeftWidth: 4,
        borderLeftColor: '#22C55E'
    },

    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    day: {
        fontSize: 11,
        fontWeight: '800',
        color: '#6366F1',
        letterSpacing: 1
    },

    topic: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 5
    },

    task: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 6,
        lineHeight: 18
    },

    badge: {
        alignSelf: 'flex-start',
        marginTop: 10,
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },

    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4F46E5'
    }
});

export default RoadmapDetailScreen;