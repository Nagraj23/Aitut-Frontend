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
        if (lowerType.includes('test')) return { color: '#EF4444', bg: '#FEE2E2', icon: 'flask-outline', label: 'Test' };
        if (lowerType.includes('problem')) return { color: '#F59E0B', bg: '#FEF3C7', icon: 'code-slash', label: 'Problem' };
        if (lowerType.includes('revision')) return { color: '#8B5CF6', bg: '#EDE9FE', icon: 'sync-circle-outline', label: 'Revision' };
        return { color: '#6366F1', bg: '#EEF2FF', icon: 'play-circle-outline', label: 'Learn' };
    };

    const completedCount = roadmap?.daily_plan?.filter(s => s.is_completed).length || 0;
    const totalCount = roadmap?.daily_plan?.length || 0;

    const renderStep = ({ item, index }) => {
        const typeStyle = getTypeStyles(item.type);

        return (
            <View style={styles.stepRow}>
                {/* Timeline spine */}
                <View style={styles.timelineCol}>
                    <View style={[
                        styles.timelineDot,
                        item.is_completed
                            ? styles.timelineDotDone
                            : { backgroundColor: typeStyle.color, shadowColor: typeStyle.color }
                    ]}>
                        {item.is_completed
                            ? <Ionicons name="checkmark" size={12} color="#fff" />
                            : <Text style={styles.timelineDotText}>{item.day}</Text>
                        }
                    </View>
                    {index < totalCount - 1 && (
                        <View style={[
                            styles.timelineLine,
                            item.is_completed && styles.timelineLineDone
                        ]} />
                    )}
                </View>

                {/* Card */}
                <View style={[
                    styles.card,
                    item.is_completed && styles.cardCompleted,
                ]}>
                    {/* Top row */}
                    <View style={styles.cardTopRow}>
                        <View style={[styles.typePill, { backgroundColor: typeStyle.bg }]}>
                            <Ionicons name={typeStyle.icon} size={12} color={typeStyle.color} />
                            <Text style={[styles.typePillText, { color: typeStyle.color }]}>
                                {item.type?.toUpperCase()}
                            </Text>
                        </View>
                        {item.is_completed && (
                            <View style={styles.doneBadge}>
                                <Text style={styles.doneText}>✓ DONE</Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <Text style={[styles.topic, item.is_completed && styles.topicDone]}>
                        {item.topic}
                    </Text>
                    <Text style={styles.task}>{item.task}</Text>

                    {/* Footer */}
                    {!item.is_completed && (
                        <TouchableOpacity
                            style={[styles.learnBtn, { backgroundColor: typeStyle.color }]}
                            onPress={() => navigation.navigate('Teach', {
                                step: item,
                                subject: roadmap?.subject
                            })}
                        >
                            <Text style={styles.learnText}>
                                {item.type?.includes('Test') ? 'Start Test' : 'Continue'}
                            </Text>
                            <Ionicons name="chevron-forward" size={15} color="#fff" />
                        </TouchableOpacity>
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
            <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

            <FlatList
                data={roadmap?.daily_plan || []}
                keyExtractor={(item) => item.day.toString()}
                renderItem={renderStep}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View>
                        {/* Hero Header */}
                        <View style={styles.heroHeader}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="arrow-back" size={20} color="#fff" />
                            </TouchableOpacity>

                            <View style={styles.heroMeta}>
                                <Text style={styles.heroEyebrow}>LEARNING ROADMAP</Text>
                                <Text style={styles.heroTitle}>{roadmap?.title}</Text>
                            </View>

                            <View style={styles.subjectChip}>
                                <Text style={styles.subjectChipText}>⚡ {roadmap?.subject?.toUpperCase()}</Text>
                            </View>

                            {/* Stats row */}
                            <View style={styles.statsRow}>
                                <View style={styles.statBox}>
                                    <Text style={styles.statNum}>{completedCount}</Text>
                                    <Text style={styles.statLabel}>Done</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statNum}>{totalCount - completedCount}</Text>
                                    <Text style={styles.statLabel}>Remaining</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statBox}>
                                    <Text style={styles.statNum}>{totalCount}</Text>
                                    <Text style={styles.statLabel}>Total Days</Text>
                                </View>
                            </View>

                            {/* Progress bar */}
                            <View style={styles.progressWrap}>
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressFill, { width: `${roadmap?.progress || 0}%` }]} />
                                </View>
                                <Text style={styles.progressLabel}>{roadmap?.progress || 0}%</Text>
                            </View>
                        </View>

                        {/* Section title */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Daily Plan</Text>
                            <View style={styles.sectionPill}>
                                <Text style={styles.sectionPillText}>{totalCount} milestones</Text>
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2FF' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loaderMsg: { marginTop: 14, fontSize: 15, fontWeight: '600', color: '#6366F1' },

    /* HERO HEADER */
    heroHeader: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 22,
        paddingTop: 16,
        paddingBottom: 32,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    heroMeta: { marginBottom: 14 },
    heroEyebrow: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        lineHeight: 30,
    },
    subjectChip: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 22,
    },
    subjectChipText: { fontSize: 12, fontWeight: '800', color: '#fff' },

    statsRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: { alignItems: 'center', flex: 1 },
    statNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
    statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600', marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

    progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    progressTrack: {
        flex: 1,
        height: 7,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: '#A5F3FC', borderRadius: 4 },
    progressLabel: { fontSize: 13, fontWeight: '800', color: '#A5F3FC', width: 38, textAlign: 'right' },

    /* SECTION HEADER */
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 14,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    sectionPill: {
        backgroundColor: '#E0E7FF',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    sectionPillText: { fontSize: 12, fontWeight: '700', color: '#4338CA' },

    /* TIMELINE + CARD */
    listContent: { paddingBottom: 48 },
    stepRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 4,
    },

    timelineCol: {
        width: 36,
        alignItems: 'center',
        paddingTop: 4,
    },
    timelineDot: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 4,
        zIndex: 1,
    },
    timelineDotDone: {
        backgroundColor: '#22C55E',
        shadowColor: '#22C55E',
    },
    timelineDotText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    timelineLine: {
        width: 2,
        flex: 1,
        minHeight: 24,
        backgroundColor: '#CBD5E1',
        marginTop: 3,
        marginBottom: 3,
    },
    timelineLineDone: { backgroundColor: '#22C55E' },

    card: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 18,
        marginLeft: 12,
        marginBottom: 14,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
    },
    cardCompleted: {
        backgroundColor: '#F8FAFC',
        opacity: 0.75,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    typePillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    doneBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    doneText: { color: '#16A34A', fontSize: 10, fontWeight: '900' },

    topic: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
    topicDone: { color: '#94A3B8' },
    task: { fontSize: 13, color: '#64748B', lineHeight: 19, fontWeight: '500' },

    learnBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 6,
        elevation: 2,
    },
    learnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});

export default RoadmapDetailScreen;