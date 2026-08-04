import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface LoadingSkeletonProps {
    width?: number | string;
    height?: number;
    rounded?: boolean;
    style?: object;
}

export function LoadingSkeleton({
    width = '100%',
    height = 20,
    rounded = false,
    style,
}: LoadingSkeletonProps) {
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.4, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    backgroundColor: '#F4F4F5',
                    borderRadius: rounded ? 9999 : 8,
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

export function ExpenseCardSkeleton() {
    return (
        <View className="expense-card mb-3">
            <LoadingSkeleton width={40} height={40} rounded />
            <View className="flex-1 ml-3 gap-2">
                <LoadingSkeleton width="60%" height={14} />
                <LoadingSkeleton width="40%" height={11} />
            </View>
            <LoadingSkeleton width={60} height={14} />
        </View>
    );
}

export function DashboardSkeleton() {
    return (
        <View className="px-5 gap-5 mt-4">
            <LoadingSkeleton height={140} />
            <View className="flex-row gap-3">
                <LoadingSkeleton height={48} style={{ flex: 1 }} />
                <LoadingSkeleton height={48} style={{ flex: 1 }} />
                <LoadingSkeleton height={48} style={{ flex: 1 }} />
            </View>
            <View className="flex-row gap-3">
                <LoadingSkeleton height={80} style={{ flex: 1 }} />
                <LoadingSkeleton height={80} style={{ flex: 1 }} />
            </View>
            {[1, 2, 3].map((i) => (
                <ExpenseCardSkeleton key={i} />
            ))}
        </View>
    );
}

export function SettlementCardSkeleton() {
    return (
        <View className="settlement-card mb-3 gap-3">
            <View className="flex-row items-center justify-between">
                <LoadingSkeleton width="40%" height={16} />
                <LoadingSkeleton width={60} height={24} rounded />
            </View>
            <View className="flex-row gap-4">
                <LoadingSkeleton width="30%" height={12} />
                <LoadingSkeleton width="30%" height={12} />
            </View>
        </View>
    );
}
