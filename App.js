// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Landing from "./Screens/Landing";
// import Register from "./Screens/Register";
// import Login from "./Screens/Login";
// import VerifyOTP from "./Screens/VerifyOTP";

// const Stack = createNativeStackNavigator();

// export default function App() {
//     return (
//         <NavigationContainer>
//             <Stack.Navigator
//                 initialRouteName="Welcome"
//                 screenOptions={{
//                     headerShown: false, // Shows the top bar with the title
//                     animation: 'slide_from_right'
//                 }}
//             >
//                 <Stack.Screen name="Welcome" component={Landing} />
//                 <Stack.Screen name="Register" component={Register} />
//                 <Stack.Screen name="Login" component={Login} />
//                 <Stack.Screen name="VerifyOTP" component={VerifyOTP} />

//             </Stack.Navigator>
//         </NavigationContainer>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#f5f5f5',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 20,
//     },
// });



import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './AppNavigator';

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}