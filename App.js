import React from 'react';
// App.js
import AppNavigator from "./AppNavigator";
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';

export default function App() {
    return (
        <AuthProvider>
            <UserProvider> {/* UserProvider MUST be inside AuthProvider */}
                <AppNavigator />
            </UserProvider>
        </AuthProvider>
    );
}