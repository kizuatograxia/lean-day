import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../components/providers/AuthProvider';
import { useRouter } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID, // Use the web client ID for Expo Go if not specified separately
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            if (authentication?.accessToken) {
                // Here is where we verify and login API side
                fetchUserInfo(authentication.accessToken);
            }
        }
    }, [response]);

    const fetchUserInfo = async (token: string) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();
            signIn({ id: user.id || '2', name: user.name || 'Google User', email: user.email }, 'mock-google-jwt');
        } catch (error) {
            console.error('Failed to fetch user context from Google:', error);
            Alert.alert("Erro", "Falha ao buscar conta Google.");
        }
    }

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }
        setLoading(true);
        // TODO: Connect this to actual backend / api.ts
        setTimeout(() => {
            // Mocked login response
            signIn({ id: '1', name: 'Usuário Teste', email }, 'mock-jwt-token');
            setLoading(false);
        }, 1000);
    };

    const handleGoogleLogin = () => {
        promptAsync();
    };

    return (
        <Screen scrollable>
            <View className="flex-1 justify-center px-6">
                <View className="mb-8 items-center">
                    <Text className="text-3xl font-bold text-primary mb-2">MundoPix</Text>
                    <Text className="text-base text-muted-foreground text-center">
                        Entre na sua conta para participar dos sorteios.
                    </Text>
                </View>

                {/* Social buttons */}
                <View className="space-y-3">
                    <View className="flex justify-center items-center">
                        <Button
                            label="Entrar com Google"
                            variant="outline"
                            className="w-full border-input bg-card"
                            onPress={handleGoogleLogin}
                        />
                    </View>
                </View>

                <View className="relative py-4">
                    <View className="absolute inset-0 flex items-center justify-center">
                        <View className="w-full border-t border-border" />
                    </View>
                    <View className="relative flex justify-center flex-row">
                        <Text className="bg-background px-3 text-muted-foreground text-xs uppercase font-semibold">
                            ou entre com e-mail
                        </Text>
                    </View>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="seu@email.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        label="Senha"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <View className="mt-8 space-y-4">
                    <Button
                        label="Entrar"
                        onPress={handleLogin}
                        isLoading={loading}
                        className="w-full"
                    />
                    <Button
                        label="Cadastre-se grátis"
                        variant="ghost"
                        onPress={() => router.push('/(auth)/register')}
                        className="w-full"
                    />
                </View>
            </View>
        </Screen>
    );
}
