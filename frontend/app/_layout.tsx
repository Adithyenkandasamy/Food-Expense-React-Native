/**
 * MessMate - Root Layout
 * Sets up providers: TanStack Query, NativeWind, SafeArea
 */
import '../global.css';
import React, { useEffect } from 'react';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 2, staleTime: 1000 * 60 * 2 },
    },
});

export default function RootLayout() {
    const { initialize, isLoading } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 bg-dark-950 items-center justify-center">
                <ActivityIndicator size="large" color="#6366F1" />
            </View>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#020617' },
                    animation: 'slide_from_right',
                }}
            />
        </QueryClientProvider>
    );
}
