import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const RoadmapDetailScreen = ({ navigation }) => {
    const { roadmap, isDataLoading } = useContext(UserContext);

    // Dynamic Style Helper
    const getTypeStyles = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('test')) return { color: '#EF4444', bg: '#FEE2E2', icon: 'document-text' };
        if (lowerType.includes('problem')) return { color: '#F59E0B', bg: '#FEF3C7', icon: 'calculator' };
        if (lowerType.includes('revision') || lowerType.includes('free')) return { color: '#8B5CF6', bg: '#EDE9FE', icon: 'refresh' };
        return { color: '#22C55E', bg: '#DCFCE7', icon: 'book' }; // Default Learning
    };

    const renderStep = ({ item }) => {
        const typeStyle = getTypeStyles(item.type);

        return (
            <View style={[styles.card, item.is_completed && styles.cardCompleted]}>
                {/* TOP ROW */}
                <View style={styles.topRow}>
                    <View style={[styles.dayBadge, { backgroundColor: typeStyle.bg }]}>
                        <Text style={[styles.dayText, { color: typeStyle.color }]}>DAY {item.day}</Text>
                    </View>

                    <View style={styles.statusWrap}>
                        {item.is_completed ? (
                            <Ionicons name="checkmark-circle" size={26} color="#22C55E" />
                        ) : (
                            <Ionicons name={typeStyle.icon} size={22} color={typeStyle.color} />
                        )}
                    </View>
                </View>

                {/* TOPIC */}
                <Text style={styles.topic}>{item.topic}</Text>

                {/* TASK */}
                <Text style={styles.task} numberOfLines={2}>
                    {item.task}
                </Text>

                {/* FOOTER AREA */}
                <View style={styles.cardFooter}>
                    <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
                        <Text style={[styles.typeBadgeText, { color: typeStyle.color }]}>
                            {item.type}
                        </Text>
                    </View>

                    {!item.is_completed ? (
                        <TouchableOpacity
                            style={[styles.learnBtn, { backgroundColor: typeStyle.color }]}
                            onPress={() => navigation.navigate('Teach', { step: item })}
                        >
                            <Text style={styles.learnText}>
                                {item.type.includes('Test') ? 'Start Test' : 'Start Now'}
                            </Text>
                            <Ionicons name="arrow-forward" size={14} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.doneText}>Completed</Text>
                    )}
                </View>
            </View>
        );
    };

    if (isDataLoading || !roadmap) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loaderMsg}>Preparing your physics roadmap...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* ENHANCED HEADER */}
            <View style={styles.header}>
                <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
                <Text style={styles.phaseTitle}>{roadmap?.title}</Text>

                <View style={styles.subjectRow}>
                    <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>📘 {roadmap?.subject?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.statsText}>{roadmap?.daily_plan?.length} Days Plan</Text>
                </View>

                {/* PROGRESS */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressPercent}>{roadmap?.progress || 0}% Done</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${roadmap?.progress || 0}%` }]} />
                    </View>
                </View>
            </View>

            <FlatList
                data={roadmap?.daily_plan || []}
                keyExtractor={(item) => item.day.toString()}
                renderItem={renderStep}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderMsg: { marginTop: 12, fontSize: 16, color: '#64748B' },

    /* HEADER */
    header: {
        marginTop:10,
        backgroundColor: '#fff',
        padding: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    phaseLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
    phaseTitle: { fontSize: 24, fontWeight: '900', color: '#1E293B', marginTop: 4 },
    subjectRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 12 },
    subjectBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    subjectText: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
    statsText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

    progressContainer: { marginTop: 20 },
    progressInfo: { alignItems: 'flex-end', marginBottom: 6 },
    progressPercent: { fontSize: 14, fontWeight: '800', color: '#6366F1' },
    progressBar: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#6366F1' },

    /* LIST */
    listContent: { padding: 16, paddingBottom: 30 },

    /* CARDS */
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
    },
    cardCompleted: { backgroundColor: '#F8FAFC', opacity: 0.8 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    dayText: { fontSize: 13, fontWeight: '900' },

    topic: { fontSize: 19, fontWeight: '800', color: '#0F172A', marginTop: 12 },
    task: { fontSize: 15, color: '#64748B', marginTop: 6, lineHeight: 22 },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 18,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    learnBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 6
    },
    learnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    doneText: { color: '#22C55E', fontSize: 14, fontWeight: '800' }
});

export default RoadmapDetailScreen;