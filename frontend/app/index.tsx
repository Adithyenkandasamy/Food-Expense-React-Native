/**
 * MessMate - Splash / Entry Point
 * Redirects to auth or main tabs based on login state.
 */
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <View className="flex-1 bg-dark-950 items-center justify-center">
                <Animated.View entering={FadeIn.duration(600)} className="items-center">
                    <View className="bg-primary-600 rounded-3xl p-4 mb-4">
                        <Ionicons name="restaurant" size={48} color="#fff" />
                    </View>
                    <Text className="text-white text-3xl font-bold">MessMate</Text>
                    <Text className="text-dark-400 text-sm mt-2">Manage meals together</Text>
                </Animated.View>
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
