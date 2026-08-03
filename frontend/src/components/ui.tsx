/**
 * MessMate - Reusable UI Components
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    type TouchableOpacityProps,
    type TextInputProps,
    type ViewProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

// ==================== Card ====================
interface CardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export function Card({ children, className = '', delay = 0, ...props }: CardProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(400)}
            className={`bg-dark-800 rounded-2xl p-4 mb-3 border border-dark-700 ${className}`}
            {...props}
        >
            {children}
        </Animated.View>
    );
}

// ==================== Button ====================
interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function Button({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const variantStyles = {
        primary: 'bg-primary-600 active:bg-primary-700',
        secondary: 'bg-dark-700 active:bg-dark-600 border border-dark-600',
        danger: 'bg-red-600 active:bg-red-700',
        ghost: 'bg-transparent',
    };

    const textStyles = {
        primary: 'text-white',
        secondary: 'text-dark-200',
        danger: 'text-white',
        ghost: 'text-primary-400',
    };

    const sizeStyles = {
        sm: 'px-3 py-2',
        md: 'px-5 py-3',
        lg: 'px-6 py-4',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <TouchableOpacity
            className={`rounded-xl items-center justify-center flex-row ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={20} color={variant === 'ghost' ? '#818CF8' : '#fff'} style={{ marginRight: 8 }} />}
                    <Text className={`font-semibold ${textStyles[variant]} ${textSizes[size]}`}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

// ==================== Input ====================
interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
    return (
        <View className="mb-4">
            {label && <Text className="text-dark-300 text-sm mb-1.5 font-medium">{label}</Text>}
            <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4">
                {icon && <Ionicons name={icon} size={20} color="#64748B" style={{ marginRight: 10 }} />}
                <TextInput
                    className={`flex-1 text-white py-3.5 text-base ${className}`}
                    placeholderTextColor="#475569"
                    {...props}
                />
            </View>
            {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
        </View>
    );
}

// ==================== Avatar ====================
interface AvatarProps {
    name: string;
    size?: number;
    uri?: string | null;
}

export function Avatar({ name, size = 40, uri }: AvatarProps) {
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'];
    const colorIndex = name.charCodeAt(0) % colors.length;

    return (
        <View
            style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors[colorIndex] }}
            className="items-center justify-center"
        >
            <Text style={{ fontSize: size * 0.4 }} className="text-white font-bold">{initials}</Text>
        </View>
    );
}

// ==================== Empty State ====================
interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    message: string;
    action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
    return (
        <Animated.View entering={FadeIn.duration(400)} className="items-center justify-center py-16 px-8">
            <View className="bg-dark-800 rounded-full p-5 mb-4">
                <Ionicons name={icon} size={48} color="#475569" />
            </View>
            <Text className="text-dark-200 text-lg font-semibold mb-2">{title}</Text>
            <Text className="text-dark-400 text-center text-sm mb-4">{message}</Text>
            {action && (
                <Button title={action.label} onPress={action.onPress} size="sm" />
            )}
        </Animated.View>
    );
}

// ==================== Loading Skeleton ====================
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
    return (
        <View className="px-4">
            {Array.from({ length: count }).map((_, i) => (
                <Animated.View
                    key={i}
                    entering={FadeIn.delay(i * 100).duration(300)}
                    className="bg-dark-800 rounded-2xl p-4 mb-3 border border-dark-700"
                >
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 rounded-full bg-dark-700" />
                        <View className="ml-3 flex-1">
                            <View className="w-32 h-4 rounded bg-dark-700 mb-2" />
                            <View className="w-20 h-3 rounded bg-dark-700" />
                        </View>
                        <View className="w-16 h-5 rounded bg-dark-700" />
                    </View>
                    <View className="w-full h-3 rounded bg-dark-700" />
                </Animated.View>
            ))}
        </View>
    );
}

// ==================== Floating Action Button ====================
interface FABProps {
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
}

export function FAB({ icon = 'add', onPress }: FABProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 items-center justify-center shadow-lg"
            style={{ elevation: 6 }}
        >
            <Ionicons name={icon} size={28} color="#fff" />
        </TouchableOpacity>
    );
}

// ==================== Section Header ====================
export function SectionHeader({ title, action }: { title: string; action?: { label: string; onPress: () => void } }) {
    return (
        <View className="flex-row items-center justify-between mb-3 px-1">
            <Text className="text-dark-200 text-lg font-semibold">{title}</Text>
            {action && (
                <TouchableOpacity onPress={action.onPress}>
                    <Text className="text-primary-400 text-sm font-medium">{action.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ==================== Badge ====================
export function Badge({ label, color = '#6366F1' }: { label: string; color?: string }) {
    return (
        <View style={{ backgroundColor: color + '20' }} className="px-2.5 py-1 rounded-full">
            <Text style={{ color }} className="text-xs font-semibold">{label}</Text>
        </View>
    );
}

// ==================== Stat Card ====================
export function StatCard({
    icon, label, value, color = '#6366F1', delay = 0,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    color?: string;
    delay?: number;
}) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(400)}
            className="bg-dark-800 rounded-2xl p-4 flex-1 border border-dark-700"
        >
            <View style={{ backgroundColor: color + '20' }} className="w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text className="text-dark-400 text-xs mb-0.5">{label}</Text>
            <Text className="text-white text-lg font-bold">{value}</Text>
        </Animated.View>
    );
}
