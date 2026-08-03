/**
 * MessMate - Dashboard / Home Screen
 */
import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, StatCard, SectionHeader, Avatar, EmptyState, LoadingSkeleton, Badge } from '../../src/components/ui';
import { useAuthStore, useGroupStore } from '../../src/store';
import { useDashboard } from '../../src/hooks/useApi';
import { formatCurrency, formatRelativeDate, getBalanceColor } from '../../src/utils/helpers';
import { MEAL_TYPES } from '../../src/constants';

export default function DashboardScreen() {
    const user = useAuthStore((s) => s.user);
    const currentGroup = useGroupStore((s) => s.currentGroup);
    const { data, isLoading, refetch, isRefetching } = useDashboard(currentGroup?.id);

    if (!currentGroup) {
        return (
            <SafeAreaView className="flex-1 bg-dark-950">
                <EmptyState
                    icon="people-outline"
                    title="No Group Selected"
                    message="Create or join a group to start tracking expenses."
                    action={{ label: 'Go to Groups', onPress: () => router.push('/(tabs)/groups') }}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-dark-950">
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366F1" />}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(400)} className="px-5 pt-4 pb-2">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-dark-400 text-sm">Welcome back,</Text>
                            <Text className="text-white text-2xl font-bold">{user?.name?.split(' ')[0]} 👋</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                            <Avatar name={user?.name || 'U'} size={44} />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row items-center mt-2 bg-dark-800 rounded-xl px-3 py-2">
                        <Ionicons name="people" size={16} color="#818CF8" />
                        <Text className="text-primary-300 text-sm ml-2 font-medium">{currentGroup.name}</Text>
                        <Text className="text-dark-500 text-xs ml-auto">{data?.member_count || 0} members</Text>
                    </View>
                </Animated.View>

                {isLoading ? (
                    <LoadingSkeleton count={4} />
                ) : data ? (
                    <View className="px-5 mt-4">
                        {/* Stats Row */}
                        <View className="flex-row gap-3 mb-4">
                            <StatCard
                                icon="wallet"
                                label="Your Balance"
                                value={formatCurrency(data.current_balance)}
                                color={getBalanceColor(data.current_balance)}
                                delay={100}
                            />
                            <StatCard
                                icon="trending-up"
                                label="This Month"
                                value={formatCurrency(data.monthly_expense)}
                                color="#F59E0B"
                                delay={200}
                            />
                        </View>

                        <View className="flex-row gap-3 mb-4">
                            <StatCard
                                icon="cash"
                                label="Contributed"
                                value={formatCurrency(data.total_contributions)}
                                color="#10B981"
                                delay={300}
                            />
                            <StatCard
                                icon={data.pending_settlement ? 'alert-circle' : 'checkmark-circle'}
                                label="Settlement"
                                value={data.pending_settlement ? 'Pending' : 'Clear'}
                                color={data.pending_settlement ? '#EF4444' : '#10B981'}
                                delay={400}
                            />
                        </View>

                        {/* Today's Meals */}
                        <SectionHeader title="Today's Meals" />
                        <Card delay={500}>
                            <View className="flex-row justify-around">
                                {data.todays_meals.map((meal: any) => {
                                    const config = MEAL_TYPES.find((m) => m.key === meal.meal_type);
                                    return (
                                        <View key={meal.meal_type} className="items-center">
                                            <View
                                                style={{ backgroundColor: (meal.status === 'ate' ? '#10B98120' : meal.status === 'skipped' ? '#EF444420' : '#47556920') }}
                                                className="w-14 h-14 rounded-full items-center justify-center mb-2"
                                            >
                                                <Ionicons
                                                    name={config?.icon as any || 'restaurant'}
                                                    size={24}
                                                    color={meal.status === 'ate' ? '#10B981' : meal.status === 'skipped' ? '#EF4444' : '#475569'}
                                                />
                                            </View>
                                            <Text className="text-dark-300 text-xs capitalize">{meal.meal_type}</Text>
                                            <Text className={`text-xs font-medium mt-0.5 ${meal.status === 'ate' ? 'text-green-400' : meal.status === 'skipped' ? 'text-red-400' : 'text-dark-500'}`}>
                                                {meal.status ? meal.status.charAt(0).toUpperCase() + meal.status.slice(1) : 'Not Set'}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </Card>

                        {/* Recent Expenses */}
                        <SectionHeader
                            title="Recent Purchases"
                            action={{ label: 'View All', onPress: () => router.push('/(tabs)/expenses') }}
                        />
                        {data.recent_expenses.length > 0 ? (
                            data.recent_expenses.map((expense: any, i: number) => (
                                <Card key={expense.id} delay={600 + i * 100}>
                                    <View className="flex-row items-center">
                                        <Avatar name={expense.payer.name} size={36} />
                                        <View className="flex-1 ml-3">
                                            <Text className="text-white text-sm font-semibold">{expense.title}</Text>
                                            <Text className="text-dark-400 text-xs">{expense.payer.name} • {formatRelativeDate(expense.date)}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white text-sm font-bold">{formatCurrency(expense.total_amount)}</Text>
                                            <Badge label={expense.category} />
                                        </View>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <Text className="text-dark-400 text-center text-sm">No expenses yet this month</Text>
                            </Card>
                        )}

                        {/* Contribution Summary */}
                        <SectionHeader title="Member Contributions" />
                        <Card delay={900}>
                            {data.contribution_summary.map((member: any) => (
                                <View key={member.user_id} className="flex-row items-center justify-between py-2 border-b border-dark-700 last:border-0">
                                    <View className="flex-row items-center flex-1">
                                        <Avatar name={member.name} size={28} />
                                        <Text className="text-dark-200 text-sm ml-2">{member.name}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-dark-300 text-xs">Paid: {formatCurrency(member.total_paid)}</Text>
                                        <Text className="text-dark-400 text-xs">Contrib: {formatCurrency(member.total_contributed)}</Text>
                                    </View>
                                </View>
                            ))}
                        </Card>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}
