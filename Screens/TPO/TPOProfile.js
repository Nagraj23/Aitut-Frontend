import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const TPOProfileScreen = ({ navigation }) => {
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
        if (details) setUser(JSON.parse(details));
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View style={styles.headerCard}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'T'}</Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'Prof. M. K. Naral'}</Text>
                <Text style={styles.userRole}>ADMIN • PLACEMENT OFFICER</Text>

                <View style={styles.badge}>
                    <Text style={styles.badgeText}>✅ Verified Administrator</Text>
                </View>
            </View>

            {/* Admin Grid Section */}
            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    {/* Combined Info Card */}
                    <SquareCard
                        label="Personal Info"
                        subLabel="Admin & Contact Details"
                        icon="👤"
                        color="#6C5CE7"
                        onPress={() => navigation.navigate('EditBasicInfo')}
                    />
                    {/* New Register Student Card */}
                    <SquareCard
                        label="Register Student"
                        subLabel="Add new records to DB"
                        icon="📝"
                        color="#00B894"
                        onPress={() => navigation.navigate('RegisterStudent')}
                    />
                </View>

                <View style={styles.row}>
                    <SquareCard
                        label="Branch Reports"
                        subLabel="Export placement data"
                        icon="📊"
                        color="#FDCB6E"
                        onPress={() => navigation.navigate('Reports')}
                    />
                    <SquareCard
                        label="Settings"
                        subLabel="App & Notification Pref"
                        icon="⚙️"
                        color="#A0A0A0"
                        onPress={() => navigation.navigate('Settings')}
                    />
                </View>
            </View>

            {/* Additional Management Actions */}
            <View style={styles.actionSection}>
                <TouchableOpacity style={styles.actionItem}>
                    <Icon name="help-outline" size={22} color="#666" />
                    <Text style={styles.actionText}>Help & Support</Text>
                    <Icon name="chevron-right" size={22} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                    <Text style={styles.logoutText}>Sign Out from Portal</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const SquareCard = ({ label, subLabel, icon, onPress, color }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
            <Text style={styles.cardIcon}>{icon}</Text>
        </View>
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
        borderBottomRightRadius: 40,
        elevation: 10
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    avatarText: { fontSize: 42, fontWeight: 'bold', color: '#9788FB' },
    userName: { color: '#FFF', fontSize: 24, fontWeight: '800' },
    userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 12, letterSpacing: 1.5, marginTop: 6, fontWeight: '600' },
    badge: {
        marginTop: 15,
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20
    },
    badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    gridContainer: { padding: 18, marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    card: {
        backgroundColor: '#FFF',
        width: (width / 2) - 27,
        height: (width / 2) - 20,
        borderRadius: 30,
        padding: 20,
        elevation: 4,
        shadowColor: '#9788FB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    iconCircle: {
        width: 45,
        height: 45,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    },
    cardIcon: { fontSize: 24 },
    cardLabel: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    cardSubLabel: { fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 14 },

    actionSection: {
        paddingHorizontal: 20,
        paddingBottom: 40
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20
    },
    actionText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 16,
        color: '#444',
        fontWeight: '500'
    },
    logoutBtn: {
        padding: 18,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#FEE2E2'
    },
    logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});

export default TPOProfileScreen;