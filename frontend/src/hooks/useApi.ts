/**
 * MessMate - TanStack Query Hooks
 * Custom hooks wrapping API calls with caching and invalidation.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    dashboardApi, groupsApi, expensesApi, contributionsApi,
    mealsApi, settlementsApi,
} from '../api/services';
import { useGroupStore } from '../store';
import type { CreateExpenseRequest, CreateContributionRequest, CreateMealRequest } from '../types';

// ==================== Dashboard ====================
export function useDashboard(groupId: number | undefined) {
    return useQuery({
        queryKey: ['dashboard', groupId],
        queryFn: () => dashboardApi.get(groupId!).then((r) => r.data),
        enabled: !!groupId,
    });
}

// ==================== Groups ====================
export function useGroups() {
    return useQuery({
        queryKey: ['groups'],
        queryFn: () => groupsApi.list().then((r) => r.data),
    });
}

export function useGroupDetail(groupId: number | undefined) {
    return useQuery({
        queryKey: ['group', groupId],
        queryFn: () => groupsApi.get(groupId!).then((r) => r.data),
        enabled: !!groupId,
    });
}

export function useCreateGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: groupsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
    });
}

export function useJoinGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: groupsApi.join,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
    });
}

// ==================== Expenses ====================
export function useExpenses(groupId: number | undefined, params?: { category?: string; month?: number; year?: number }) {
    return useQuery({
        queryKey: ['expenses', groupId, params],
        queryFn: () => expensesApi.list(groupId!, params).then((r) => r.data),
        enabled: !!groupId,
    });
}

export function useExpenseDetail(expenseId: number | undefined) {
    return useQuery({
        queryKey: ['expense', expenseId],
        queryFn: () => expensesApi.get(expenseId!).then((r) => r.data),
        enabled: !!expenseId,
    });
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateExpenseRequest) => expensesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => expensesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// ==================== Contributions ====================
export function useContributions(groupId: number | undefined) {
    return useQuery({
        queryKey: ['contributions', groupId],
        queryFn: () => contributionsApi.list(groupId!).then((r) => r.data),
        enabled: !!groupId,
    });
}

export function useCreateContribution() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateContributionRequest) => contributionsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// ==================== Meals ====================
export function useMeals(groupId: number | undefined, date?: string) {
    return useQuery({
        queryKey: ['meals', groupId, date],
        queryFn: () => mealsApi.list(groupId!, { date }).then((r) => r.data),
        enabled: !!groupId,
    });
}

export function useCreateMeal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMealRequest) => mealsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ mealId, status }: { mealId: number; status: string }) =>
            mealsApi.updateMyAttendance(mealId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// ==================== Settlements ====================
export function useSettlements(groupId: number | undefined) {
    return useQuery({
        queryKey: ['settlements', groupId],
        queryFn: () => settlementsApi.list(groupId!).then((r) => r.data),
        enabled: !!groupId,
    });
}

export function useCreateSettlement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: settlementsApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settlements'] }),
    });
}

export function useCloseSettlement() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => settlementsApi.close(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settlements'] }),
    });
}
