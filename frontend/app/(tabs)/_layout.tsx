/**
 * MessMate - Tabs Layout
 * Bottom tab navigation with modern dark design.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#6366F1',
                tabBarInactiveTintColor: '#475569',
                tabBarStyle: {
                    backgroundColor: '#0F172A',
                    borderTopColor: '#1E293B',
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="groups"
                options={{
                    title: 'Groups',
                    tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Expenses',
                    tabBarIcon: ({ color, size }) => <Ionicons name="receipt" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="meals"
                options={{
                    title: 'Meals',
                    tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
