import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Plus,
    Receipt,
    Calendar,
} from 'lucide-react-native';
import { useAuth } from '@/src/context/AuthContext';
import { listExpenses, createExpense } from '@/src/api/expenses';
import { colors } from '@/constants/theme';
import { formatDate } from '@/lib/utils';
import { SearchBar } from '@/components/ui/SearchBar';
import { ExpenseCard, ExpenseCardSkeleton } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Expense, ExpenseCategory } from '@/src/types';

const CATEGORIES: ExpenseCategory[] = [
    'Food',
    'Groceries',
    'Utilities',
    'Transport',
    'Entertainment',
    'Other',
];

export default function ExpensesScreen() {
    const { activeGroupId } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Add expense sheet
    const [sheetVisible, setSheetVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState<ExpenseCategory>('Food');
    const [creating, setCreating] = useState(false);

    const fetchExpenses = useCallback(async () => {
        if (!activeGroupId) {
            setLoading(false);
            return;
        }
        try {
            const result = await listExpenses({
                group_id: activeGroupId,
                category: activeCategory ?? undefined,
            });
            setExpenses(result);
        } catch (e) {
            console.warn('Expenses fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, [activeGroupId, activeCategory]);

    useEffect(() => {
        setLoading(true);
        fetchExpenses();
    }, [fetchExpenses]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchExpenses();
        setRefreshing(false);
    }, [fetchExpenses]);

    const filteredExpenses = useMemo(() => {
        if (!search.trim()) return expenses;
        const q = search.toLowerCase();
        return expenses.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.category.toLowerCase().includes(q) ||
                e.paid_by_name?.toLowerCase().includes(q)
        );
    }, [expenses, search]);

    const handleCreate = async () => {
        if (!activeGroupId || !newTitle.trim() || !newAmount.trim()) return;
        setCreating(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await createExpense({
                group_id: activeGroupId,
                title: newTitle.trim(),
                total_amount: parseFloat(newAmount),
                category: newCategory,
                date: today,
            });
            setSheetVisible(false);
            setNewTitle('');
            setNewAmount('');
            setNewCategory('Food');
            await fetchExpenses();
        } catch (e: any) {
            console.warn('Create expense error:', e);
        } finally {
            setCreating(false);
        }
    };

    return (
        <SafeAreaView className="screen" edges={['top']}>
            {/* Header */}
            <View className="app-bar">
                <Text className="app-bar-title">Expenses</Text>
            </View>

            <View className="screen-content">
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search expenses..."
                />

                {/* Category Filters */}
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerClassName="gap-2 mt-4 mb-4"
                    renderItem={({ item }) => {
                        const isActive = activeCategory === item;
                        return (
                            <Pressable
                                onPress={() =>
                                    setActiveCategory(isActive ? null : item)
                                }
                                className={`chip ${isActive ? 'chip-active' : ''}`}
                            >
                                <Text
                                    className={`chip-text ${isActive ? 'chip-text-active' : ''
                                        }`}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        );
                    }}
                />
            </View>

            {loading ? (
                <View className="px-5 gap-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <ExpenseCardSkeleton key={i} />
                    ))}
                </View>
            ) : (
                <FlatList
                    data={filteredExpenses}
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
                    renderItem={({ item }) => <ExpenseCard expense={item} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={<Receipt size={24} color={colors.mutedForeground} />}
                            title="No expenses yet"
                            description="Add your first expense to start tracking"
                        />
                    }
                />
            )}

            {/* FAB */}
            <Pressable
                className="fab"
                onPress={() => setSheetVisible(true)}
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <Plus size={24} color={colors.white} strokeWidth={2} />
            </Pressable>

            {/* Add Expense Sheet */}
            <BottomSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                title="Add Expense"
            >
                <Input
                    label="Title"
                    value={newTitle}
                    onChangeText={setNewTitle}
                    placeholder="e.g. Dinner, Groceries"
                />

                <Input
                    label="Amount"
                    value={newAmount}
                    onChangeText={setNewAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                />

                <View>
                    <Text className="field-label">Category</Text>
                    <View className="flex-row flex-wrap gap-2 mt-1.5">
                        {CATEGORIES.map((cat) => {
                            const isActive = newCategory === cat;
                            return (
                                <Pressable
                                    key={cat}
                                    onPress={() => setNewCategory(cat)}
                                    className={`chip ${isActive ? 'chip-active' : ''}`}
                                >
                                    <Text
                                        className={`chip-text ${isActive ? 'chip-text-active' : ''
                                            }`}
                                    >
                                        {cat}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <PrimaryButton
                    label="Add Expense"
                    onPress={handleCreate}
                    loading={creating}
                    disabled={!newTitle.trim() || !newAmount.trim()}
                />
            </BottomSheet>
        </SafeAreaView>
    );
}
