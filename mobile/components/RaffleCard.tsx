import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from './ui/Card';
import { Raffle } from '../types/raffle';
import { Clock, Ticket } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';

interface RaffleCardProps {
    raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
    const router = useRouter();

    const progress = (raffle.participantes / raffle.maxParticipantes) * 100;
    const custo = typeof raffle.custoNFT === 'number' ? raffle.custoNFT.toFixed(2) : '0.00';

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/raffle/${raffle.id}`)}
            className="mb-4"
        >
            <Card className="overflow-hidden">
                <View className="h-48 w-full bg-muted">
                    <Image
                        source={{ uri: raffle.imagem || (raffle.image_urls?.[0] || 'https://placehold.co/600x400') }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-md">
                        <Text className="text-primary-foreground font-bold font-mono">
                            R$ {custo}
                        </Text>
                    </View>
                </View>

                <View className="p-4">
                    <Text className="text-xl font-bold text-foreground mb-1" numberOfLines={1}>
                        {raffle.titulo}
                    </Text>

                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-1">
                            <Ticket size={16} color="#a1a1aa" />
                            <Text className="text-sm text-muted-foreground">
                                {raffle.participantes} / {raffle.maxParticipantes}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Clock size={16} color="#a1a1aa" />
                            <Text className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(raffle.dataFim), { locale: ptBR, addSuffix: true })}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-primary"
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
