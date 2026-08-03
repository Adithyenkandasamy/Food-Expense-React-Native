/**
 * MessMate - TypeScript Type Definitions
 */

// ==================== User ====================
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    unique_user_id: string;
    created_at: string;
}

export interface UserBrief {
    id: number;
    name: string;
    unique_user_id: string;
    avatar: string | null;
}

// ==================== Auth ====================
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone?: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

// ==================== Group ====================
export interface Group {
    id: number;
    name: string;
    description: string | null;
    invite_code: string;
    created_by: number;
    created_at: string;
    member_count: number;
}

export interface GroupDetail extends Omit<Group, 'member_count'> {
    members: GroupMember[];
}

export interface GroupMember {
    id: number;
    user_id: number;
    role: 'admin' | 'member';
    joined_at: string;
    user: UserBrief;
}

export interface CreateGroupRequest {
    name: string;
    description?: string;
}

export interface JoinGroupRequest {
    invite_code: string;
}

// ==================== Expense ====================
export type ExpenseCategory =
    | 'groceries'
    | 'milk'
    | 'vegetables'
    | 'gas'
    | 'cleaning'
    | 'snacks'
    | 'others';

export interface ExpenseItem {
    id?: number;
    item_name: string;
    quantity: number;
    unit: string | null;
    price: number;
    subtotal: number;
}

export interface Expense {
    id: number;
    group_id: number;
    paid_by: number;
    category: ExpenseCategory;
    title: string;
    description: string | null;
    date: string;
    total_amount: number;
    created_at: string;
    payer: UserBrief;
    items: ExpenseItem[];
}

export interface ExpenseListItem extends Omit<Expense, 'items' | 'description'> { }

export interface CreateExpenseRequest {
    group_id: number;
    category: ExpenseCategory;
    title: string;
    description?: string;
    date: string;
    total_amount: number;
    items: Omit<ExpenseItem, 'id'>[];
}

// ==================== Contribution ====================
export interface Contribution {
    id: number;
    user_id: number;
    group_id: number;
    amount: number;
    date: string;
    notes: string | null;
    created_at: string;
    user: UserBrief;
}

export interface CreateContributionRequest {
    group_id: number;
    amount: number;
    date: string;
    notes?: string;
}

// ==================== Meal ====================
export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type AttendanceStatus = 'ate' | 'skipped';

export interface MealAttendance {
    id: number;
    meal_id: number;
    user_id: number;
    status: AttendanceStatus;
    user?: UserBrief;
}

export interface Meal {
    id: number;
    group_id: number;
    date: string;
    meal_type: MealType;
    created_at: string;
    attendances: MealAttendance[];
}

export interface CreateMealRequest {
    group_id: number;
    date: string;
    meal_type: MealType;
}

// ==================== Settlement ====================
export interface SettlementMember {
    user_id: number;
    name: string;
    meals_consumed: number;
    total_paid: number;
    total_contributed: number;
    actual_share: number;
    balance: number;
}

export interface SettlementData {
    total_expense: number;
    total_meals: number;
    cost_per_meal: number;
    members: SettlementMember[];
}

export interface Settlement {
    id: number;
    group_id: number;
    month: number;
    year: number;
    status: 'pending' | 'closed';
    data: SettlementData | null;
    created_by: number;
    created_at: string;
}

// ==================== Dashboard ====================
export interface TodayMealStatus {
    meal_type: MealType;
    status: AttendanceStatus | null;
}

export interface MemberContributionSummary {
    user_id: number;
    name: string;
    total_paid: number;
    total_contributed: number;
}

export interface DashboardData {
    current_balance: number;
    monthly_expense: number;
    total_contributions: number;
    pending_settlement: boolean;
    recent_expenses: ExpenseListItem[];
    contribution_summary: MemberContributionSummary[];
    todays_meals: TodayMealStatus[];
    member_count: number;
}

// ==================== API ====================
export interface ApiError {
    detail: string;
}

export interface PaginationParams {
    page?: number;
    page_size?: number;
}
