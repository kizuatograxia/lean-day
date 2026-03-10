import { Stack } from 'expo-router';
import { AuthProvider } from '../components/providers/AuthProvider';
import { QueryProvider } from '../components/providers/QueryProvider';

import "../global.css";

export default function RootLayout() {
    return (
        <QueryProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(auth)" />
                </Stack>
            </AuthProvider>
        </QueryProvider>
    );
}
