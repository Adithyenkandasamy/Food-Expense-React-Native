import { apiRequest } from './client';
import type { Settlement } from '../types';

export async function listSettlements(groupId: number): Promise<Settlement[]> {
    return apiRequest<Settlement[]>(`/settlements?group_id=${groupId}`);
}

export async function getSettlement(id: number): Promise<Settlement> {
    return apiRequest<Settlement>(`/settlements/${id}`);
}

export async function createSettlement(data: {
    group_id: number;
    month: number;
    year: number;
}): Promise<Settlement> {
    return apiRequest<Settlement>('/settlements', { method: 'POST', body: data });
}

export async function closeSettlement(id: number): Promise<Settlement> {
    return apiRequest<Settlement>(`/settlements/${id}/close`, { method: 'PUT' });
}
