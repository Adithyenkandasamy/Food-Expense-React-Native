/**
 * MessMate - Auth Store (Zustand)
 * Manages authentication state, tokens, and user data.
 */
import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Storage = {
    getItemAsync: async (key: string) => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        return await Storage.getItemAsync(key);
    },
    setItemAsync: async (key: string, value: string) => {
        if (Platform.OS === 'web') return localStorage.setItem(key, value);
        return await Storage.setItemAsync(key, value);
    },
    deleteItemAsync: async (key: string) => {
        if (Platform.OS === 'web') return localStorage.removeItem(key);
        return await Storage.deleteItemAsync(key);
    }
};

import { STORAGE_KEYS } from '../constants';
import { authApi, usersApi } from '../api/services';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    initialize: () => Promise<void>;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    initialize: async () => {
        try {
            const token = await Storage.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (token) {
                const { data: user } = await usersApi.getMe();
                set({ user, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            await Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    login: async (data) => {
        const { data: tokens } = await authApi.login(data);
        await Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
        await Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

        const { data: user } = await usersApi.getMe();
        set({ user, isAuthenticated: true });
    },

    register: async (data) => {
        await authApi.register(data);
        // Auto-login after registration
        const { data: tokens } = await authApi.login({ email: data.email, password: data.password });
        await Storage.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
        await Storage.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);

        const { data: user } = await usersApi.getMe();
        set({ user, isAuthenticated: true });
    },

    logout: async () => {
        try { await authApi.logout(); } catch { /* ignore */ }
        await Storage.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await Storage.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        set({ user: null, isAuthenticated: false });
    },

    refreshUser: async () => {
        try {
            const { data: user } = await usersApi.getMe();
            set({ user });
        } catch { /* ignore */ }
    },

    setUser: (user) => set({ user }),
}));
