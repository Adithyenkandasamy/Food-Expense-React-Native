import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Calendar, ArrowRight } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import { formatCurrency, getMonthName } from '@/lib/utils';
import type { Settlement } from '@/src/types';

interface SettlementCardProps {
    settlement: Settlement;
    onPress?: () => void;
}

export function SettlementCard({ settlement, onPress }: SettlementCardProps) {
    const isPending = settlement.status === 'pending';

    return (
        <Pressable className="settlement-card" onPress={onPress}>
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Calendar size={16} color={colors.mutedForeground} />
                    <Text className="text-sm font-sans-bold text-primary">
                        {getMonthName(settlement.month)} {settlement.year}
                    </Text>
                </View>
                <View
                    className={`settlement-badge ${isPending ? 'settlement-badge-pending' : 'settlement-badge-closed'
                        }`}
                >
                    <Text
                        className={`text-[10px] font-sans-bold ${isPending ? 'text-warning' : 'text-success'
                            }`}
                    >
                        {isPending ? 'Pending' : 'Closed'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                        Total Expense
                    </Text>
                    <Text className="text-base font-sans-bold text-primary mt-0.5">
                        {formatCurrency(settlement.total_expense)}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                        Contributions
                    </Text>
                    <Text className="text-base font-sans-bold text-primary mt-0.5">
                        {formatCurrency(settlement.total_contributions)}
                    </Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                    <ArrowRight size={14} color={colors.primary} />
                </View>
            </View>
        </Pressable>
    );
}
