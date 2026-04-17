import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context
import { AuthContext } from './context/AuthContext';

// Screens
import Landing from "./Screens/Landing";
import Register from "./Screens/Register";
import Login from "./Screens/Login";
import VerifyOTP from "./Screens/VerifyOTP";
import Email from "./Screens/Email";
import ResetSecurity from "./Screens/ResetOtp";
import ResetPassword from "./Screens/ResetPassword";
import AppTabs from './Screens/AppTabs';

// Common Screens
import EditProfileScreen from "./Screens/ProfileUpdate";
import basicEdit from "./Screens/BasicEdit";
import EditLearningInfo from "./Screens/EditLearningInfo";
import RoadmapScreen from './Screens/RoadmapScreen';
import TeachScreen from './Screens/TeachScreen';
import DiagnosticTest from './Screens/DiagnosticTest';
import TestResult from './Screens/TestResult';

// TPO Screens
import TPOHomeScreen from "./Screens/TPO/TPOHomeScreen";
import TPOProfile from "./Screens/TPO/TPOProfile";
import RegisterStudentScreen from "./Screens/TPO/RegisterStudentScreen";
import TPOProfileScreen from './Screens/TPO/TPOProfile';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, user } = useContext(AuthContext);

    // 🔥 DEBUG LOGS (IMPORTANT)
    console.log("👤 USER FROM CONTEXT:", user);
    console.log("🎭 USER ROLE:", user?.role);
    console.log("🔐 TOKEN:", userToken);

    // Loading screen
    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#9788FB'
            }}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right'
                }}
            >

                {/* 🔐 AUTH STACK */}
                {userToken == null ? (
                    <>
                        <Stack.Screen name="Landing" component={Landing} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
                        <Stack.Screen name="Email" component={Email} />
                        <Stack.Screen name="ResetOtp" component={ResetSecurity} />
                        <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    </>
                ) : user?.role === "TPO" ? (
                    /* 🧑‍💼 TPO STACK */
                    <>
                        <Stack.Screen name="TPOHome" component={TPOHomeScreen} />
                        <Stack.Screen name="TPOProfile" component={TPOProfileScreen} />
                        <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} />
                    </>
                ) : (
                    /* 👨‍🎓 NORMAL USER STACK */
                    <>
                        <Stack.Screen name="Main" component={AppTabs} />

                        {/* Common screens */}
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="EditLearningInfo" component={EditLearningInfo} />
                        <Stack.Screen name="EditBasicInfo" component={basicEdit} />
                        <Stack.Screen name="DiagnosticTest" component={DiagnosticTest} />
                        <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                        <Stack.Screen name="Teach" component={TeachScreen} />
                        <Stack.Screen name="TestResult" component={TestResult} />
                    </>
                )}

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;