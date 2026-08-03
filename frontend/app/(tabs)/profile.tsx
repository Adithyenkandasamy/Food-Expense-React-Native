/**
 * MessMate - Profile Screen
 * User profile, settings, settlement, and group management.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Button, Avatar, Input, EmptyState, SectionHeader, StatCard, LoadingSkeleton } from '../../src/components/ui';
import { useAuthStore, useGroupStore } from '../../src/store';
import { useSettlements, useCreateSettlement, useCloseSettlement, useContributions, useCreateContribution } from '../../src/hooks/useApi';
import { formatCurrency, getBalanceColor, getTodayString } from '../../src/utils/helpers';
import { MONTHS } from '../../src/constants';

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const { currentGroup, setCurrentGroup } = useGroupStore();

    // Settlement
    const { data: settlements, isLoading: loadingSettlements } = useSettlements(currentGroup?.id);
    const createSettlement = useCreateSettlement();
    const closeSettlement = useCloseSettlement();

    // Contributions
    const { data: contributions, isLoading: loadingContributions } = useContributions(currentGroup?.id);
    const createContribution = useCreateContribution();

    const [showContrib, setShowContrib] = useState(false);
    const [contribAmount, setContribAmount] = useState('');
    const [contribNotes, setContribNotes] = useState('');
    const [activeTab, setActiveTab] = useState<'profile' | 'settlement' | 'contributions'>('profile');

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/'); } },
        ]);
    };

    const handleGenerateSettlement = () => {
        if (!currentGroup) return;
        const now = new Date();
        Alert.alert(
            'Generate Settlement',
            `Generate settlement for ${MONTHS[now.getMonth()]} ${now.getFullYear()}?`,
            [
                { text: 'Cancel' },
                {
                    text: 'Generate',
                    onPress: () => createSettlement.mutate({
                        group_id: currentGroup.id,
                        month: now.getMonth() + 1,
                        year: now.getFullYear(),
                    }),
                },
            ]
        );
    };

    const handleAddContribution = async () => {
        if (!contribAmount || !currentGroup) return;
        const amt = parseFloat(contribAmount);
        if (isNaN(amt) || amt <= 0) return;

        try {
            await createContribution.mutateAsync({
                group_id: currentGroup.id,
                amount: amt,
                date: getTodayString(),
                notes: contribNotes || undefined,
            });
            setShowContrib(false);
            setContribAmount('');
            setContribNotes('');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed');
        }
    };

    const shareInvite = () => {
        if (!currentGroup) return;
        Share.share({
            message: `Join my MessMate group "${currentGroup.name}"!\n\nInvite Code: ${currentGroup.invite_code}\n\nDownload MessMate to manage meals together.`,
        });
    };

    const tabs = [
        { key: 'profile', label: 'Profile', icon: 'person' },
        { key: 'settlement', label: 'Settlement', icon: 'calculator' },
        { key: 'contributions', label: 'Money', icon: 'cash' },
    ] as const;

    return (
        <SafeAreaView className="flex-1 bg-dark-950">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Profile Header */}
                <Animated.View entering={FadeIn.duration(400)} className="items-center pt-6 pb-4">
                    <Avatar name={user?.name || 'U'} size={80} />
                    <Text className="text-white text-xl font-bold mt-3">{user?.name}</Text>
                    <Text className="text-dark-400 text-sm">{user?.email}</Text>
                    <View className="bg-primary-600/20 px-3 py-1 rounded-full mt-2">
                        <Text className="text-primary-400 text-xs font-semibold">{user?.unique_user_id}</Text>
                    </View>
                </Animated.View>

                {/* Tabs */}
                <View className="flex-row px-5 mb-4">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl mx-1 ${activeTab === tab.key ? 'bg-primary-600' : 'bg-dark-800'
                                }`}
                        >
                            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.key ? '#fff' : '#64748B'} />
                            <Text className={`text-sm font-medium ml-1.5 ${activeTab === tab.key ? 'text-white' : 'text-dark-400'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="px-5">
                    {activeTab === 'profile' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            {/* User Info */}
                            <Card>
                                <View className="flex-row items-center py-2 border-b border-dark-700">
                                    <Ionicons name="mail" size={18} color="#64748B" />
                                    <Text className="text-dark-300 text-sm ml-3">{user?.email}</Text>
                                </View>
                                <View className="flex-row items-center py-2 border-b border-dark-700">
                                    <Ionicons name="call" size={18} color="#64748B" />
                                    <Text className="text-dark-300 text-sm ml-3">{user?.phone || 'Not set'}</Text>
                                </View>
                                <View className="flex-row items-center py-2">
                                    <Ionicons name="finger-print" size={18} color="#64748B" />
                                    <Text className="text-dark-300 text-sm ml-3">{user?.unique_user_id}</Text>
                                </View>
                            </Card>

                            {/* Group Info */}
                            {currentGroup && (
                                <Card delay={100}>
                                    <SectionHeader title="Active Group" />
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <Ionicons name="people" size={20} color="#818CF8" />
                                            <Text className="text-white text-base font-semibold ml-2">{currentGroup.name}</Text>
                                        </View>
                                        <TouchableOpacity onPress={shareInvite} className="bg-primary-600/20 px-3 py-1.5 rounded-lg flex-row items-center">
                                            <Ionicons name="share-social" size={16} color="#818CF8" />
                                            <Text className="text-primary-400 text-xs ml-1">Share</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text className="text-dark-400 text-xs">Invite Code: <Text className="text-primary-300 font-mono">{currentGroup.invite_code}</Text></Text>
                                </Card>
                            )}

                            {/* Actions */}
                            <Card delay={200}>
                                <TouchableOpacity className="flex-row items-center py-3 border-b border-dark-700">
                                    <Ionicons name="create" size={20} color="#64748B" />
                                    <Text className="text-dark-200 text-sm ml-3 flex-1">Edit Profile</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center py-3 border-b border-dark-700">
                                    <Ionicons name="lock-closed" size={20} color="#64748B" />
                                    <Text className="text-dark-200 text-sm ml-3 flex-1">Change Password</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center py-3 border-b border-dark-700">
                                    <Ionicons name="moon" size={20} color="#64748B" />
                                    <Text className="text-dark-200 text-sm ml-3 flex-1">Dark Mode</Text>
                                    <View className="bg-primary-600 px-2 py-0.5 rounded-full">
                                        <Text className="text-white text-xs">On</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center py-3" onPress={handleLogout}>
                                    <Ionicons name="log-out" size={20} color="#EF4444" />
                                    <Text className="text-red-400 text-sm ml-3 flex-1">Logout</Text>
                                </TouchableOpacity>
                            </Card>
                        </Animated.View>
                    )}

                    {activeTab === 'settlement' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            {currentGroup ? (
                                <>
                                    <Button
                                        title="Generate Settlement"
                                        icon="calculator"
                                        onPress={handleGenerateSettlement}
                                        loading={createSettlement.isPending}
                                        className="mb-4"
                                    />

                                    {loadingSettlements ? (
                                        <LoadingSkeleton count={2} />
                                    ) : settlements && settlements.length > 0 ? (
                                        settlements.map((settlement, i) => (
                                            <Card key={settlement.id} delay={i * 100}>
                                                <View className="flex-row items-center justify-between mb-3">
                                                    <Text className="text-white text-base font-semibold">
                                                        {MONTHS[settlement.month - 1]} {settlement.year}
                                                    </Text>
                                                    <View className={`px-2 py-0.5 rounded-full ${settlement.status === 'pending' ? 'bg-yellow-900/30' : 'bg-green-900/30'}`}>
                                                        <Text className={`text-xs font-medium ${settlement.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                            {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {settlement.data && (
                                                    <>
                                                        <View className="flex-row justify-between mb-2 pb-2 border-b border-dark-700">
                                                            <Text className="text-dark-400 text-xs">Total: {formatCurrency(settlement.data.total_expense)}</Text>
                                                            <Text className="text-dark-400 text-xs">{settlement.data.total_meals} meals</Text>
                                                            <Text className="text-dark-400 text-xs">{formatCurrency(settlement.data.cost_per_meal)}/meal</Text>
                                                        </View>

                                                        {settlement.data.members.map((member) => (
                                                            <View key={member.user_id} className="flex-row items-center justify-between py-1.5">
                                                                <View className="flex-row items-center flex-1">
                                                                    <Avatar name={member.name} size={24} />
                                                                    <Text className="text-dark-200 text-sm ml-2">{member.name}</Text>
                                                                </View>
                                                                <Text style={{ color: getBalanceColor(member.balance) }} className="text-sm font-bold">
                                                                    {member.balance >= 0 ? `Receives ${formatCurrency(member.balance)}` : `Pays ${formatCurrency(Math.abs(member.balance))}`}
                                                                </Text>
                                                            </View>
                                                        ))}

                                                        {settlement.status === 'pending' && (
                                                            <Button
                                                                title="Close Settlement"
                                                                variant="secondary"
                                                                size="sm"
                                                                onPress={() => closeSettlement.mutate(settlement.id)}
                                                                className="mt-3"
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </Card>
                                        ))
                                    ) : (
                                        <EmptyState icon="calculator-outline" title="No Settlements" message="Generate a settlement to see who owes whom." />
                                    )}
                                </>
                            ) : (
                                <EmptyState icon="people-outline" title="No Group" message="Select a group to manage settlements." />
                            )}
                        </Animated.View>
                    )}

                    {activeTab === 'contributions' && (
                        <Animated.View entering={FadeInDown.duration(300)}>
                            {currentGroup ? (
                                <>
                                    <Button title="Add Contribution" icon="cash" onPress={() => setShowContrib(true)} className="mb-4" />

                                    {loadingContributions ? (
                                        <LoadingSkeleton count={3} />
                                    ) : contributions && contributions.length > 0 ? (
                                        contributions.map((contrib, i) => (
                                            <Card key={contrib.id} delay={i * 80}>
                                                <View className="flex-row items-center">
                                                    <Avatar name={contrib.user.name} size={36} />
                                                    <View className="flex-1 ml-3">
                                                        <Text className="text-white text-sm font-semibold">{contrib.user.name}</Text>
                                                        <Text className="text-dark-400 text-xs">{contrib.notes || 'Contribution'}</Text>
                                                    </View>
                                                    <Text className="text-green-400 text-base font-bold">{formatCurrency(contrib.amount)}</Text>
                                                </View>
                                            </Card>
                                        ))
                                    ) : (
                                        <EmptyState icon="cash-outline" title="No Contributions" message="Add a contribution when someone adds money without buying groceries." />
                                    )}
                                </>
                            ) : (
                                <EmptyState icon="people-outline" title="No Group" message="Select a group to manage contributions." />
                            )}
                        </Animated.View>
                    )}
                </View>
            </ScrollView>

            {/* Add Contribution Modal */}
            <Modal visible={showContrib} transparent animationType="slide">
                <View className="flex-1 bg-dark-950/90 justify-end">
                    <View className="bg-dark-900 rounded-t-3xl p-6 border-t border-dark-700">
                        <Text className="text-white text-xl font-bold mb-4">Add Contribution</Text>
                        <Input label="Amount (₹)" placeholder="1000" value={contribAmount} onChangeText={setContribAmount} keyboardType="numeric" icon="cash" />
                        <Input label="Notes (optional)" placeholder="For groceries..." value={contribNotes} onChangeText={setContribNotes} icon="document-text" />
                        <View className="flex-row gap-3 mt-2">
                            <Button title="Cancel" variant="secondary" onPress={() => setShowContrib(false)} className="flex-1" />
                            <Button title="Add" onPress={handleAddContribution} loading={createContribution.isPending} className="flex-1" />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
