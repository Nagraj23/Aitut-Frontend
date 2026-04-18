import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Context
import { AuthContext } from '../context/AuthContext';

// Screens
import TPOHomeScreen from './TPO/TPOHomeScreen';
import StudentHomeScreen from './Home';
import ChatScreen from './ChatScreen';
import TeachScreen from './TeachScreen';
import ProfileScreen from './Profile';
import TPOProfile from "./TPO/TPOProfile";
import BranchStudentList from "./TPO/BranchWiseStudent";

const Tab = createBottomTabNavigator();

const AppTabs = () => {
    const { role } = useContext(AuthContext);

    // Normalize role to handle 'tpo', 'TPO', etc.
    const userRole = role?.toUpperCase();

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarActiveTintColor: '#9788FB',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    height: 65,
                    paddingBottom: 10,
                    borderTopWidth: 0,
                    elevation: 10,
                    backgroundColor: '#FFF'
                }
            }}
        >
            {userRole === 'TPO' ? (
                // 🏢 TPO TABS
                <>
                    <Tab.Screen
                        name="Home"
                        component={TPOHomeScreen}
                        options={{
                            tabBarLabel: 'Dashboard',
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
                            )
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={TPOProfile}
                        options={{
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                            )
                        }}
                    />
                </>
            ) : (
                // 🎓 STUDENT TABS
                <>
                    <Tab.Screen
                        name="Home"
                        component={StudentHomeScreen}
                        options={{
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'home' : 'home-outline'} size={size} color={color} />
                            )
                        }}
                    />
                    <Tab.Screen
                        name="AI-Chat"
                        component={ChatScreen}
                        options={{
                            tabBarLabel: 'Chat',
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
                            )
                        }}
                    />
                    <Tab.Screen
                        name="Teach"
                        component={TeachScreen}
                        options={{
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'school' : 'school-outline'} size={size} color={color} />
                            )
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            tabBarIcon: ({ focused, color, size }) => (
                                <Icon name={focused ? 'person' : 'person-outline'} size={size} color={color} />
                            )
                        }}
                    />
                </>
            )}
        </Tab.Navigator>
    );
};

export default AppTabs;