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
import ProfileScreen from "./Screens/Profile";
import EditProfileScreen from "./Screens/ProfileUpdate";
import basicEdit from "./Screens/BasicEdit";
import EditLEarning from "./Screens/EditLEarning";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isLoading, userToken } = useContext(AuthContext);

    // Show a loading spinner while checking AsyncStorage
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#9788FB' }}>
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
                {userToken == null ? (
                    // --- AUTH STACK ---
                    // Users land here if they are not logged in
                    <>
                        <Stack.Screen name="Welcome" component={Landing} />
                        <Stack.Screen name="Login" component={Login} />
                        <Stack.Screen name="Register" component={Register} />
                        <Stack.Screen name="VerifyOTP" component={VerifyOTP} />
                        <Stack.Screen name="Email" component={Email} />
                        <Stack.Screen name="ResetOtp" component={ResetSecurity} />
                        <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    </>
                ) : (
                    <>

                    <Stack.Screen name="Main" component={AppTabs} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="EditLearning" component={EditLEarning} />
                    <Stack.Screen name="EditBasicInfo" component={basicEdit} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;