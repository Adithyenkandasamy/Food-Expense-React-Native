import { apiRequest } from './client';
import type { Expense, ExpenseCreate } from '../types';

export async function listExpenses(params: {
    group_id: number;
    page?: number;
    page_size?: number;
    category?: string;
    month?: number;
    year?: number;
}): Promise<Expense[]> {
    const q = new URLSearchParams();
    q.set('group_id', String(params.group_id));
    if (params.page) q.set('page', String(params.page));
    if (params.page_size) q.set('page_size', String(params.page_size));
    if (params.category) q.set('category', params.category);
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    return apiRequest<Expense[]>(`/expenses?${q.toString()}`);
}

export async function getExpense(id: number): Promise<Expense> {
    return apiRequest<Expense>(`/expenses/${id}`);
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
    return apiRequest<Expense>('/expenses', { method: 'POST', body: data });
}

export async function updateExpense(id: number, data: Partial<ExpenseCreate>): Promise<Expense> {
    return apiRequest<Expense>(`/expenses/${id}`, { method: 'PUT', body: data });
}

export async function deleteExpense(id: number): Promise<void> {
    await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
}
