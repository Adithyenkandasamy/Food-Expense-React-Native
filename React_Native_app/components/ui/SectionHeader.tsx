import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface SectionHeaderProps {
    title: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
    return (
        <View className="section-header">
            <Text className="section-title">{title}</Text>
            {actionLabel && onAction && (
                <Pressable onPress={onAction} className="flex-row items-center gap-0.5">
                    <Text className="section-action">{actionLabel}</Text>
                    <ChevronRight size={14} color="#71717A" />
                </Pressable>
            )}
        </View>
    );
}
