import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput,
    TouchableOpacity, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BRANCH_PRESETS = [
    { name: 'Computer Science', short: 'CSE', emoji: '💻' },
    { name: 'Information Technology', short: 'IT', emoji: '📱' },
    { name: 'Electronics & Telecom', short: 'ENTC', emoji: '📡' },
    { name: 'Mechanical', short: 'MECH', emoji: '⚙️' },
    { name: 'Civil', short: 'CIVIL', emoji: '🏗️' },
    { name: 'Electrical', short: 'EEE', emoji: '⚡' },
];

const COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#D63031'];

export default function AddBranch({ navigation }) {
    const [selected, setSelected] = useState(null);
    const [customName, setCustomName] = useState('');
    const [customShort, setCustomShort] = useState('');
    const [customEmoji, setCustomEmoji] = useState('📚');
    const [totalStudents, setTotalStudents] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const branchName = isCustom ? customName.trim() : selected?.name;
        const branchShort = isCustom ? customShort.trim().toUpperCase() : selected?.short;
        const emoji = isCustom ? customEmoji : selected?.emoji;

        if (!branchName || !branchShort) {
            Alert.alert('Missing Info', 'Please select or enter a branch name and short code.');
            return;
        }
        if (!totalStudents || isNaN(parseInt(totalStudents))) {
            Alert.alert('Missing Info', 'Please enter the total number of students.');
            return;
        }

        setSaving(true);
        try {
            const existing = await AsyncStorage.getItem('tpo_branches');
            const branches = existing ? JSON.parse(existing) : [];

            // Check duplicate
            if (branches.find(b => b.short === branchShort)) {
                Alert.alert('Duplicate', `${branchShort} branch already exists.`);
                return;
            }

            const colorIndex = branches.length % COLORS.length;
            const newBranch = {
                id: Date.now().toString(),
                name: branchName,
                short: branchShort,
                emoji,
                color: COLORS[colorIndex],
                total: parseInt(totalStudents),
                students: [],
                createdAt: new Date().toISOString(),
            };

            branches.push(newBranch);
            await AsyncStorage.setItem('tpo_branches', JSON.stringify(branches));

            Alert.alert('✅ Branch Added!', `${branchShort} has been added to your dashboard.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Could not save branch. Try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Add Branch</Text>
                    <Text style={styles.headerSub}>Select or create a department</Text>
                </View>
            </View>

            <View style={styles.content}>

                {/* Preset Branches */}
                <Text style={styles.sectionLabel}>QUICK SELECT</Text>
                <View style={styles.presetsGrid}>
                    {BRANCH_PRESETS.map((b) => (
                        <TouchableOpacity
                            key={b.short}
                            style={[
                                styles.presetCard,
                                selected?.short === b.short && !isCustom && styles.presetCardActive
                            ]}
                            onPress={() => { setSelected(b); setIsCustom(false); }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.presetEmoji}>{b.emoji}</Text>
                            <Text style={styles.presetShort}>{b.short}</Text>
                            <Text style={styles.presetName} numberOfLines={1}>{b.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Custom Option */}
                <TouchableOpacity
                    style={[styles.customToggle, isCustom && styles.customToggleActive]}
                    onPress={() => { setIsCustom(!isCustom); setSelected(null); }}
                >
                    <Text style={[styles.customToggleText, isCustom && { color: '#FFF' }]}>
                        {isCustom ? '✓ Custom Branch' : '+ Add Custom Branch'}
                    </Text>
                </TouchableOpacity>

                {isCustom && (
                    <View style={styles.customSection}>
                        <Text style={styles.fieldLabel}>Branch Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Artificial Intelligence"
                            value={customName}
                            onChangeText={setCustomName}
                            placeholderTextColor="#CBD5E1"
                        />
                        <Text style={styles.fieldLabel}>Short Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. AI"
                            value={customShort}
                            onChangeText={setCustomShort}
                            autoCapitalize="characters"
                            maxLength={6}
                            placeholderTextColor="#CBD5E1"
                        />
                        <Text style={styles.fieldLabel}>Emoji Icon</Text>
                        <TextInput
                            style={styles.input}
                            value={customEmoji}
                            onChangeText={setCustomEmoji}
                            maxLength={2}
                            placeholderTextColor="#CBD5E1"
                        />
                    </View>
                )}

                {/* Total Students */}
                <Text style={styles.sectionLabel}>STUDENT COUNT</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Total students in this branch"
                    value={totalStudents}
                    onChangeText={setTotalStudents}
                    keyboardType="numeric"
                    placeholderTextColor="#CBD5E1"
                />

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.saveBtnText}>Add Branch →</Text>
                    }
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        backgroundColor: '#6C5CE7', paddingTop: 55, paddingBottom: 28,
        paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16,
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    backIcon: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

    content: { padding: 20 },
    sectionLabel: {
        fontSize: 11, fontWeight: '800', color: '#94A3B8',
        letterSpacing: 1.2, marginBottom: 12, marginTop: 8,
    },

    presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    presetCard: {
        width: '30%', backgroundColor: '#FFF', borderRadius: 16,
        padding: 12, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0',
        elevation: 1,
    },
    presetCardActive: { borderColor: '#6C5CE7', backgroundColor: '#EEF2FF' },
    presetEmoji: { fontSize: 24, marginBottom: 6 },
    presetShort: { fontSize: 13, fontWeight: '800', color: '#1A1A1A' },
    presetName: { fontSize: 9, color: '#94A3B8', textAlign: 'center', marginTop: 2 },

    customToggle: {
        borderWidth: 1.5, borderColor: '#6C5CE7', borderRadius: 14,
        paddingVertical: 12, alignItems: 'center', marginBottom: 16,
    },
    customToggleActive: { backgroundColor: '#6C5CE7' },
    customToggleText: { color: '#6C5CE7', fontWeight: '700', fontSize: 14 },

    customSection: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },

    fieldLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 8, marginTop: 12 },
    input: {
        backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16,
        paddingVertical: 14, fontSize: 15, color: '#1A1A1A',
        borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 4, elevation: 1,
    },

    saveBtn: {
        backgroundColor: '#6C5CE7', padding: 18, borderRadius: 18,
        alignItems: 'center', marginTop: 20,
        elevation: 5, shadowColor: '#6C5CE7', shadowOpacity: 0.35, shadowRadius: 12,
    },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});