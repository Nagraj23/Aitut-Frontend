import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

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
        if (details) setUser(JSON.parse(details));
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerCard}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                <Text style={styles.userRole}>{user?.role || 'Student'}</Text>

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <InfoRow label="Email" value={user?.email || 'Not set'} icon="📧" />
                <InfoRow label="Phone" value={user?.phone || 'Not set'} icon="📱" />
                <InfoRow label="College" value={user?.college || 'BMIT Solapur'} icon="🏫" />
                <InfoRow label="Branch" value={user?.branch || 'CSE'} icon="💻" />
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const InfoRow = ({ label, value, icon }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    headerCard: { backgroundColor: '#9788FB', padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#9788FB' },
    userName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    userRole: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 5 },
    editBtn: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
    editBtnText: { color: '#FFF', fontWeight: 'bold' },
    infoSection: { padding: 20, marginTop: 10 },
    infoRow: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 2 },
    infoIcon: { fontSize: 20, marginRight: 15 },
    infoLabel: { fontSize: 12, color: '#64748B' },
    infoValue: { fontSize: 16, color: '#1E293B', fontWeight: '600' },
    logoutBtn: { margin: 20, padding: 15, alignItems: 'center' },
    logoutText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});

export default ProfileScreen;