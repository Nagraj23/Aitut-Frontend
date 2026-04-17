import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TPOHomeScreen = ({ navigation }) => {

  const branchStats = [
    { id: 1, branch: "CSE", placed: 45 },
    { id: 2, branch: "IT", placed: 38 },
    { id: 3, branch: "ENTC", placed: 30 },
    { id: 4, branch: "MECH", placed: 25 }
  ];

  const students = [
    { id: 1, name: "Riya mehta", branch: "CSE" },
    { id: 2, name: "Rahul Sharma", branch: "IT" },
    { id: 3, name: "Priya Singh", branch: "ENTC" },
    { id: 4, name: "Amit Patil", branch: "MECH" },
    { id: 5, name: "Sneha Joshi", branch: "CSE" },
    { id: 6, name: "Rohan Deshmukh", branch: "IT" },
    { id: 7, name: "Pooja Kale", branch: "ENTC" },
    { id: 8, name: "Vikram Shinde", branch: "MECH" },
    { id: 9, name: "Kiran More", branch: "CSE" },
    { id: 10, name: "Arya sharma", branch: "IT" }
  ];

  return (
    <View style={styles.container}>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.header}>TPO Dashboard</Text>

        {/* Branch Cards */}
        <View style={styles.branchContainer}>
          {branchStats.map((item) => (
            <TouchableOpacity key={item.id} style={styles.branchCard}>
              <Text style={styles.branchName}>{item.branch}</Text>
              <Text style={styles.branchCount}>{item.placed} Placed</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Student List */}
        <Text style={styles.section}>Student List</Text>

        {students.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.studentCard}
            onPress={() => navigation.navigate("StudentDetail", { student: item })}
          >
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentBranch}>{item.branch}</Text>
          </TouchableOpacity>
        ))}

        {/* Space so last item not hidden */}
        <View style={{ height: 80 }} />

      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Icon name="home" size={24} color="#9788FB" />
          <Text style={[styles.tabText, { color: '#9788FB' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("AIChat")}
        >
          <Icon name="chat" size={24} color="#999" />
          <Text style={styles.tabText}>AI Tut</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Profile")}
        >
          <Icon name="person" size={24} color="#999" />
          <Text style={styles.tabText}>Profile</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    color: '#1A1A1A',
    paddingHorizontal: 20
  },

  branchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20
  },

  branchCard: {
    backgroundColor: '#9788FB',
    width: '47%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 5
  },

  branchName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },

  branchCount: {
    color: '#E0E0E0',
    marginTop: 5,
    fontSize: 12
  },

  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#1A1A1A',
    paddingHorizontal: 20
  },

  studentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    marginHorizontal: 20,
    elevation: 3
  },

  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },

  studentBranch: {
    color: '#666',
    marginTop: 3
  },

  // 🔻 Bottom Tab Styling
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    elevation: 10
  },

  tabItem: {
    alignItems: 'center'
  },

  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 3
  }
});

export default TPOHomeScreen;