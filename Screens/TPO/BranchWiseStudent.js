import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const BranchStudentList = ({ route, navigation }) => {
    const { branch } = route.params;

    // 📂 Complete Mock Database organized by Branch
    const allStudents = {
        "CSE": [
            { id: 'c1', name: "Riya Mehta", roll: "CSE01", mobile: "9876543210", progress: 85, tests: 12, missed: 0, status: 'Placed' },
            { id: 'c2', name: "Sneha Joshi", roll: "CSE12", mobile: "9988776655", progress: 92, tests: 15, missed: 0, status: 'Placed' },
            { id: 'c3', name: "Kiran More", roll: "CSE15", mobile: "7766554433", progress: 60, tests: 9, missed: 3, status: 'Active' },
            { id: 'c4', name: "Omkar Deshpande", roll: "CSE22", mobile: "9822334455", progress: 75, tests: 11, missed: 1, status: 'Active' },
            { id: 'c5', name: "Anjali Kulkarni", roll: "CSE05", mobile: "9011223344", progress: 40, tests: 6, missed: 6, status: 'Critical' },
            { id: 'c6', name: "Prathamesh S.", roll: "CSE30", mobile: "8888777766", progress: 55, tests: 8, missed: 4, status: 'Training' },
            { id: 'c7', name: "Tanvi Rao", roll: "CSE09", mobile: "7700112233", progress: 82, tests: 14, missed: 0, status: 'Placed' },
            { id: 'c8', name: "Siddhesh G.", roll: "CSE41", mobile: "9900990099", progress: 35, tests: 4, missed: 8, status: 'Critical' },
            { id: 'c9', name: "Isha Patil", roll: "CSE18", mobile: "8444556677", progress: 68, tests: 10, missed: 2, status: 'Active' },
            { id: 'c10', name: "Varun Bajaj", roll: "CSE25", mobile: "9122334455", progress: 50, tests: 7, missed: 5, status: 'Training' }
        ],
        "IT": [
            { id: 'i1', name: "Rahul Sharma", roll: "IT05", mobile: "9123456780", progress: 70, tests: 10, missed: 2, status: 'Active' },
            { id: 'i2', name: "Rohan Deshmukh", roll: "IT18", mobile: "8111223344", progress: 55, tests: 7, missed: 4, status: 'Training' },
            { id: 'i3', name: "Arya Sharma", roll: "IT25", mobile: "7000998877", progress: 88, tests: 14, missed: 1, status: 'Placed' },
            { id: 'i4', name: "Sameer Khan", roll: "IT02", mobile: "9222334455", progress: 72, tests: 11, missed: 1, status: 'Active' },
            { id: 'i5', name: "Nikita V.", roll: "IT12", mobile: "9333445566", progress: 95, tests: 16, missed: 0, status: 'Placed' },
            { id: 'i6', name: "Yash Mane", roll: "IT20", mobile: "9444556677", progress: 42, tests: 5, missed: 7, status: 'Critical' },
            { id: 'i7', name: "Pooja Hegde", roll: "IT09", mobile: "9555667788", progress: 61, tests: 9, missed: 3, status: 'Active' },
            { id: 'i8', name: "Sahil Z.", roll: "IT33", mobile: "9666778899", progress: 48, tests: 6, missed: 6, status: 'Training' },
            { id: 'i9', name: "Megha S.", roll: "IT22", mobile: "9777889900", progress: 80, tests: 13, missed: 1, status: 'Placed' },
            { id: 'i10', name: "Aditya P.", roll: "IT15", mobile: "9888990011", progress: 58, tests: 8, missed: 4, status: 'Active' }
        ],
        "ENTC": [
            { id: 'e1', name: "Priya Singh", roll: "EN03", mobile: "9555443322", progress: 78, tests: 11, missed: 1, status: 'Active' },
            { id: 'e2', name: "Pooja Kale", roll: "EN12", mobile: "9322110044", progress: 82, tests: 13, missed: 0, status: 'Placed' },
            { id: 'e3', name: "Siddharth N.", roll: "EN30", mobile: "9222334455", progress: 40, tests: 6, missed: 6, status: 'Critical' },
            { id: 'e4', name: "Abhishek B.", roll: "EN07", mobile: "9111882233", progress: 65, tests: 9, missed: 3, status: 'Active' },
            { id: 'e5', name: "Ritu More", roll: "EN21", mobile: "9000773344", progress: 89, tests: 14, missed: 0, status: 'Placed' },
            { id: 'e6', name: "Manish T.", roll: "EN15", mobile: "8999664455", progress: 52, tests: 7, missed: 5, status: 'Training' },
            { id: 'e7', name: "Shweta G.", roll: "EN09", mobile: "8888555566", progress: 74, tests: 10, missed: 2, status: 'Active' },
            { id: 'e8', name: "Gaurav K.", roll: "EN35", mobile: "8777446677", progress: 38, tests: 5, missed: 7, status: 'Critical' },
            { id: 'e9', name: "Divya L.", roll: "EN18", mobile: "8666337788", progress: 60, tests: 8, missed: 4, status: 'Active' },
            { id: 'e10', name: "Harsh S.", roll: "EN24", mobile: "8555228899", progress: 45, tests: 6, missed: 6, status: 'Training' }
        ],
        "MECH": [
            { id: 'm1', name: "Amit Patil", roll: "ME08", mobile: "8877665544", progress: 45, tests: 8, missed: 5, status: 'Training' },
            { id: 'm2', name: "Vikram Shinde", roll: "ME20", mobile: "9000112233", progress: 30, tests: 5, missed: 7, status: 'Critical' },
            { id: 'm3', name: "Suresh K.", roll: "ME15", mobile: "9122334455", progress: 65, tests: 9, missed: 3, status: 'Active' },
            { id: 'm4', name: "Vijay Mane", roll: "ME02", mobile: "9233445566", progress: 75, tests: 11, missed: 1, status: 'Active' },
            { id: 'm5', name: "Ajay Rathod", roll: "ME22", mobile: "9344556677", progress: 82, tests: 13, missed: 0, status: 'Placed' },
            { id: 'm6', name: "Kunal S.", roll: "ME11", mobile: "9455667788", progress: 35, tests: 4, missed: 8, status: 'Critical' },
            { id: 'm7', name: "Pranali D.", roll: "ME05", mobile: "9566778899", progress: 58, tests: 8, missed: 4, status: 'Active' },
            { id: 'm8', name: "Sumit B.", roll: "ME28", mobile: "9677889900", progress: 90, tests: 15, missed: 0, status: 'Placed' },
            { id: 'm9', name: "Tejas W.", roll: "ME19", mobile: "9788990011", progress: 50, tests: 7, missed: 5, status: 'Training' },
            { id: 'm10', name: "Vaibhav M.", roll: "ME31", mobile: "9899001122", progress: 68, tests: 10, missed: 2, status: 'Active' }
        ]
    };

    // Get data for the selected branch, default to empty array if not found
    const branchStudents = allStudents[branch] || [];

    const getStatusColor = (status) => {
        switch(status) {
            case 'Placed': return '#00B894';
            case 'Active': return '#6C5CE7';
            case 'Training': return '#FDCB6E';
            case 'Critical': return '#D63031';
            default: return '#999';
        }
    };

    const handleCall = (number) => Linking.openURL(`tel:${number}`);

    const renderStudentCard = ({ item }) => (
        <View style={styles.studentCard}>
            <View style={styles.cardTop}>
                <View>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.rollNo}>ID: {item.roll}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.contactRow}>
                <TouchableOpacity style={styles.phoneBtn} onPress={() => handleCall(item.mobile)}>
                    <Icon name="phone" size={14} color="#FFF" />
                    <Text style={styles.phoneText}>Call</Text>
                </TouchableOpacity>
                <Text style={styles.mobileText}>+91 {item.mobile}</Text>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.labelRow}>
                    <Text style={styles.labelText}>Placement Score</Text>
                    <Text style={styles.valueText}>{item.progress}%</Text>
                </View>
                <View style={styles.barContainer}>
                    <View style={[styles.barFill, { width: `${item.progress}%`, backgroundColor: getStatusColor(item.status) }]} />
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Icon name="check-circle-outline" size={18} color="#00B894" />
                    <Text style={styles.statNum}>{item.tests}</Text>
                    <Text style={styles.statSub}>Tests</Text>
                </View>
                <View style={styles.verticalDivider} />
                <View style={styles.statBox}>
                    <Icon name="error-outline" size={18} color="#D63031" />
                    <Text style={styles.statNum}>{item.missed}</Text>
                    <Text style={styles.statSub}>Missed</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <Text style={styles.profileBtnText}>Details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#1A1A1A" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{branch} Department</Text>
                    <Text style={styles.headerSubtitle}>{branchStudents.length} Students tracked</Text>
                </View>
            </View>

            <FlatList
                data={branchStudents}
                keyExtractor={(item) => item.id}
                renderItem={renderStudentCard}
                contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyView}>
                        <Text style={styles.emptyText}>No students found for this branch.</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FD' },
    header: {
        backgroundColor: '#FFF',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE'
    },
    backBtn: { marginRight: 15 },
    headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
    headerSubtitle: { fontSize: 13, color: '#999', fontWeight: '500' },

    studentCard: {
        backgroundColor: '#FFF',
        borderRadius: 25,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: '#2D3436' },
    rollNo: { fontSize: 11, color: '#A0A0A0', fontWeight: 'bold', marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: 'bold' },

    contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
    phoneBtn: { backgroundColor: '#9788FB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginRight: 10 },
    phoneText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', marginLeft: 4 },
    mobileText: { color: '#666', fontSize: 13, fontWeight: '500' },

    progressSection: { marginTop: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    labelText: { fontSize: 12, fontWeight: '700', color: '#999' },
    valueText: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
    barContainer: { height: 7, backgroundColor: '#F0F0F0', borderRadius: 4 },
    barFill: { height: 7, borderRadius: 4 },

    statsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
    statBox: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    statNum: { fontSize: 15, fontWeight: 'bold', marginLeft: 6, color: '#1A1A1A' },
    statSub: { fontSize: 10, color: '#999', marginLeft: 4, fontWeight: '600' },
    verticalDivider: { width: 1, height: 20, backgroundColor: '#EEE' },

    profileBtn: { backgroundColor: '#F3F4F9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    profileBtnText: { color: '#1A1A1A', fontSize: 11, fontWeight: 'bold' },

    emptyView: { marginTop: 50, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 16 }
});

export default BranchStudentList;