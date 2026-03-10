import React from 'react';
import { View, Text } from 'react-native';
import { Screen } from '../../components/ui/Screen';

export default function NFTsScreen() {
    return (
        <Screen className="justify-center items-center">
            <Text className="text-2xl font-bold text-foreground mb-2">Meus Prêmios</Text>
            <Text className="text-base text-muted-foreground text-center">
                Em breve, seus prêmios e colecionáveis digitais aparecerão aqui.
            </Text>
        </Screen>
    );
}
