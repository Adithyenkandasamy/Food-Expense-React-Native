import { apiRequest } from './client';
import type { DashboardData } from '../types';

export async function getDashboard(groupId: number): Promise<DashboardData> {
    return apiRequest<DashboardData>(`/dashboard/${groupId}`);
}
