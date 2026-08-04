import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Utensils,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import { useAuth } from '@/src/context/AuthContext';
import { getMealsByDate, updateAttendance, createMeal } from '@/src/api/meals';
import { colors } from '@/constants/theme';
import { capitalize } from '@/lib/utils';
import { MealCard } from '@/components/ui/MealCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Meal, MealType, AttendanceStatus } from '@/src/types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export default function MealsScreen() {
    const { user, activeGroupId } = useAuth();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [creatingMeal, setCreatingMeal] = useState<MealType | null>(null);

    const dateStr = selectedDate.format('YYYY-MM-DD');

    const fetchMeals = useCallback(async () => {
        if (!activeGroupId) {
            setLoading(false);
            return;
        }
        try {
            const result = await getMealsByDate(activeGroupId, dateStr);
            setMeals(result);
        } catch (e) {
            console.warn('Meals fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [activeGroupId, dateStr]);

    useEffect(() => {
        setLoading(true);
        fetchMeals();
    }, [fetchMeals]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchMeals();
        setRefreshing(false);
    }, [fetchMeals]);

    const handleAttendance = async (mealId: number, status: AttendanceStatus) => {
        try {
            await updateAttendance(mealId, status);
            await fetchMeals();
        } catch (e) {
            console.warn('Attendance update error:', e);
        }
    };

    const handleCreateMeal = async (mealType: MealType) => {
        if (!activeGroupId) return;
        setCreatingMeal(mealType);
        try {
            await createMeal({
                group_id: activeGroupId,
                meal_type: mealType,
                date: dateStr,
            });
            await fetchMeals();
        } catch (e) {
            console.warn('Create meal error:', e);
        } finally {
            setCreatingMeal(null);
        }
    };

    // Generate date range: 3 days before + today + 3 days after
    const dateRange = Array.from({ length: 7 }, (_, i) =>
        dayjs().subtract(3, 'day').add(i, 'day')
    );

    const existingTypes = new Set(meals.map((m) => m.meal_type));

    return (
        <SafeAreaView className="screen" edges={['top']}>
            {/* Header */}
            <View className="app-bar">
                <Text className="app-bar-title">Meals</Text>
            </View>

            {/* Date Selector */}
            <View className="px-5 mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2"
                >
                    {dateRange.map((date) => {
                        const isToday = date.isSame(dayjs(), 'day');
                        const isSelected = date.isSame(selectedDate, 'day');
                        return (
                            <Pressable
                                key={date.format('YYYY-MM-DD')}
                                onPress={() => setSelectedDate(date)}
                                className={`items-center py-2.5 px-4 rounded-xl ${isSelected
                                        ? 'bg-primary'
                                        : 'border border-border'
                                    }`}
                            >
                                <Text
                                    className={`text-[10px] font-sans-semibold ${isSelected
                                            ? 'text-white'
                                            : 'text-muted-foreground'
                                        }`}
                                >
                                    {isToday
                                        ? 'TODAY'
                                        : date.format('ddd').toUpperCase()}
                                </Text>
                                <Text
                                    className={`text-lg font-sans-bold mt-0.5 ${isSelected ? 'text-white' : 'text-primary'
                                        }`}
                                >
                                    {date.format('DD')}
                                </Text>
                                <Text
                                    className={`text-[10px] font-sans-medium ${isSelected
                                            ? 'text-white opacity-60'
                                            : 'text-muted-foreground'
                                        }`}
                                >
                                    {date.format('MMM')}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

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
                {loading ? (
                    <View className="gap-4">
                        {[1, 2, 3].map((i) => (
                            <LoadingSkeleton key={i} height={120} />
                        ))}
                    </View>
                ) : (
                    <>
                        {/* Existing Meals */}
                        <View className="gap-4">
                            {meals.map((meal) => (
                                <MealCard
                                    key={meal.id}
                                    meal={meal}
                                    currentUserId={user?.id}
                                    onUpdateAttendance={handleAttendance}
                                />
                            ))}
                        </View>

                        {/* Create Missing Meals */}
                        {MEAL_TYPES.filter((t) => !existingTypes.has(t)).length >
                            0 && (
                                <View className="mt-6">
                                    <Text className="text-sm font-sans-bold text-primary mb-3">
                                        Create Meal
                                    </Text>
                                    <View className="gap-3">
                                        {MEAL_TYPES.filter(
                                            (t) => !existingTypes.has(t)
                                        ).map((type) => (
                                            <Pressable
                                                key={type}
                                                onPress={() =>
                                                    handleCreateMeal(type)
                                                }
                                                className="flex-row items-center justify-between rounded-xl border border-dashed border-border p-4"
                                            >
                                                <View className="flex-row items-center gap-3">
                                                    <View className="w-9 h-9 rounded-lg bg-muted items-center justify-center">
                                                        <Utensils
                                                            size={16}
                                                            color={
                                                                colors.mutedForeground
                                                            }
                                                        />
                                                    </View>
                                                    <Text className="text-sm font-sans-semibold text-primary">
                                                        {capitalize(type)}
                                                    </Text>
                                                </View>
                                                <View className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                                                    <Plus
                                                        size={14}
                                                        color={colors.primary}
                                                    />
                                                </View>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            )}

                        {meals.length === 0 &&
                            MEAL_TYPES.filter((t) => !existingTypes.has(t))
                                .length === 0 && (
                                <EmptyState
                                    icon={
                                        <Utensils
                                            size={24}
                                            color={colors.mutedForeground}
                                        />
                                    }
                                    title="No meals for this day"
                                    description="Create a meal to start tracking attendance"
                                />
                            )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
