/**
 * MessMate - App Constants
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0] || '192.168.162.251';
const hostUrl = Platform.OS === 'web' ? 'localhost' : localhost;

// API base URL - dynamically points to your computer's IP
export const API_BASE_URL = __DEV__
    ? `http://${hostUrl}:8000`
    : 'https://your-production-api.com';

export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'messmate_access_token',
    REFRESH_TOKEN: 'messmate_refresh_token',
    USER: 'messmate_user',
    CURRENT_GROUP: 'messmate_current_group',
} as const;

export const EXPENSE_CATEGORIES = [
    { key: 'groceries', label: 'Groceries', icon: 'cart', color: '#10B981' },
    { key: 'milk', label: 'Milk', icon: 'water', color: '#3B82F6' },
    { key: 'vegetables', label: 'Vegetables', icon: 'leaf', color: '#22C55E' },
    { key: 'gas', label: 'Gas', icon: 'flame', color: '#F97316' },
    { key: 'cleaning', label: 'Cleaning', icon: 'sparkles', color: '#8B5CF6' },
    { key: 'snacks', label: 'Snacks', icon: 'fast-food', color: '#EC4899' },
    { key: 'others', label: 'Others', icon: 'ellipsis-horizontal', color: '#6B7280' },
] as const;

export const MEAL_TYPES = [
    { key: 'breakfast', label: 'Breakfast', icon: 'sunny', color: '#F59E0B' },
    { key: 'lunch', label: 'Lunch', icon: 'restaurant', color: '#EF4444' },
    { key: 'dinner', label: 'Dinner', icon: 'moon', color: '#6366F1' },
] as const;

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
] as const;
