/**
 * MessMate - Axios API Client
 * Handles token injection, refresh, and error handling.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and auto-refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
                if (!refreshToken) throw new Error('No refresh token');

                const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
                    refresh_token: refreshToken,
                });

                await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
                await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
                }
                return apiClient(originalRequest);
            } catch {
                // Refresh failed — clear tokens and redirect to login
                await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
                // The auth store will detect missing tokens and redirect
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
