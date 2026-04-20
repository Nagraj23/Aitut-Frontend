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
import ProfileScreen from "./Screens/Profile";
import BranchStudentList from "./Screens/TPO/BranchWiseStudent";
// Add these imports in AppNavigator.js:
import AddBranch from './Screens/TPO/AddBranch';
import AddStudent from './Screens/TPO/AddStudent';
import BranchReport from './Screens/TPO/BranchReport';
import TPOPersonalInfo from './Screens/TPO/TPOPersonalInfo';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken, role } = useContext(AuthContext);

    // Normalize role check
    const userRole = role?.toUpperCase();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

                {userToken == null ? (
                    /* 🔐 AUTH STACK */
                    <>
                        <Stack.Screen name="Landing" component={Landing} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
                        {/* ... other auth screens */}
                    </>
                ) : userRole === "TPO" ? (
                    /* 🧑‍💼 TPO STACK */
                    <>
                        {/* 'Main' contains the Bottom Tabs (Dashboard + Profile) */}
                        <Stack.Screen name="Main" component={AppTabs} />

                        <Stack.Screen name="BranchStudents" component={BranchStudentList} />
                        {/* Screens TPO can navigate to FROM the dashboard */}
                        <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} />
                        <Stack.Screen name="AddBranch" component={AddBranch} />
                        <Stack.Screen name="AddStudent" component={AddStudent} />
                        <Stack.Screen name="BranchReport" component={BranchReport} />
                        <Stack.Screen name="TPOPersonalInfo" component={TPOPersonalInfo} />
                        <Stack.Screen name="EditBasicInfo" component={basicEdit} />
                        {/* Add the Branch Detail screen here so the card click works */}
                        {/*<Stack.Screen name="BranchStudentList" component={BranchStudentListScreen} />*/}
                    </>
                ) : (
                    /* 👨‍🎓 STUDENT STACK */
                    <>
                        <Stack.Screen name="Main" component={AppTabs} />

                        {/* Student specific sub-pages */}
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="DiagnosticTest" component={DiagnosticTest} />
                        <Stack.Screen name="Roadmap" component={RoadmapScreen} />
                        <Stack.Screen name="TestResult" component={TestResult} />
                    </>
                )}

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;