import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from './context/AuthContext';
import { useSmartAlarmRouter } from './hooks/useSmartAlarmRouter'; // IMPORT NEW SMART ROUTER HOOK HERE BRO!

// Auth Screens
import Landing from './Screens/Landing';
import Register from './Screens/Register';
import Login from './Screens/Login';
import VerifyOTP from './Screens/VerifyOTP';
import Email from './Screens/Email';
import ResetSecurity from './Screens/ResetOtp';
import ResetPassword from './Screens/ResetPassword';

// Student App Screens
import AppTabs from './Screens/AppTabs';
import BasicEdit from './Screens/BasicEdit';
import EditLearningInfo from './Screens/EditLearningInfo';
import RoadmapScreen from './Screens/RoadmapScreen';
import TeachScreen from './Screens/TeachScreen';
import DiagnosticTest from './Screens/DiagnosticTest';
import TestResult from './Screens/TestResult';
import TestInput from './Screens/TestInput';
import TestScreen from './Screens/TestScreen';
import Reminder from "./Screens/ReminderScreen";

// TPO Screens
import BranchStudentList from './Screens/TPO/BranchWiseStudent';
import AddBranch from './Screens/TPO/AddBranch';
import AddStudent from './Screens/TPO/AddStudent';
import BranchReport from './Screens/TPO/BranchReport';
import TPOPersonalInfo from './Screens/TPO/TPOPersonalInfo';

const Stack = createNativeStackNavigator();

// 🧠 Sub-wrapper component to separate context tree rendering safely
function ManagedAppNavigatorContent() {
    const { userToken, role } = useContext(AuthContext);
    const userRole = role?.toUpperCase();

    // 🔥 MOUNT THE ALARM DEEP-LINK LISTENER ENGINE HERE SYSTEM-WIDE!
    // This allows useNavigation to work flawlessly inside the NavigationContainer context!
    useSmartAlarmRouter();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
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
            ) : userRole === 'TPO' ? (
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
                <>
                    <Stack.Screen name="Main" component={AppTabs} />
                    <Stack.Screen name="EditBasicInfo" component={BasicEdit} />
                    <Stack.Screen name="EditLearningInfo" component={EditLearningInfo} />
                    <Stack.Screen name="DiagnosticTest" component={DiagnosticTest} />
                    <Stack.Screen name="TestInput" component={TestInput} />
                    <Stack.Screen name="TestScreen" component={TestScreen} />
                    <Stack.Screen name="TestResult" component={TestResult} />
                    <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                    <Stack.Screen name="Teach" component={TeachScreen} />
                    <Stack.Screen name="Reminder" component={Reminder} />
                </>
            )}
        </Stack.Navigator>
    );
}

// 🚀 Core Root Entry Export
export default function AppNavigator() {
    const { isLoading } = useContext(AuthContext);

    if (isLoading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4F46E5' }}>
            <ActivityIndicator size="large" color="#FFF" />
        </View>
    );

    return (
        <NavigationContainer>
            <ManagedAppNavigatorContent />
        </NavigationContainer>
    );
}