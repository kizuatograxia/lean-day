import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, ViewProps, StatusBar } from 'react-native';
import { cn } from '../../lib/utils';

interface ScreenProps extends ViewProps {
    scrollable?: boolean;
}

export function Screen({ scrollable = false, children, className, ...props }: ScreenProps) {
    const Container = scrollable ? ScrollView : View;

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} className="bg-background">
            <StatusBar barStyle="light-content" translucent />
            <Container
                className={cn("flex-1", className)}
                contentContainerStyle={scrollable ? { flexGrow: 1, padding: 16 } : undefined}
                {...props}
            >
                {children}
            </Container>
        </SafeAreaView>
    );
}
