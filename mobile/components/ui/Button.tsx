import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { cn } from '../../lib/utils';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<View, ButtonProps>(
    ({ label, variant = 'primary', size = 'md', className, isLoading, onPress, ...props }, ref) => {

        const handlePress = (e: any) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onPress) onPress(e);
        };

        const baseStyles = "flex-row items-center justify-center rounded-md";

        const variants = {
            primary: "bg-primary",
            secondary: "bg-secondary",
            outline: "border border-input bg-background",
            ghost: "bg-transparent",
            destructive: "bg-destructive",
        };

        const textVariants = {
            primary: "text-primary-foreground",
            secondary: "text-secondary-foreground",
            outline: "text-foreground",
            ghost: "text-foreground",
            destructive: "text-destructive-foreground",
        };

        const sizes = {
            sm: "h-9 px-3",
            md: "h-11 px-4 py-2",
            lg: "h-14 px-8",
            icon: "h-10 w-10",
        };

        const textSizes = {
            sm: "text-sm",
            md: "text-base font-medium",
            lg: "text-lg font-semibold",
            icon: "text-base",
        };

        return (
            <TouchableOpacity
                className={cn(baseStyles, variants[variant], sizes[size], isLoading && "opacity-50", className)}
                onPress={handlePress}
                disabled={isLoading || props.disabled}
                activeOpacity={0.8}
                {...props}
            >
                <Text className={cn(textVariants[variant], textSizes[size])}>
                    {isLoading ? "Carregando..." : label}
                </Text>
            </TouchableOpacity>
        );
    }
);

Button.displayName = 'Button';
