import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Receipt, ShoppingCart, Zap, Car, Clapperboard, Package } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import type { Expense } from '@/src/types';

const iconMap: Record<string, React.ComponentType<any>> = {
    Food: Receipt,
    Groceries: ShoppingCart,
    Utilities: Zap,
    Transport: Car,
    Entertainment: Clapperboard,
    Other: Package,
};

interface ExpenseCardProps {
    expense: Expense;
    onPress?: () => void;
}

export function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
    const IconComponent = iconMap[expense.category] ?? Receipt;

    return (
        <Pressable className="expense-card" onPress={onPress}>
            <View className="expense-icon-wrap">
                <IconComponent size={18} color={colors.primary} />
            </View>
            <View className="flex-1">
                <Text className="expense-title" numberOfLines={1}>
                    {expense.title}
                </Text>
                <Text className="expense-meta">
                    {expense.paid_by_name ?? 'Unknown'} · {formatRelativeDate(expense.date)}
                </Text>
            </View>
            <Text className="expense-amount">
                {formatCurrency(expense.total_amount)}
            </Text>
        </Pressable>
    );
}
