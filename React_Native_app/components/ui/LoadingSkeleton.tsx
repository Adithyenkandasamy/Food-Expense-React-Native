import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

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
    const anim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [anim]);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    backgroundColor: '#F4F4F5',
                    borderRadius: rounded ? 9999 : 8,
                    opacity: anim,
                },
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
