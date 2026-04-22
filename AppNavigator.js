import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './context/AuthContext';

// Auth screens
import Landing from './Screens/Landing';
import Register from './Screens/Register';
import Login from './Screens/Login';
import VerifyOTP from './Screens/VerifyOTP';
import Email from './Screens/Email';
import ResetSecurity from './Screens/ResetOtp';
import ResetPassword from './Screens/ResetPassword';

// App screens
import AppTabs from './Screens/AppTabs';
// ✅ NOTE: 'AI-Tut' is a TAB inside AppTabs — NOT a stack screen here.
//    From HomeScreen navigate like: navigation.navigate('Main', { screen: 'AI-Tut' })
import BasicEdit from './Screens/BasicEdit';
import EditLearningInfo from './Screens/EditLearningInfo';
import RoadmapScreen from './Screens/RoadmapScreen';
import TeachScreen from './Screens/TeachScreen';
import DiagnosticTest from './Screens/DiagnosticTest';
import TestResult from './Screens/TestResult';
import TestInput from './Screens/TestInput';
import TestScreen from './Screens/TestScreen';

// TPO screens
import BranchStudentList from './Screens/TPO/BranchWiseStudent';
import AddBranch from './Screens/TPO/AddBranch';
import AddStudent from './Screens/TPO/AddStudent';
import BranchReport from './Screens/TPO/BranchReport';
import TPOPersonalInfo from './Screens/TPO/TPOPersonalInfo';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { isLoading, userToken, role } = useContext(AuthContext);
    const userRole = role?.toUpperCase();

    if (isLoading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4F46E5' }}>
            <ActivityIndicator size="large" color="#FFF" />
        </View>
    );

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

                {userToken == null ? (
                    // ── Unauthenticated ──────────────────────────────────────
                    <>
                        <Stack.Screen name="Landing" component={Landing} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
                        <Stack.Screen name="Email" component={Email} />
                        <Stack.Screen name="ResetOtp" component={ResetSecurity} />
                        <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    </>
                ) : userRole === 'TPO' ? (
                    // ── TPO role ─────────────────────────────────────────────
                    <>
                        <Stack.Screen name="Main" component={AppTabs} />
                        <Stack.Screen name="BranchStudents" component={BranchStudentList} />
                        <Stack.Screen name="AddBranch" component={AddBranch} />
                        <Stack.Screen name="AddStudent" component={AddStudent} />
                        <Stack.Screen name="BranchReport" component={BranchReport} />
                        <Stack.Screen name="TPOPersonalInfo" component={TPOPersonalInfo} />
                        <Stack.Screen name="EditBasicInfo" component={BasicEdit} />
                    </>
                ) : (
                    // ── Student / default role ───────────────────────────────
                    <>
                        {/*
                         * AppTabs contains all bottom-tab screens including 'AI-Tut'.
                         * To navigate there: navigation.navigate('Main', { screen: 'AI-Tut' })
                         */}
                        <Stack.Screen name="Main" component={AppTabs} />
                        <Stack.Screen name="EditBasicInfo" component={BasicEdit} />
                        <Stack.Screen name="EditLearningInfo" component={EditLearningInfo} />
                        <Stack.Screen name="DiagnosticTest" component={DiagnosticTest} />
                        <Stack.Screen name="TestInput" component={TestInput} />
                        <Stack.Screen name="TestScreen" component={TestScreen} />
                        <Stack.Screen name="TestResult" component={TestResult} />
                        <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                        <Stack.Screen name="Teach" component={TeachScreen} />
                    </>
                )}

            </Stack.Navigator>
        </NavigationContainer>
    );
}