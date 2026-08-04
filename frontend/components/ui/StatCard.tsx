import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/theme';

interface StatCardProps {
    label: string;
    value: string;
    icon?: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
    return (
        <View className="stat-card">
            {icon && <View className="mb-2">{icon}</View>}
            <Text className="stat-value">{value}</Text>
            <Text className="stat-label">{label}</Text>
        </View>
    );
}
