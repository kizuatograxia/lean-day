import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { useAuth } from '../../components/providers/AuthProvider';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';

export default function Profile() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <Screen className="justify-center items-center">
                <ActivityIndicator size="large" color="#e11d48" />
            </Screen>
        );
    }

    return (
        <Screen scrollable className="px-6 py-6">
            <View className="items-center mb-8 mt-4">
                <View className="h-24 w-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-2 border-primary">
                    <Text className="text-4xl font-bold text-primary">
                        {user.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">{user.name}</Text>
                <Text className="text-base text-muted-foreground">{user.email}</Text>
            </View>

            <View className="mb-8 p-4 bg-card rounded-xl border border-border">
                <Text className="text-lg font-bold text-foreground mb-2">Meus Ingressos</Text>
                <Text className="text-sm text-muted-foreground">
                    Nenhum ingresso comprado recentemente.
                </Text>
            </View>

            <Button
                label="Sair da Conta"
                variant="destructive"
                onPress={async () => {
                    await signOut();
                }}
                className="w-full mt-auto mb-4"
            />
        </Screen>
    );
}
