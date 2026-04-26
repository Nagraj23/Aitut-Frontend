import React, { useContext, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Dimensions
} from 'react-native';
import { UserContext } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const RoadmapDetailScreen = ({ navigation }) => {
    const { roadmap, isDataLoading } = useContext(UserContext);

    useEffect(() => {
        if (roadmap) {
            console.log("📍 [RoadmapDetail]: Navigating with subject:", roadmap.subject);
        }
    }, [roadmap]);

    const getTypeStyles = (type) => {
        const lowerType = type?.toLowerCase() || '';
        if (lowerType.includes('test')) return { color: '#EF4444', bg: '#FEE2E2', icon: 'flask-outline' };
        if (lowerType.includes('problem')) return { color: '#F59E0B', bg: '#FEF3C7', icon: 'code-slash' };
        if (lowerType.includes('revision')) return { color: '#8B5CF6', bg: '#EDE9FE', icon: 'sync-circle-outline' };
        return { color: '#6366F1', bg: '#EEF2FF', icon: 'play-circle-outline' }; // Standard Learning
    };

    const renderStep = ({ item }) => {
        const typeStyle = getTypeStyles(item.type);
        const isNextTask = !item.is_completed;

        return (
            <View style={[
                styles.card,
                item.is_completed && styles.cardCompleted,
                { borderLeftColor: typeStyle.color }
            ]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.dayBadge, { backgroundColor: typeStyle.bg }]}>
                        <Text style={[styles.dayText, { color: typeStyle.color }]}>DAY {item.day}</Text>
                    </View>

                    {item.is_completed ? (
                        <Ionicons name="checkmark-done-circle" size={24} color="#22C55E" />
                    ) : (
                        <View style={styles.activeDot} />
                    )}
                </View>

                <Text style={styles.topic}>{item.topic}</Text>
                <Text style={styles.task}>{item.task}</Text>

                <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                        <Ionicons name={typeStyle.icon} size={16} color={typeStyle.color} style={{marginRight: 4}} />
                        <Text style={[styles.typeText, { color: typeStyle.color }]}>{item.type}</Text>
                    </View>

                    {!item.is_completed ? (
                        <TouchableOpacity
                            style={[styles.learnBtn, { backgroundColor: typeStyle.color }]}
                            onPress={() => navigation.navigate('Teach', {
                                step: item,
                                subject: roadmap?.subject // ✅ Passing subject here
                            })}
                        >
                            <Text style={styles.learnText}>
                                {item.type.includes('Test') ? 'Start Test' : 'Continue'}
                            </Text>
                            <Ionicons name="chevron-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.completedBadge}>
                            <Text style={styles.completedText}>DONE</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (isDataLoading || !roadmap) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loaderMsg}>Building your personalized path...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.phaseLabel}>ROADMAP PROGRESS</Text>
                    <View style={{width: 24}} />
                </View>

                <Text style={styles.phaseTitle}>{roadmap?.title}</Text>

                <View style={styles.subjectRow}>
                    <View style={styles.subjectBadge}>
                        <Text style={styles.subjectText}>⚡ {roadmap?.subject?.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.statsText}>{roadmap?.daily_plan?.length} Milestones</Text>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressFill, { width: `${roadmap?.progress || 0}%` }]} />
                    </View>
                    <Text style={styles.progressPercent}>{roadmap?.progress || 0}% Complete</Text>
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
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderMsg: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#6366F1' },

    /* HEADER */
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 25,
        paddingTop: 10,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    phaseLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5 },
    phaseTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },

    subjectRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    subjectBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 10 },
    subjectText: { fontSize: 12, fontWeight: '800', color: '#6366F1' },
    statsText: { fontSize: 13, color: '#64748B', fontWeight: '600' },

    progressSection: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    progressBarBg: { flex: 1, height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, marginRight: 15, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 4 },
    progressPercent: { fontSize: 13, fontWeight: '800', color: '#6366F1', width: 90, textAlign: 'right' },

    /* LIST */
    listContent: { padding: 20, paddingBottom: 40 },

    /* CARDS */
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 6, // Colored accent
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardCompleted: { opacity: 0.6, backgroundColor: '#F8FAFC' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    dayText: { fontSize: 12, fontWeight: '900' },
    activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' },

    topic: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 12 },
    task: { fontSize: 14, color: '#64748B', marginTop: 8, lineHeight: 20, fontWeight: '500' },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    footerInfo: { flexDirection: 'row', alignItems: 'center' },
    typeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },

    learnBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 6,
        elevation: 2
    },
    learnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
    completedBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#DCFCE7' },
    completedText: { color: '#16A34A', fontSize: 11, fontWeight: '900' }
});

export default RoadmapDetailScreen;