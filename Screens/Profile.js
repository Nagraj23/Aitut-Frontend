import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const { signOut } = useContext(AuthContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadUserData();
        });
        return unsubscribe;
    }, [navigation]);

    const loadUserData = async () => {
        const details = await AsyncStorage.getItem('userDetails');
        console.log(details,"profile");
        if (details) setUser(JSON.parse(details));
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerCard}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                <Text style={styles.userRole}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>

                {/* Visual indicator of profile completion */}
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {user?.isComplete ? "✅ Profile Verified" : "⚠️ Incomplete Profile"}
                    </Text>
                </View>
            </View>

            {/* Grid Section - Square Cards */}
            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <SquareCard
                        label="Basic Info"
                        subLabel="Personal details & Contact"
                        icon="👤"
                        onPress={() => navigation.navigate('EditBasicInfo')}
                    />
                    <SquareCard
                        label="Academic Info"
                        subLabel="College, Degree & Year"
                        icon="🎓"
                        onPress={() => navigation.navigate('EditLearningInfo')}
                    />
                </View>
                <View style={styles.row}>
                    <SquareCard
                        label="Learning Pref"
                        subLabel="Goals & Study Hours"
                        icon="⚙️"
                        onPress={() => navigation.navigate('LearningSettings')}
                    />
                    <SquareCard
                        label="My Roadmap"
                        subLabel="View active paths"
                        icon="🗺️"
                        onPress={() => navigation.navigate('Roadmap')}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutText}>Logout Account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// Helper Component for the Square Grid
const SquareCard = ({ label, subLabel, icon, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardSubLabel}>{subLabel}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    headerCard: {
        backgroundColor: '#9788FB',
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40
    },
    avatarPlaceholder: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5
    },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#9788FB' },
    userName: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 13, letterSpacing: 1.2, marginTop: 4 },
    badge: {
        marginTop: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    // Grid Styles
    gridContainer: { padding: 15, marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    card: {
        backgroundColor: '#FFF',
        width: (width / 2) - 22, // Dynamic width for squares
        height: (width / 2) - 22,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'flex-start',
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    cardIcon: { fontSize: 28, marginBottom: 12 },
    cardLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    cardSubLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4 },

    logoutBtn: { marginHorizontal: 20, marginBottom: 40, padding: 18, alignItems: 'center', borderRadius: 15 },
    logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;