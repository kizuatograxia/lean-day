import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../components/ui/Screen';
import { Button } from '../../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ArrowLeft, Ticket, Truck, ShieldCheck, Star, Clock } from 'lucide-react-native';

export default function RaffleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);

    const { data: raffle, isLoading } = useQuery({
        queryKey: ['raffle', id],
        queryFn: async () => {
            try {
                return await api.getRaffle(id);
            } catch (error) {
                return null;
            }
        }
    });

    if (isLoading) {
        return <Screen className="items-center justify-center bg-background"><Text className="text-muted-foreground">Carregando...</Text></Screen>;
    }

    if (!raffle) {
        return <Screen className="items-center justify-center bg-background"><Text className="text-muted-foreground">Sorteio não encontrado.</Text></Screen>;
    }

    const handleCheckout = () => {
        Alert.alert('Checkout', `Compra de ${quantity} cotas iniciada...`);
    };

    const progress = (raffle.participantes / raffle.maxParticipantes) * 100;
    const custo = raffle.custoNFT?.toFixed(2) || '0.00';
    const totalSlots = raffle.maxParticipantes;

    return (
        <Screen className="pb-24 bg-secondary/30">
            {/* Header / Gallery */}
            <View className="relative h-72 w-full bg-muted">
                <Image
                    source={{ uri: raffle.imagem || (raffle.image_urls?.[0] || 'https://placehold.co/600x400') }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <TouchableOpacity
                    className="absolute top-4 left-4 h-10 w-10 bg-black/50 rounded-full items-center justify-center"
                    onPress={() => router.back()}
                >
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>

                {/* Buy Box equivalent */}
                <View className="bg-card rounded-md shadow-sm border border-border p-4 mb-4">
                    <Text className="text-[12px] text-muted-foreground mb-1 uppercase tracking-wider">
                        {raffle.status === 'ativo' ? 'Sorteio Ativo' : 'Encerrado'} | +{raffle.participantes} vendidos
                    </Text>

                    <Text className="text-[22px] font-semibold text-foreground leading-tight mb-2">
                        {raffle.titulo}
                    </Text>

                    <View className="flex-row items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} color="#2563eb" fill="#2563eb" />)}
                        <Text className="text-xs text-muted-foreground ml-1">({raffle.participantes > 0 ? raffle.participantes : 42})</Text>
                    </View>

                    <Text className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Cota Mínima</Text>
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ticket size={24} color="#16a34a" />
                        <Text className="text-[32px] font-light text-foreground tracking-tight">R$ {custo}</Text>
                    </View>

                    <View className="flex-row items-start gap-2 mb-4">
                        <Truck size={20} color="#16a34a" />
                        <View>
                            <Text className="text-[#16a34a] font-semibold text-sm">Sorteio Digital Garantido</Text>
                            <Text className="text-[#16a34a] text-xs">Entrega imediata na carteira</Text>
                        </View>
                    </View>

                    <View className="border-t border-border my-4" />

                    <View className="space-y-1 mb-4">
                        <Text className="text-sm text-muted-foreground">
                            Vendido por <Text className="text-blue-600 font-medium">MundoPix</Text>
                        </Text>
                        <Text className="text-xs text-muted-foreground">Distribuidor Autorizado | Mais de 10 mil sorteios entregues</Text>
                    </View>

                    <View className="bg-muted/50 rounded-md p-4 mb-4">
                        <Text className="text-sm font-semibold text-foreground mb-2">O que você precisa saber:</Text>
                        <Text className="text-sm text-muted-foreground mb-1">• Oportunidade Atual: <Text className="text-foreground font-bold">Alta</Text></Text>
                        <Text className="text-sm text-muted-foreground mb-1">• Encerramento: <Text className="text-foreground font-bold">Em breve</Text></Text>
                        <Text className="text-sm text-muted-foreground">• Prêmio de luxo • Sorteio auditado</Text>
                    </View>

                    {/* Progress */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs text-muted-foreground">{raffle.participantes} vendidos</Text>
                            <Text className="text-xs text-muted-foreground">{totalSlots} total</Text>
                        </View>
                        <View className="w-full bg-muted h-2 rounded-full overflow-hidden">
                            <View className="h-full bg-primary" style={{ width: `${progress}%` }} />
                        </View>
                    </View>

                    <View className="flex-row items-start gap-2 pt-4 border-t border-border">
                        <ShieldCheck size={20} color="#16a34a" />
                        <Text className="text-sm text-muted-foreground flex-1">
                            <Text className="text-[#16a34a] font-semibold">Compra Garantida</Text>, receba o bilhete que está esperando ou devolvemos.
                        </Text>
                    </View>
                </View>

                {/* Characteristics Table */}
                <View className="bg-card rounded-md shadow-sm border border-border mb-4 overflow-hidden">
                    <View className="px-4 py-3 border-b border-border bg-card">
                        <Text className="text-lg font-semibold text-foreground">Características principais</Text>
                    </View>
                    <View>
                        {[
                            ["Prêmio", raffle.premio || raffle.titulo],
                            ["Cotas Vendidas", `${raffle.participantes}`],
                            ["Total de Cotas", totalSlots],
                            ["Categoria", raffle.categoria],
                            ["Status", raffle.status === 'ativo' ? 'Ativo' : 'Encerrado'],
                        ].map(([label, val], i) => (
                            <View key={label} className={`flex-row px-4 py-3 ${i % 2 === 0 ? "bg-secondary/50" : "bg-card"} border-b border-border`}>
                                <Text className="font-semibold text-foreground w-[40%] text-sm">{label}</Text>
                                <Text className="text-muted-foreground text-sm flex-1">{val}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Description */}
                <View className="bg-card rounded-md shadow-sm border border-border mb-8 overflow-hidden">
                    <View className="px-4 py-3 border-b border-border bg-card">
                        <Text className="text-lg font-semibold text-foreground">Descrição do anúncio</Text>
                    </View>
                    <View className="px-4 py-4">
                        <Text className="text-base text-muted-foreground font-light leading-relaxed">
                            {raffle.descricao}
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {/* Floating Checkout Bar */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex-row items-center justify-between pb-8 shadow-lg">
                <View className="flex-row items-center bg-card border border-border rounded-lg mr-4">
                    <TouchableOpacity className="h-12 w-12 items-center justify-center" onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Text className="text-foreground text-xl font-bold">-</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-foreground mx-2 w-8 text-center">{quantity}</Text>
                    <TouchableOpacity className="h-12 w-12 items-center justify-center" onPress={() => setQuantity(quantity + 1)}>
                        <Text className="text-foreground text-xl font-bold">+</Text>
                    </TouchableOpacity>
                </View>

                <Button
                    label={`Comprar (R$ ${(quantity * raffle.custoNFT).toFixed(2)})`}
                    onPress={handleCheckout}
                    className="flex-1"
                />
            </View>
        </Screen>
    );
}
