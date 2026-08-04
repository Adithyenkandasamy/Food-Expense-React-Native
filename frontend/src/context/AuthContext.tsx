import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/auth';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import type { User, LoginRequest, RegisterRequest, TokenResponse } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoaded: boolean;
    isSignedIn: boolean;
}

interface AuthContextValue extends AuthState {
    signIn: (data: LoginRequest) => Promise<void>;
    signUp: (data: RegisterRequest) => Promise<void>;
    signOut: () => Promise<void>;
    activeGroupId: number | null;
    setActiveGroupId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACTIVE_GROUP_KEY = 'messmate_active_group';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoaded: false,
        isSignedIn: false,
    });
    const [activeGroupId, setActiveGroupIdState] = useState<number | null>(null);

    // Restore session on mount
    useEffect(() => {
        async function restoreSession() {
            try {
                const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
                const groupStr = await SecureStore.getItemAsync(ACTIVE_GROUP_KEY);
                if (groupStr) setActiveGroupIdState(Number(groupStr));

                if (token) {
                    const user = await getCurrentUser();
                    setState({ user, token, isLoaded: true, isSignedIn: true });
                } else {
                    setState(s => ({ ...s, isLoaded: true }));
                }
            } catch {
                setState(s => ({ ...s, isLoaded: true }));
            }
        }
        restoreSession();
    }, []);

    const signIn = useCallback(async (data: LoginRequest) => {
        const tokens: TokenResponse = await apiLogin(data);
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.access_token);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refresh_token);
        const user = await getCurrentUser();
        setState({ user, token: tokens.access_token, isLoaded: true, isSignedIn: true });
    }, []);

    const signUp = useCallback(async (data: RegisterRequest) => {
        await apiRegister(data);
        // Auto sign-in after register
        await signIn({ email: data.email, password: data.password });
    }, [signIn]);

    const signOut = useCallback(async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await SecureStore.deleteItemAsync(ACTIVE_GROUP_KEY);
        setState({ user: null, token: null, isLoaded: true, isSignedIn: false });
        setActiveGroupIdState(null);
    }, []);

    const setActiveGroupId = useCallback((id: number | null) => {
        setActiveGroupIdState(id);
        if (id !== null) {
            SecureStore.setItemAsync(ACTIVE_GROUP_KEY, String(id));
        } else {
            SecureStore.deleteItemAsync(ACTIVE_GROUP_KEY);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ ...state, signIn, signUp, signOut, activeGroupId, setActiveGroupId }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
