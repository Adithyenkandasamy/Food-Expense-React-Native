import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const ACCESS_TOKEN_KEY = 'messmate_access_token';
export const REFRESH_TOKEN_KEY = 'messmate_refresh_token';

async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

type RequestOptions = {
    method?: string;
    body?: unknown;
    authenticated?: boolean;
};

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = 'GET', body, authenticated = true } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (authenticated) {
        const token = await getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
            const error = await response.json();
            errorMessage = error.detail || error.message || errorMessage;
        } catch {
            // ignore parse error
        }
        throw new Error(errorMessage);
    }

    const text = await response.text();
    if (!text) return {} as T;
    return JSON.parse(text) as T;
}
