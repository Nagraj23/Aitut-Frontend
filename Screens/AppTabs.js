import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatScreen from './ChatScreen'; // add this import

// Import your screens (we'll define Home below)
import HomeScreen from './Home';
// import MentorScreen from './screens/MentorScreen';
// // import TestScreen from './screens/TestScreen';
// import RoadmapScreen from './Screens/RoadmapScreen';
// import TeachScreen from './Screens/TeachScreen';
import ProfileScreen from './Profile';

const Tab = createBottomTabNavigator();

const AppTabs = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Test') iconName = focused ? 'clipboard' : 'clipboard-outline';
                    else if (route.name === 'AI-Tut') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#9788FB', // Your brand color
                tabBarInactiveTintColor: 'gray',
                headerShown: false, // We'll build custom headers
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            {/*<Tab.Screen name="Test" component={TestScreen} />*/}
            {/*<Tab.Screen name="AI-Tut" component={MentorScreen} />*/}
           
            <Tab.Screen name="AI-Tut" component={ChatScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default AppTabs;
