import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { api } from '../lib/api';

interface CategoryNavProps {
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch(err => console.error("Failed to load categories:", err));
    }, []);

    if (categories.length === 0) return null;

    return (
        <View className="py-4 border-b border-border bg-background">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {/* Fixed "Todos" category if not included by API */}
                <TouchableOpacity
                    onPress={() => onCategoryChange("todos")}
                    className={`px-4 py-2 rounded-full border ${activeCategory === "todos"
                        ? "bg-primary border-primary"
                        : "bg-card border-border"
                        }`}
                >
                    <Text className={`font-medium ${activeCategory === "todos" ? "text-primary-foreground" : "text-foreground"}`}>
                        Todos
                    </Text>
                </TouchableOpacity>

                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => onCategoryChange(category.id)}
                            className={`flex flex-row items-center px-4 py-2 rounded-full border ${isActive
                                ? "bg-primary border-primary"
                                : "bg-card border-border"
                                }`}
                        >
                            <Text className={`mr-1 ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                                {category.emoji}
                            </Text>
                            <Text className={`font-medium ${isActive ? "text-primary-foreground" : "text-foreground"}`}>
                                {category.nome}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
