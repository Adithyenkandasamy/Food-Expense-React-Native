import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
    Bell,
    Plus,
    Wallet,
    Utensils,
    TrendingUp,
    Users,
    ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { getDashboard } from '@/src/api/dashboard';
import { colors } from '@/constants/theme';
import { formatCurrency, capitalize } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ExpenseCard } from '@/components/ui/ExpenseCard';
import { DashboardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { DashboardData } from '@/src/types';

export default function HomeScreen() {
    const { user, activeGroupId } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = useCallback(async () => {
        if (!activeGroupId) {
            setLoading(false);
            return;
        }
        try {
            const result = await getDashboard(activeGroupId);
            setData(result);
        } catch (e) {
            console.warn('Dashboard fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [activeGroupId]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    }, [fetchDashboard]);

    const greeting = (() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    })();

    return (
        <SafeAreaView className="screen" edges={['top']}>
            {/* App Bar */}
            <View className="app-bar">
                <View className="flex-row items-center gap-3">
                    <Avatar name={user?.name ?? 'User'} size="md" />
                    <View>
                        <Text className="text-xs font-sans-medium text-muted-foreground">
                            {greeting}
                        </Text>
                        <Text className="text-base font-sans-bold text-primary">
                            {user?.name ?? 'User'}
                        </Text>
                    </View>
                </View>
                <Pressable className="app-bar-action relative">
                    <Bell size={18} color={colors.primary} strokeWidth={1.5} />
                    {data?.pending_settlement && <View className="notif-badge" />}
                </Pressable>
            </View>

            {loading ? (
                <DashboardSkeleton />
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="px-5 pb-30"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {/* Balance Card */}
                    <View className="balance-card mt-2">
                        <Text className="balance-label">Current Balance</Text>
                        <Text className="balance-amount">
                            {formatCurrency(data?.current_balance ?? 0)}
                        </Text>
                        <View className="balance-stats">
                            <View className="flex-1">
                                <Text className="balance-stat-label">
                                    Monthly Expense
                                </Text>
                                <Text className="balance-stat-value">
                                    {formatCurrency(data?.monthly_expense ?? 0)}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="balance-stat-label">
                                    Contributions
                                </Text>
                                <Text className="balance-stat-value">
                                    {formatCurrency(data?.total_contributions ?? 0)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View className="flex-row gap-3 mt-5">
                        <Pressable
                            className="quick-action"
                            onPress={() => router.push('/(tabs)/expenses')}
                        >
                            <Plus size={18} color={colors.primary} strokeWidth={2} />
                            <Text className="quick-action-text">Expense</Text>
                        </Pressable>
                        <Pressable
                            className="quick-action"
                            onPress={() => router.push('/(tabs)/settlements')}
                        >
                            <Wallet size={16} color={colors.primary} strokeWidth={2} />
                            <Text className="quick-action-text">Contribute</Text>
                        </Pressable>
                        <Pressable
                            className="quick-action"
                            onPress={() => router.push('/(tabs)/meals')}
                        >
                            <Utensils size={16} color={colors.primary} strokeWidth={2} />
                            <Text className="quick-action-text">Log Meal</Text>
                        </Pressable>
                    </View>

                    {/* Stats Row */}
                    <View className="flex-row gap-3 mt-5">
                        <StatCard
                            label="Monthly Expense"
                            value={formatCurrency(data?.monthly_expense ?? 0)}
                            icon={<TrendingUp size={16} color={colors.mutedForeground} />}
                        />
                        <StatCard
                            label="Members"
                            value={String(data?.member_count ?? 0)}
                            icon={<Users size={16} color={colors.mutedForeground} />}
                        />
                    </View>

                    {/* Today's Meals */}
                    {data?.todays_meals && data.todays_meals.length > 0 && (
                        <View className="mt-6">
                            <SectionHeader title="Today's Meals" />
                            <View className="flex-row gap-3">
                                {data.todays_meals.map((meal) => (
                                    <View
                                        key={meal.meal_type}
                                        className={`flex-1 rounded-xl p-3 items-center ${meal.status === 'ate'
                                                ? 'bg-success/10'
                                                : meal.status === 'skip'
                                                    ? 'bg-muted'
                                                    : 'border border-border'
                                            }`}
                                    >
                                        <Text className="text-xs font-sans-semibold text-primary">
                                            {capitalize(meal.meal_type)}
                                        </Text>
                                        <Text
                                            className={`text-[10px] font-sans-medium mt-0.5 ${meal.status === 'ate'
                                                    ? 'text-success'
                                                    : meal.status === 'skip'
                                                        ? 'text-muted-foreground'
                                                        : 'text-muted-foreground'
                                                }`}
                                        >
                                            {meal.status
                                                ? capitalize(meal.status)
                                                : 'Not set'}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Recent Expenses */}
                    <View className="mt-6">
                        <SectionHeader
                            title="Recent Expenses"
                            actionLabel="See all"
                            onAction={() => router.push('/(tabs)/expenses')}
                        />
                        {data?.recent_expenses && data.recent_expenses.length > 0 ? (
                            <View className="gap-3">
                                {data.recent_expenses.slice(0, 5).map((expense) => (
                                    <ExpenseCard
                                        key={expense.id}
                                        expense={expense}
                                    />
                                ))}
                            </View>
                        ) : (
                            <Text className="home-empty-state">
                                No expenses yet
                            </Text>
                        )}
                    </View>

                    {/* No Group State */}
                    {!activeGroupId && (
                        <View className="items-center py-20 px-6">
                            <View className="w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-4">
                                <Users size={24} color={colors.mutedForeground} />
                            </View>
                            <Text className="text-base font-sans-bold text-primary text-center">
                                No group selected
                            </Text>
                            <Text className="text-sm font-sans-medium text-muted-foreground text-center mt-1.5">
                                Create or join a group to start tracking expenses
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
