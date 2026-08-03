/**
 * MessMate - API Service Layer
 * All API calls organized by domain.
 */
import apiClient from './client';
import type {
    LoginRequest, RegisterRequest, TokenResponse, ChangePasswordRequest,
    User, Group, GroupDetail, GroupMember, CreateGroupRequest, JoinGroupRequest,
    Expense, ExpenseListItem, CreateExpenseRequest,
    Contribution, CreateContributionRequest,
    Meal, CreateMealRequest,
    Settlement, DashboardData,
} from '../types';

// ==================== Auth ====================
export const authApi = {
    register: (data: RegisterRequest) =>
        apiClient.post<User>('/api/auth/register', data),

    login: (data: LoginRequest) =>
        apiClient.post<TokenResponse>('/api/auth/login', data),

    refresh: (refresh_token: string) =>
        apiClient.post<TokenResponse>('/api/auth/refresh', { refresh_token }),

    logout: () =>
        apiClient.post('/api/auth/logout'),

    changePassword: (data: ChangePasswordRequest) =>
        apiClient.post('/api/auth/change-password', data),

    forgotPassword: (email: string) =>
        apiClient.post('/api/auth/forgot-password', { email }),
};

// ==================== Users ====================
export const usersApi = {
    getMe: () =>
        apiClient.get<User>('/api/users/me'),

    updateMe: (data: Partial<User>) =>
        apiClient.put<User>('/api/users/me', data),
};

// ==================== Groups ====================
export const groupsApi = {
    list: () =>
        apiClient.get<Group[]>('/api/groups'),

    get: (id: number) =>
        apiClient.get<GroupDetail>(`/api/groups/${id}`),

    create: (data: CreateGroupRequest) =>
        apiClient.post<Group>('/api/groups', data),

    update: (id: number, data: Partial<CreateGroupRequest>) =>
        apiClient.put<Group>(`/api/groups/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/api/groups/${id}`),

    join: (data: JoinGroupRequest) =>
        apiClient.post('/api/groups/join', data),

    getMembers: (groupId: number) =>
        apiClient.get<GroupMember[]>(`/api/groups/${groupId}/members`),

    addMember: (groupId: number, unique_user_id: string) =>
        apiClient.post(`/api/groups/${groupId}/members`, { unique_user_id }),

    removeMember: (groupId: number, userId: number) =>
        apiClient.delete(`/api/groups/${groupId}/members/${userId}`),
};

// ==================== Expenses ====================
export const expensesApi = {
    list: (groupId: number, params?: { page?: number; category?: string; month?: number; year?: number }) =>
        apiClient.get<ExpenseListItem[]>('/api/expenses', { params: { group_id: groupId, ...params } }),

    get: (id: number) =>
        apiClient.get<Expense>(`/api/expenses/${id}`),

    create: (data: CreateExpenseRequest) =>
        apiClient.post<Expense>('/api/expenses', data),

    update: (id: number, data: Partial<CreateExpenseRequest>) =>
        apiClient.put<Expense>(`/api/expenses/${id}`, data),

    delete: (id: number) =>
        apiClient.delete(`/api/expenses/${id}`),
};

// ==================== Contributions ====================
export const contributionsApi = {
    list: (groupId: number, params?: { page?: number }) =>
        apiClient.get<Contribution[]>('/api/contributions', { params: { group_id: groupId, ...params } }),

    get: (id: number) =>
        apiClient.get<Contribution>(`/api/contributions/${id}`),

    create: (data: CreateContributionRequest) =>
        apiClient.post<Contribution>('/api/contributions', data),

    delete: (id: number) =>
        apiClient.delete(`/api/contributions/${id}`),
};

// ==================== Meals ====================
export const mealsApi = {
    list: (groupId: number, params?: { date?: string; start_date?: string; end_date?: string }) =>
        apiClient.get<Meal[]>('/api/meals', { params: { group_id: groupId, ...params } }),

    get: (id: number) =>
        apiClient.get<Meal>(`/api/meals/${id}`),

    create: (data: CreateMealRequest) =>
        apiClient.post<Meal>('/api/meals', data),

    setAttendance: (mealId: number, attendances: { user_id: number; status: string }[]) =>
        apiClient.post(`/api/meals/${mealId}/attendance`, { attendances }),

    updateMyAttendance: (mealId: number, status: string) =>
        apiClient.put(`/api/meals/${mealId}/attendance`, null, { params: { status } }),
};

// ==================== Settlements ====================
export const settlementsApi = {
    list: (groupId: number) =>
        apiClient.get<Settlement[]>('/api/settlements', { params: { group_id: groupId } }),

    get: (id: number) =>
        apiClient.get<Settlement>(`/api/settlements/${id}`),

    create: (data: { group_id: number; month: number; year: number }) =>
        apiClient.post<Settlement>('/api/settlements', data),

    close: (id: number) =>
        apiClient.post<Settlement>(`/api/settlements/${id}/close`),
};

// ==================== Dashboard ====================
export const dashboardApi = {
    get: (groupId: number) =>
        apiClient.get<DashboardData>(`/api/dashboard/${groupId}`),
};
