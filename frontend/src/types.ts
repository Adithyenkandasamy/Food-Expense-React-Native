// ========================
// Auth Types
// ========================
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ========================
// Group Types
// ========================
export interface Group {
    id: number;
    name: string;
    description?: string;
    created_by: number;
    created_at: string;
    member_count?: number;
}

export interface GroupMember {
    id: number;
    group_id: number;
    user_id: number;
    role: 'admin' | 'member';
    joined_at: string;
    user?: User;
}

export interface GroupDetail extends Group {
    members: GroupMember[];
}

// ========================
// Expense Types
// ========================
export interface ExpenseItem {
    id?: number;
    name: string;
    amount: number;
    quantity?: number;
}

export interface Expense {
    id: number;
    group_id: number;
    paid_by: number;
    paid_by_name?: string;
    category: string;
    title: string;
    total_amount: number;
    date: string;
    description?: string;
    items?: ExpenseItem[];
    created_at: string;
}

export interface ExpenseCreate {
    group_id: number;
    category: string;
    title: string;
    total_amount: number;
    date: string;
    description?: string;
    items?: ExpenseItem[];
}

export type ExpenseCategory =
    | 'Food'
    | 'Groceries'
    | 'Utilities'
    | 'Transport'
    | 'Entertainment'
    | 'Other';

// ========================
// Meal Types
// ========================
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type AttendanceStatus = 'ate' | 'skip' | null;

export interface MealAttendance {
    id: number;
    meal_id: number;
    user_id: number;
    status: AttendanceStatus;
    user?: User;
}

export interface Meal {
    id: number;
    group_id: number;
    meal_type: MealType;
    date: string;
    attendances: MealAttendance[];
}

// ========================
// Contribution Types
// ========================
export interface Contribution {
    id: number;
    group_id: number;
    user_id: number;
    amount: number;
    date: string;
    note?: string;
    user?: User;
}

export interface ContributionCreate {
    group_id: number;
    amount: number;
    date: string;
    note?: string;
}

// ========================
// Settlement Types
// ========================
export interface SettlementMemberDetail {
    user_id: number;
    name: string;
    total_paid: number;
    total_contributed: number;
    meals_count: number;
    meal_cost: number;
    net_balance: number;
}

export interface Settlement {
    id: number;
    group_id: number;
    month: number;
    year: number;
    status: 'pending' | 'closed';
    total_expense: number;
    total_contributions: number;
    created_by: number;
    created_at: string;
    closed_at?: string;
    member_details?: SettlementMemberDetail[];
}

// ========================
// Dashboard Types
// ========================
export interface MemberContributionSummary {
    user_id: number;
    name: string;
    total_paid: number;
    total_contributed: number;
}

export interface TodayMealStatus {
    meal_type: MealType;
    status: AttendanceStatus;
}

export interface DashboardData {
    current_balance: number;
    monthly_expense: number;
    total_contributions: number;
    pending_settlement: boolean;
    recent_expenses: Expense[];
    contribution_summary: MemberContributionSummary[];
    todays_meals: TodayMealStatus[];
    member_count: number;
}
