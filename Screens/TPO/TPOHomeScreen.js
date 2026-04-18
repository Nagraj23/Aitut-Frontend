import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TPOHomeScreen = ({ navigation }) => {

  const branchStats = [
    {
      id: 1,
      branch: "CSE",
      emoji: "💻",
      placed: 45,
      total: 60,
      color: '#6C5CE7',
      topStudents: ["Riya Mehta", "Sneha Joshi", "Kiran More"]
    },
    {
      id: 2,
      branch: "IT",
      emoji: "📱",
      placed: 38,
      total: 50,
      color: '#00B894',
      topStudents: ["Rahul Sharma", "Rohan Deshmukh", "Arya Sharma"]
    },
    {
      id: 3,
      branch: "ENTC",
      emoji: "📡",
      placed: 30,
      total: 55,
      color: '#FDCB6E',
      topStudents: ["Priya Singh", "Pooja Kale", "Siddharth N."]
    },
    {
      id: 4,
      branch: "MECH",
      emoji: "⚙️",
      placed: 25,
      total: 65,
      color: '#E17055',
      topStudents: ["Amit Patil", "Vikram Shinde", "Suresh K."]
    }
  ];

  const renderBigBranchCard = (item) => {
    const progress = Math.round((item.placed / item.total) * 100);

    return (
        <TouchableOpacity
            key={item.id}
            style={styles.bigCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("BranchStudents", { branch: item.branch })}
        >
          {/* Top Header Row */}
          <View style={styles.cardHeader}>
            <View style={[styles.emojiContainer, { backgroundColor: item.color + '15' }]}>
              <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.bigBranchName}>{item.branch} Engineering</Text>
              <Text style={styles.statusBadge}>In Progress</Text>
            </View>
            <Icon name="chevron-right" size={28} color="#CCC" />
          </View>

          {/* Major Stats Row */}
          <View style={styles.mainStatsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.hugeStat, { color: item.color }]}>{item.placed}</Text>
              <Text style={styles.statSub}>Placed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.hugeStat}>{item.total}</Text>
              <Text style={styles.statSub}>Total Students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.hugeStat, { color: '#2D3436' }]}>{progress}%</Text>
              <Text style={styles.statSub}>Success</Text>
            </View>
          </View>

          {/* Top 3 Students Preview */}
          <View style={styles.topStudentsContainer}>
            <Text style={styles.topStudentsTitle}>⭐ Top Performers</Text>
            <View style={styles.studentPills}>
              {item.topStudents.map((name, idx) => (
                  <View key={idx} style={styles.pill}>
                    <Text style={styles.pillText}>{name.split(' ')[0]}</Text>
                  </View>
              ))}
            </View>
          </View>

          {/* Decorative Progress Bar at Bottom of Card */}
          <View style={styles.cardProgressBarBg}>
            <View style={[styles.cardProgressBarFill, { width: `${progress}%`, backgroundColor: item.color }]} />
          </View>
        </TouchableOpacity>
    );
  };

  return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* TPO Info Header */}
          <View style={styles.tpoHeader}>
            <View style={styles.profileCircle}>
              <Icon name="account-circle" size={64} color="#9788FB" />
            </View>
            <View style={styles.tpoTextContent}>
              <Text style={styles.tpoGreeting}>Welcome back,</Text>
              <Text style={styles.tpoName}>Prof. M. K. Naral</Text>
              <Text style={styles.tpoRole}>TPO • BMIT Solapur</Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Branch Overviews</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Large Branch Cards */}
          <View style={styles.listContainer}>
            {branchStats.map((item) => renderBigBranchCard(item))}
          </View>

        </ScrollView>


      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F9'
  },
  scrollContent: {
    paddingBottom: 110
  },
  tpoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  tpoTextContent: {
    marginLeft: 15
  },
  tpoGreeting: {
    fontSize: 14,
    color: '#888'
  },
  tpoName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A'
  },
  tpoRole: {
    fontSize: 12,
    color: '#9788FB',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 25,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2D3436'
  },
  viewAllText: {
    color: '#9788FB',
    fontWeight: 'bold'
  },
  listContainer: {
    paddingHorizontal: 20
  },
  bigCard: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  emojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12
  },
  bigBranchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436'
  },
  statusBadge: {
    fontSize: 10,
    color: '#00B894',
    fontWeight: 'bold',
    marginTop: 2
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FD',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  hugeStat: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A'
  },
  statSub: {
    fontSize: 10,
    color: '#A0A0A0',
    fontWeight: 'bold',
    marginTop: 4,
    textTransform: 'uppercase'
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#DDD',
    alignSelf: 'center'
  },
  topStudentsContainer: {
    marginBottom: 10
  },
  topStudentsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10
  },
  studentPills: {
    flexDirection: 'row'
  },
  pill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8
  },
  pillText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600'
  },
  cardProgressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 15
  },
  cardProgressBarFill: {
    height: 6,
    borderRadius: 3
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingBottom: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20
  },
  tabItem: {
    alignItems: 'center'
  },
  tabText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4
  }
});

export default TPOHomeScreen;