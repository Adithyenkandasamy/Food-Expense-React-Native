import { apiRequest } from './client';
import type { Meal, AttendanceStatus, MealType } from '../types';

export async function getMealsByDate(groupId: number, date: string): Promise<Meal[]> {
    return apiRequest<Meal[]>(`/meals?group_id=${groupId}&date=${date}`);
}

export async function updateAttendance(
    mealId: number,
    status: AttendanceStatus
): Promise<Meal> {
    return apiRequest<Meal>(`/meals/${mealId}/attendance`, {
        method: 'PUT',
        body: { status },
    });
}

export async function createMeal(data: {
    group_id: number;
    meal_type: MealType;
    date: string;
}): Promise<Meal> {
    return apiRequest<Meal>('/meals', { method: 'POST', body: data });
}
