import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, BarChart3 } from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import {
    listSettlements,
    createSettlement,
    closeSettlement,
} from '@/src/api/settlements';
import { colors } from '@/constants/theme';
import { getMonthName, formatCurrency } from '@/lib/utils';
import { SettlementCard, SettlementCardSkeleton } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import type { Settlement } from '@/src/types';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
}));

export default function SettlementsScreen() {
    const { activeGroupId } = useAuth();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Create sheet
    const [sheetVisible, setSheetVisible] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [creating, setCreating] = useState(false);

    // Close dialog
    const [closeDialogVisible, setCloseDialogVisible] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
    const [closing, setClosing] = useState(false);

    // Detail view
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchSettlements = useCallback(async () => {
        if (!activeGroupId) {
            setLoading(false);
            return;
        }
        try {
            const result = await listSettlements(activeGroupId);
            setSettlements(result);
        } catch (e) {
            console.warn('Settlements fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [activeGroupId]);

    useEffect(() => {
        fetchSettlements();
    }, [fetchSettlements]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSettlements();
        setRefreshing(false);
    }, [fetchSettlements]);

    const handleCreate = async () => {
        if (!activeGroupId) return;
        setCreating(true);
        try {
            await createSettlement({
                group_id: activeGroupId,
                month: selectedMonth,
                year: selectedYear,
            });
            setSheetVisible(false);
            await fetchSettlements();
        } catch (e) {
            console.warn('Create settlement error:', e);
        } finally {
            setCreating(false);
        }
    };

    const handleClose = async () => {
        if (!selectedSettlement) return;
        setClosing(true);
        try {
            await closeSettlement(selectedSettlement.id);
            setCloseDialogVisible(false);
            setSelectedSettlement(null);
            await fetchSettlements();
        } catch (e) {
            console.warn('Close settlement error:', e);
        } finally {
            setClosing(false);
        }
    };

    const handleSettlementPress = (settlement: Settlement) => {
        if (settlement.status === 'pending') {
            setSelectedSettlement(settlement);
            setCloseDialogVisible(true);
        } else {
            setExpandedId(expandedId === settlement.id ? null : settlement.id);
        }
    };

    return (
        <SafeAreaView className="screen" edges={['top']}>
            {/* Header */}
            <View className="app-bar">
                <Text className="app-bar-title">Settlements</Text>
                <Pressable
                    className="app-bar-action"
                    onPress={() => setSheetVisible(true)}
                >
                    <Plus size={18} color={colors.primary} />
                </Pressable>
            </View>

            {loading ? (
                <View className="px-5 gap-3">
                    {[1, 2, 3].map((i) => (
                        <SettlementCardSkeleton key={i} />
                    ))}
                </View>
            ) : (
                <FlatList
                    data={settlements}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerClassName="px-5 pb-30 gap-3"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    renderItem={({ item }) => (
                        <View>
                            <SettlementCard
                                settlement={item}
                                onPress={() => handleSettlementPress(item)}
                            />
                            {/* Expanded Member Details */}
                            {expandedId === item.id &&
                                item.member_details &&
                                item.member_details.length > 0 && (
                                    <View className="mt-1 rounded-xl border border-border bg-muted/50 p-4 gap-3">
                                        {item.member_details.map((member) => (
                                            <View
                                                key={member.user_id}
                                                className="flex-row items-center justify-between"
                                            >
                                                <View>
                                                    <Text className="text-sm font-sans-semibold text-primary">
                                                        {member.name}
                                                    </Text>
                                                    <Text className="text-[10px] font-sans-medium text-muted-foreground mt-0.5">
                                                        {member.meals_count} meals
                                                    </Text>
                                                </View>
                                                <Text
                                                    className={`text-sm font-sans-bold ${member.net_balance >= 0
                                                            ? 'text-success'
                                                            : 'text-danger'
                                                        }`}
                                                >
                                                    {member.net_balance >= 0
                                                        ? '+'
                                                        : ''}
                                                    {formatCurrency(
                                                        member.net_balance
                                                    )}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                        </View>
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            icon={
                                <BarChart3
                                    size={24}
                                    color={colors.mutedForeground}
                                />
                            }
                            title="No settlements"
                            description="Create a settlement to reconcile expenses"
                            actionLabel="Create Settlement"
                            onAction={() => setSheetVisible(true)}
                        />
                    }
                />
            )}

            {/* Create Settlement Sheet */}
            <BottomSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                title="Create Settlement"
            >
                <View>
                    <Text className="field-label">Month</Text>
                    <View className="flex-row flex-wrap gap-2 mt-1.5">
                        {MONTHS.map((m) => {
                            const isActive = selectedMonth === m.value;
                            return (
                                <Pressable
                                    key={m.value}
                                    onPress={() => setSelectedMonth(m.value)}
                                    className={`chip ${isActive ? 'chip-active' : ''
                                        }`}
                                >
                                    <Text
                                        className={`chip-text ${isActive ? 'chip-text-active' : ''
                                            }`}
                                    >
                                        {m.label.slice(0, 3)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View>
                    <Text className="field-label">Year</Text>
                    <View className="flex-row gap-2 mt-1.5">
                        {[
                            new Date().getFullYear() - 1,
                            new Date().getFullYear(),
                            new Date().getFullYear() + 1,
                        ].map((y) => {
                            const isActive = selectedYear === y;
                            return (
                                <Pressable
                                    key={y}
                                    onPress={() => setSelectedYear(y)}
                                    className={`chip ${isActive ? 'chip-active' : ''
                                        }`}
                                >
                                    <Text
                                        className={`chip-text ${isActive ? 'chip-text-active' : ''
                                            }`}
                                    >
                                        {y}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <PrimaryButton
                    label="Create Settlement"
                    onPress={handleCreate}
                    loading={creating}
                />
            </BottomSheet>

            {/* Close Settlement Dialog */}
            <ConfirmationDialog
                visible={closeDialogVisible}
                title="Close Settlement"
                description={`Close the settlement for ${selectedSettlement
                        ? `${getMonthName(selectedSettlement.month)} ${selectedSettlement.year}`
                        : ''
                    }? This cannot be undone.`}
                confirmLabel="Close"
                destructive
                loading={closing}
                onConfirm={handleClose}
                onCancel={() => {
                    setCloseDialogVisible(false);
                    setSelectedSettlement(null);
                }}
            />
        </SafeAreaView>
    );
}
