import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from './Avatar';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { Contribution } from '@/src/types';

interface ContributionCardProps {
    contribution: Contribution;
    onPress?: () => void;
}

export function ContributionCard({ contribution, onPress }: ContributionCardProps) {
    return (
        <Pressable className="contribution-card" onPress={onPress}>
            <Avatar name={contribution.user?.name ?? 'User'} size="md" />
            <View className="flex-1 ml-3">
                <Text className="text-sm font-sans-semibold text-primary" numberOfLines={1}>
                    {contribution.user?.name ?? 'Unknown'}
                </Text>
                <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
                    {contribution.note || formatRelativeDate(contribution.date)}
                </Text>
            </View>
            <Text className="text-sm font-sans-bold text-success">
                +{formatCurrency(contribution.amount)}
            </Text>
        </Pressable>
    );
}
