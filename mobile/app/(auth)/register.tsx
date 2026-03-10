import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = () => {
        if (!name || !email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            router.back();
            setLoading(false);
        }, 1000);
    };

    return (
        <Screen scrollable className="px-6 py-6">
            <View className="mb-8 items-center">
                <Text className="text-2xl font-extrabold text-foreground mb-2">Vamos começar! 🎯</Text>
                <Text className="text-base text-muted-foreground text-center">
                    Insira seus dados para garantir sua segurança no MundoPix.
                </Text>
            </View>

            <View className="space-y-4 w-full">
                <Input
                    label="Nome Completo"
                    placeholder="Ex: João da Silva"
                    value={name}
                    onChangeText={setName}
                />
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
                    label="CRIAR CONTA E APOSTAR 🎲"
                    onPress={handleRegister}
                    isLoading={loading}
                    className="w-full"
                />
                <Button
                    label="Faça login"
                    variant="ghost"
                    onPress={() => router.back()}
                    className="w-full"
                />
            </View>
        </Screen>
    );
}
