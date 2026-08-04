import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
    ChevronRight,
    LogOut,
    Users,
    Lock,
    Info,
    Settings,
    Mail,
    Phone,
} from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/constants/theme';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    danger?: boolean;
}

function SettingsRow({ icon, label, onPress, danger = false }: SettingsRowProps) {
    return (
        <Pressable
            className="settings-row"
            onPress={onPress}
        >
            <View className="flex-row items-center gap-3">
                {icon}
                <Text
                    className={`text-sm font-sans-medium ${danger ? 'text-danger' : 'text-primary'
                        }`}
                >
                    {label}
                </Text>
            </View>
            <ChevronRight
                size={16}
                color={danger ? colors.danger : colors.mutedForeground}
            />
        </Pressable>
    );
}

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setLoggingOut(true);
        try {
            await signOut();
            router.replace('/(auth)/sign-in');
        } catch (e) {
            console.warn('Sign out error:', e);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <SafeAreaView className="screen" edges={['top']}>
            <View className="app-bar">
                <Text className="app-bar-title">Profile</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerClassName="px-5 pb-30"
                showsVerticalScrollIndicator={false}
            >
                {/* User Info */}
                <View className="items-center py-6">
                    <Avatar name={user?.name ?? 'User'} size="xl" />
                    <Text className="text-xl font-sans-bold text-primary mt-4">
                        {user?.name}
                    </Text>
                    <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                        {user?.email}
                    </Text>
                    {user?.phone && (
                        <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
                            {user.phone}
                        </Text>
                    )}
                </View>

                {/* User Info Card */}
                <View className="card-lg mb-6">
                    <View className="flex-row items-center gap-3 mb-3">
                        <Mail size={14} color={colors.mutedForeground} />
                        <View>
                            <Text className="text-[10px] font-sans-medium text-muted-foreground">
                                Email
                            </Text>
                            <Text className="text-sm font-sans-medium text-primary">
                                {user?.email}
                            </Text>
                        </View>
                    </View>
                    {user?.phone && (
                        <View className="flex-row items-center gap-3">
                            <Phone size={14} color={colors.mutedForeground} />
                            <View>
                                <Text className="text-[10px] font-sans-medium text-muted-foreground">
                                    Phone
                                </Text>
                                <Text className="text-sm font-sans-medium text-primary">
                                    {user.phone}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <View className="divider" />

                {/* Settings */}
                <Text className="text-xs font-sans-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Settings
                </Text>

                <SettingsRow
                    icon={<Users size={18} color={colors.primary} strokeWidth={1.5} />}
                    label="Group Management"
                    onPress={() => {
                        // Future: navigate to group management
                    }}
                />

                <SettingsRow
                    icon={<Lock size={18} color={colors.primary} strokeWidth={1.5} />}
                    label="Change Password"
                    onPress={() => {
                        // Future: navigate to change password
                    }}
                />

                <SettingsRow
                    icon={<Info size={18} color={colors.primary} strokeWidth={1.5} />}
                    label="About MessMate"
                    onPress={() => {
                        // Future: about screen
                    }}
                />

                <View className="mt-4" />

                <SettingsRow
                    icon={<LogOut size={18} color={colors.danger} strokeWidth={1.5} />}
                    label="Sign Out"
                    onPress={() => setLogoutDialogVisible(true)}
                    danger
                />
            </ScrollView>

            {/* Sign Out Dialog */}
            <ConfirmationDialog
                visible={logoutDialogVisible}
                title="Sign Out"
                description="Are you sure you want to sign out?"
                confirmLabel="Sign Out"
                destructive
                loading={loggingOut}
                onConfirm={handleSignOut}
                onCancel={() => setLogoutDialogVisible(false)}
            />
        </SafeAreaView>
    );
}
