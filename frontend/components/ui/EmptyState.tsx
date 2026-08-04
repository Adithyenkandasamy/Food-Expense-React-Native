import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <View className="empty-state">
            <View className="empty-icon">{icon}</View>
            <Text className="empty-title">{title}</Text>
            {description && <Text className="empty-desc">{description}</Text>}
            {actionLabel && onAction && (
                <View className="mt-5">
                    <PrimaryButton label={actionLabel} onPress={onAction} />
                </View>
            )}
        </View>
    );
}
