/**
 * MessMate - Expenses Screen
 * List and add expenses for the current group.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, FAB, Input, EmptyState, LoadingSkeleton, Avatar, Badge } from '../../src/components/ui';
import { useExpenses, useCreateExpense, useDeleteExpense } from '../../src/hooks/useApi';
import { useGroupStore, useAuthStore } from '../../src/store';
import { formatCurrency, formatRelativeDate, getTodayString } from '../../src/utils/helpers';
import { EXPENSE_CATEGORIES } from '../../src/constants';
import type { ExpenseCategory } from '../../src/types';

export default function ExpensesScreen() {
    const currentGroup = useGroupStore((s) => s.currentGroup);
    const user = useAuthStore((s) => s.user);
    const { data: expenses, isLoading, refetch, isRefetching } = useExpenses(currentGroup?.id);
    const createExpense = useCreateExpense();
    const deleteExpense = useDeleteExpense();

    const [showAdd, setShowAdd] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>('groceries');
    const [description, setDescription] = useState('');

    // Item fields
    const [items, setItems] = useState<{ item_name: string; quantity: string; unit: string; price: string }[]>([]);

    const addItem = () => {
        setItems([...items, { item_name: '', quantity: '', unit: '', price: '' }]);
    };

    const updateItem = (index: number, field: string, value: string) => {
        const updated = [...items];
        (updated[index] as any)[field] = value;
        setItems(updated);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleAdd = async () => {
        if (!title.trim() || !amount || !currentGroup) return;

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }

        const expenseItems = items
            .filter((item) => item.item_name.trim())
            .map((item) => ({
                item_name: item.item_name.trim(),
                quantity: parseFloat(item.quantity) || 1,
                unit: item.unit || null,
                price: parseFloat(item.price) || 0,
                subtotal: (parseFloat(item.quantity) || 1) * (parseFloat(item.price) || 0),
            }));

        try {
            await createExpense.mutateAsync({
                group_id: currentGroup.id,
                category,
                title: title.trim(),
                description: description || undefined,
                date: getTodayString(),
                total_amount: parsedAmount,
                items: expenseItems,
            });
            setShowAdd(false);
            resetForm();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to add expense');
        }
    };

    const resetForm = () => {
        setTitle('');
        setAmount('');
        setCategory('groceries');
        setDescription('');
        setItems([]);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Delete Expense', 'Are you sure?', [
            { text: 'Cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteExpense.mutate(id) },
        ]);
    };

    if (!currentGroup) {
        return (
            <SafeAreaView className="flex-1 bg-dark-950">
                <EmptyState icon="receipt-outline" title="No Group Selected" message="Select a group first to view expenses." />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-dark-950">
            <View className="px-5 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">Expenses</Text>
                <Text className="text-dark-400 text-sm mt-1">{currentGroup.name}</Text>
            </View>

            <ScrollView
                className="flex-1 px-5"
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366F1" />}
            >
                {isLoading ? (
                    <LoadingSkeleton count={4} />
                ) : expenses && expenses.length > 0 ? (
                    expenses.map((expense, i) => {
                        const catConfig = EXPENSE_CATEGORIES.find((c) => c.key === expense.category);
                        return (
                            <TouchableOpacity key={expense.id} onLongPress={() => handleDelete(expense.id)} activeOpacity={0.7}>
                                <Card delay={i * 80}>
                                    <View className="flex-row items-center">
                                        <View style={{ backgroundColor: (catConfig?.color || '#6B7280') + '20' }} className="w-11 h-11 rounded-xl items-center justify-center">
                                            <Ionicons name={catConfig?.icon as any || 'cart'} size={22} color={catConfig?.color || '#6B7280'} />
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <Text className="text-white text-sm font-semibold">{expense.title}</Text>
                                            <Text className="text-dark-400 text-xs mt-0.5">
                                                {expense.payer.name} • {formatRelativeDate(expense.date)}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-white text-base font-bold">{formatCurrency(expense.total_amount)}</Text>
                                            <Badge label={expense.category} color={catConfig?.color} />
                                        </View>
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <EmptyState
                        icon="receipt-outline"
                        title="No Expenses"
                        message="Add your first expense using the + button."
                    />
                )}
            </ScrollView>

            <FAB onPress={() => setShowAdd(true)} />

            {/* Add Expense Modal */}
            <Modal visible={showAdd} transparent animationType="slide">
                <View className="flex-1 bg-dark-950/90 justify-end">
                    <ScrollView className="max-h-[85%]" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
                        <View className="bg-dark-900 rounded-t-3xl p-6 border-t border-dark-700">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white text-xl font-bold">Add Expense</Text>
                                <TouchableOpacity onPress={() => { setShowAdd(false); resetForm(); }}>
                                    <Ionicons name="close" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <Input label="Title" placeholder="What did you buy?" value={title} onChangeText={setTitle} icon="cart" />
                            <Input label="Total Amount (₹)" placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="numeric" icon="cash" />

                            {/* Category selector */}
                            <Text className="text-dark-300 text-sm mb-2 font-medium">Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                {EXPENSE_CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.key}
                                        onPress={() => setCategory(cat.key as ExpenseCategory)}
                                        className={`mr-2 px-4 py-2 rounded-xl flex-row items-center ${category === cat.key ? 'bg-primary-600' : 'bg-dark-800 border border-dark-700'
                                            }`}
                                    >
                                        <Ionicons name={cat.icon as any} size={16} color={category === cat.key ? '#fff' : cat.color} />
                                        <Text className={`ml-1.5 text-sm font-medium ${category === cat.key ? 'text-white' : 'text-dark-300'}`}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Input label="Description (optional)" placeholder="Additional notes..." value={description} onChangeText={setDescription} icon="document-text" />

                            {/* Items Section */}
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-dark-300 text-sm font-medium">Items (optional)</Text>
                                <TouchableOpacity onPress={addItem} className="flex-row items-center">
                                    <Ionicons name="add-circle" size={20} color="#818CF8" />
                                    <Text className="text-primary-400 text-sm ml-1">Add Item</Text>
                                </TouchableOpacity>
                            </View>

                            {items.map((item, idx) => (
                                <View key={idx} className="bg-dark-800 rounded-xl p-3 mb-2 border border-dark-700">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-dark-400 text-xs">Item {idx + 1}</Text>
                                        <TouchableOpacity onPress={() => removeItem(idx)}>
                                            <Ionicons name="trash" size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <TextInput
                                            className="flex-1 bg-dark-700 text-white rounded-lg px-3 py-2 text-sm"
                                            placeholder="Name"
                                            placeholderTextColor="#475569"
                                            value={item.item_name}
                                            onChangeText={(v) => updateItem(idx, 'item_name', v)}
                                        />
                                        <TextInput
                                            className="w-16 bg-dark-700 text-white rounded-lg px-3 py-2 text-sm"
                                            placeholder="Qty"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
                                            value={item.quantity}
                                            onChangeText={(v) => updateItem(idx, 'quantity', v)}
                                        />
                                        <TextInput
                                            className="w-14 bg-dark-700 text-white rounded-lg px-3 py-2 text-sm"
                                            placeholder="Unit"
                                            placeholderTextColor="#475569"
                                            value={item.unit}
                                            onChangeText={(v) => updateItem(idx, 'unit', v)}
                                        />
                                        <TextInput
                                            className="w-20 bg-dark-700 text-white rounded-lg px-3 py-2 text-sm"
                                            placeholder="Price"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
                                            value={item.price}
                                            onChangeText={(v) => updateItem(idx, 'price', v)}
                                        />
                                    </View>
                                </View>
                            ))}

                            <View className="flex-row gap-3 mt-4">
                                <Button title="Cancel" variant="secondary" onPress={() => { setShowAdd(false); resetForm(); }} className="flex-1" />
                                <Button title="Add Expense" onPress={handleAdd} loading={createExpense.isPending} className="flex-1" />
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
