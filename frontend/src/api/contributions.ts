import { apiRequest } from './client';
import type { Contribution, ContributionCreate } from '../types';

export async function listContributions(params: {
    group_id: number;
    month?: number;
    year?: number;
}): Promise<Contribution[]> {
    const q = new URLSearchParams();
    q.set('group_id', String(params.group_id));
    if (params.month) q.set('month', String(params.month));
    if (params.year) q.set('year', String(params.year));
    return apiRequest<Contribution[]>(`/contributions?${q.toString()}`);
}

export async function createContribution(data: ContributionCreate): Promise<Contribution> {
    return apiRequest<Contribution>('/contributions', { method: 'POST', body: data });
}

export async function deleteContribution(id: number): Promise<void> {
    await apiRequest(`/contributions/${id}`, { method: 'DELETE' });
}
