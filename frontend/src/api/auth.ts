import { apiRequest } from './client';
import type { TokenResponse, RegisterRequest, LoginRequest, User } from '../types';

export async function login(data: LoginRequest): Promise<TokenResponse> {
    return apiRequest<TokenResponse>('/auth/login', {
        method: 'POST',
        body: data,
        authenticated: false,
    });
}

export async function register(data: RegisterRequest): Promise<User> {
    return apiRequest<User>('/auth/register', {
        method: 'POST',
        body: data,
        authenticated: false,
    });
}

export async function refreshToken(refresh_token: string): Promise<TokenResponse> {
    return apiRequest<TokenResponse>('/auth/refresh', {
        method: 'POST',
        body: { refresh_token },
        authenticated: false,
    });
}

export async function logout(): Promise<void> {
    await apiRequest('/auth/logout', { method: 'POST' });
}

export async function changePassword(old_password: string, new_password: string): Promise<void> {
    await apiRequest('/auth/change-password', {
        method: 'POST',
        body: { old_password, new_password },
    });
}

export async function getCurrentUser(): Promise<User> {
    return apiRequest<User>('/users/me');
}
