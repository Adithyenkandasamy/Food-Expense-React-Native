import { apiRequest } from './client';
import type { Group, GroupDetail, GroupMember } from '../types';

export async function listGroups(): Promise<Group[]> {
    return apiRequest<Group[]>('/groups');
}

export async function getGroup(groupId: number): Promise<GroupDetail> {
    return apiRequest<GroupDetail>(`/groups/${groupId}`);
}

export async function createGroup(data: { name: string; description?: string }): Promise<Group> {
    return apiRequest<Group>('/groups', { method: 'POST', body: data });
}

export async function addMember(groupId: number, email: string): Promise<GroupMember> {
    return apiRequest<GroupMember>(`/groups/${groupId}/members`, {
        method: 'POST',
        body: { email },
    });
}

export async function removeMember(groupId: number, userId: number): Promise<void> {
    await apiRequest(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
}
