import React from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { cn } from '../../lib/utils';

export interface InputProps extends TextInputProps {
    error?: string;
    label?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
    ({ className, error, label, ...props }, ref) => {
        return (
            <View className="mb-4">
                {label && <Text className="text-sm font-medium text-foreground mb-2">{label}</Text>}
                <TextInput
                    ref={ref}
                    className={cn(
                        "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground",
                        "pb-disabled:cursor-not-allowed pb-disabled:opacity-50",
                        error && "border-destructive",
                        className
                    )}
                    placeholderTextColor="#9ca3af"
                    {...props}
                />
                {error && (
                    <Text className="text-sm font-medium text-destructive mt-1">{error}</Text>
                )}
            </View>
        );
    }
);

Input.displayName = 'Input';
