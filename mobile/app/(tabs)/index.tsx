import React, { useState, useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Screen } from '../../components/ui/Screen';
import { RaffleCard } from '../../components/RaffleCard';
import { CategoryNav } from '../../components/CategoryNav';
import { Input } from '../../components/ui/Input';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Search, Trophy, Filter } from 'lucide-react-native';

import { Raffle } from '../../types/raffle';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("todos");

    const { data: raffles = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['raffles'],
        queryFn: async () => {
            try {
                const res = await api.getActiveRaffles();
                return res;
            } catch (error) {
                console.warn("Failed to fetch raffles from API, returning empty state.", error);
                return [];
            }
        }
    });

    const filteredRaffles = useMemo(() => {
        let result = raffles.filter((r: Raffle) => r.status === 'ativo' || r.status === 'active');

        // Filter by search
        if (searchQuery) {
            result = result.filter((r: Raffle) =>
                r.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.premio?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filter by category
        if (activeCategory !== "todos") {
            result = result.filter((r: Raffle) => r.categoria === activeCategory);
        }

        // Sort by Ending Soon default
        result.sort((a: Raffle, b: Raffle) => new Date(a.dataFim).getTime() - new Date(b.dataFim).getTime());

        return result;
    }, [searchQuery, activeCategory, raffles]);

    if (isLoading && !isRefetching) {
        return (
            <Screen className="justify-center items-center h-full">
                <ActivityIndicator size="large" color="#e11d48" />
            </Screen>
        );
    }

    const renderEmptyState = () => {
        if (isLoading || isRefetching) return null;
        return (
            <View className="flex-1 items-center justify-center py-16">
                <View className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                    <Filter size={32} color="#a1a1aa" />
                </View>
                <Text className="text-xl font-bold text-foreground mb-2">Nenhum sorteio encontrado</Text>
                <Text className="text-muted-foreground text-center px-8">
                    Tente ajustar seus filtros ou busca para encontrar outros sorteios.
                </Text>
            </View>
        );
    };

    return (
        <Screen className="flex-1 bg-background">
            <View className="px-4 py-4 pt-6 bg-background">
                {/* Header */}
                <View className="flex-row items-center gap-3 mb-6 mt-4">
                    <View className="p-2 bg-primary/20 rounded-xl">
                        <Trophy size={24} color="#e11d48" />
                    </View>
                    <View>
                        <Text className="text-3xl font-bold text-foreground">Sorteios</Text>
                        <Text className="text-muted-foreground text-xs mt-1">Concorra a prêmios incríveis</Text>
                    </View>
                </View>

                {/* Search */}
                <View className="relative w-full mb-1">
                    <View className="absolute left-3 top-[14px] z-10 hidden">
                        <Search size={20} color="#a1a1aa" />
                    </View>
                    <Input
                        placeholder="Buscar sorteios..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="bg-card border-border h-12 text-foreground w-full"
                    />
                </View>
            </View>

            <CategoryNav
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            <View className="flex-1 w-full px-4 pt-4 bg-background">
                <FlashList<Raffle>
                    data={filteredRaffles}
                    renderItem={({ item }) => <RaffleCard raffle={item} />}
                    keyExtractor={(item) => item.id}
                    onRefresh={refetch as any}
                    refreshing={isRefetching}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    // @ts-ignore
                    estimatedItemSize={285}
                    ListEmptyComponent={renderEmptyState}
                />
            </View>
        </Screen>
    );
}
