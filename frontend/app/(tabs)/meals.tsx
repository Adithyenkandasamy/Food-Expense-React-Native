/**
 * MessMate - Meals Tracker Screen
 * Mark daily meal attendance for all group members.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, EmptyState, LoadingSkeleton, Avatar } from '../../src/components/ui';
import { useMeals, useCreateMeal, useUpdateAttendance } from '../../src/hooks/useApi';
import { useGroupStore, useAuthStore } from '../../src/store';
import { getTodayString } from '../../src/utils/helpers';
import { MEAL_TYPES } from '../../src/constants';
import type { MealType, AttendanceStatus } from '../../src/types';

export default function MealsScreen() {
    const currentGroup = useGroupStore((s) => s.currentGroup);
    const user = useAuthStore((s) => s.user);
    const today = getTodayString();

    const { data: meals, isLoading, refetch, isRefetching } = useMeals(currentGroup?.id, today);
    const createMeal = useCreateMeal();
    const updateAttendance = useUpdateAttendance();

    const ensureMealAndToggle = async (mealType: MealType, currentStatus: AttendanceStatus | null) => {
        if (!currentGroup || !user) return;

        try {
            // Find existing meal or create one
            let meal = meals?.find((m) => m.meal_type === mealType);

            if (!meal) {
                const { data } = await createMeal.mutateAsync({
                    group_id: currentGroup.id,
                    date: today,
                    meal_type: mealType,
                });
                meal = data;
            }

            // Toggle status: null → ate → skipped → ate
            const newStatus = currentStatus === 'ate' ? 'skipped' : 'ate';

            await updateAttendance.mutateAsync({ mealId: meal.id, status: newStatus });
            refetch();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to update attendance');
        }
    };

    const getMealStatus = (mealType: MealType): AttendanceStatus | null => {
        const meal = meals?.find((m) => m.meal_type === mealType);
        if (!meal) return null;
        const myAttendance = meal.attendances.find((a) => a.user_id === user?.id);
        return myAttendance?.status || null;
    };

    if (!currentGroup) {
        return (
            <SafeAreaView className="flex-1 bg-dark-950">
                <EmptyState icon="restaurant-outline" title="No Group Selected" message="Select a group first to track meals." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-dark-950">
            <View className="px-5 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">Meal Tracker</Text>
                <Text className="text-dark-400 text-sm mt-1">{currentGroup.name} • Today</Text>
            </View>

            <ScrollView
                className="flex-1 px-5"
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366F1" />}
            >
                {isLoading ? (
                    <LoadingSkeleton count={3} />
                ) : (
                    <>
                        {/* My Meal Status */}
                        <Animated.View entering={FadeInDown.duration(400)} className="mb-6">
                            <Text className="text-dark-300 text-sm font-medium mb-3">Your Attendance</Text>
                            <View className="flex-row gap-3">
                                {MEAL_TYPES.map((mealConfig, i) => {
                                    const status = getMealStatus(mealConfig.key as MealType);
                                    const isAte = status === 'ate';
                                    const isSkipped = status === 'skipped';

                                    return (
                                        <Animated.View key={mealConfig.key} entering={FadeInDown.delay(i * 100).duration(400)} className="flex-1">
                                            <TouchableOpacity
                                                onPress={() => ensureMealAndToggle(mealConfig.key as MealType, status)}
                                                className={`rounded-2xl p-4 items-center border ${isAte ? 'bg-green-900/30 border-green-700' :
                                                        isSkipped ? 'bg-red-900/30 border-red-700' :
                                                            'bg-dark-800 border-dark-700'
                                                    }`}
                                                activeOpacity={0.7}
                                            >
                                                <View
                                                    style={{ backgroundColor: mealConfig.color + '20' }}
                                                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                                                >
                                                    <Ionicons name={mealConfig.icon as any} size={24} color={mealConfig.color} />
                                                </View>
                                                <Text className="text-white text-sm font-semibold">{mealConfig.label}</Text>
                                                <View className="mt-2 flex-row items-center">
                                                    <Ionicons
                                                        name={isAte ? 'checkmark-circle' : isSkipped ? 'close-circle' : 'help-circle'}
                                                        size={16}
                                                        color={isAte ? '#10B981' : isSkipped ? '#EF4444' : '#475569'}
                                                    />
                                                    <Text className={`text-xs ml-1 font-medium ${isAte ? 'text-green-400' : isSkipped ? 'text-red-400' : 'text-dark-500'
                                                        }`}>
                                                        {isAte ? 'Ate' : isSkipped ? 'Skipped' : 'Tap to mark'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </Animated.View>

                        {/* Group Attendance Summary */}
                        <Text className="text-dark-300 text-sm font-medium mb-3">Group Attendance</Text>
                        {meals && meals.length > 0 ? (
                            meals.map((meal, i) => {
                                const mealConfig = MEAL_TYPES.find((m) => m.key === meal.meal_type);
                                const ateCount = meal.attendances.filter((a) => a.status === 'ate').length;
                                const skippedCount = meal.attendances.filter((a) => a.status === 'skipped').length;

                                return (
                                    <Card key={meal.id} delay={i * 100}>
                                        <View className="flex-row items-center mb-3">
                                            <Ionicons name={mealConfig?.icon as any || 'restaurant'} size={20} color={mealConfig?.color || '#6366F1'} />
                                            <Text className="text-white text-base font-semibold ml-2 capitalize">{meal.meal_type}</Text>
                                            <View className="flex-row ml-auto">
                                                <View className="bg-green-900/30 px-2 py-0.5 rounded-full mr-1">
                                                    <Text className="text-green-400 text-xs">{ateCount} Ate</Text>
                                                </View>
                                                <View className="bg-red-900/30 px-2 py-0.5 rounded-full">
                                                    <Text className="text-red-400 text-xs">{skippedCount} Skipped</Text>
                                                </View>
                                            </View>
                                        </View>
                                        {meal.attendances.map((att) => (
                                            <View key={att.id} className="flex-row items-center py-1.5 border-t border-dark-700">
                                                <Avatar name={att.user?.name || 'U'} size={24} />
                                                <Text className="text-dark-300 text-sm ml-2 flex-1">{att.user?.name || 'Unknown'}</Text>
                                                <Ionicons
                                                    name={att.status === 'ate' ? 'checkmark-circle' : 'close-circle'}
                                                    size={18}
                                                    color={att.status === 'ate' ? '#10B981' : '#EF4444'}
                                                />
                                            </View>
                                        ))}
                                    </Card>
                                );
                            })
                        ) : (
                            <Card>
                                <Text className="text-dark-400 text-center text-sm">No meals tracked today. Tap above to mark your attendance!</Text>
                            </Card>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
