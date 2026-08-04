import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Utensils } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import { capitalize } from '@/lib/utils';
import type { Meal, AttendanceStatus } from '@/src/types';

interface MealCardProps {
    meal: Meal;
    currentUserId?: number;
    onUpdateAttendance?: (mealId: number, status: AttendanceStatus) => void;
}

export function MealCard({ meal, currentUserId, onUpdateAttendance }: MealCardProps) {
    const userAttendance = meal.attendances.find((a) => a.user_id === currentUserId);
    const ateCount = meal.attendances.filter((a) => a.status === 'ate').length;

    return (
        <View className="meal-card">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Utensils size={16} color={colors.primary} />
                    <Text className="text-sm font-sans-bold text-primary">
                        {capitalize(meal.meal_type)}
                    </Text>
                </View>
                <Text className="text-xs font-sans-medium text-muted-foreground">
                    {ateCount} attending
                </Text>
            </View>

            <View className="flex-row gap-3">
                <Pressable
                    className={`meal-action-ate flex-1 ${userAttendance?.status === 'ate' ? 'meal-action-active' : ''
                        }`}
                    onPress={() => onUpdateAttendance?.(meal.id, 'ate')}
                >
                    <Text
                        className={`text-sm font-sans-semibold ${userAttendance?.status === 'ate'
                                ? 'text-success'
                                : 'text-muted-foreground'
                            }`}
                    >
                        Ate
                    </Text>
                </Pressable>
                <Pressable
                    className={`meal-action-skip flex-1 ${userAttendance?.status === 'skip' ? 'meal-action-active' : ''
                        }`}
                    onPress={() => onUpdateAttendance?.(meal.id, 'skip')}
                >
                    <Text
                        className={`text-sm font-sans-semibold ${userAttendance?.status === 'skip'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                            }`}
                    >
                        Skip
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
