export const colors = {
    // Backgrounds
    background: '#FFFFFF',
    darkBackground: '#09090B',
    // Cards
    card: '#FFFFFF',
    darkCard: '#18181B',
    // Foreground / Text
    foreground: '#09090B',
    primary: '#09090B',
    secondary: '#71717A',
    // Borders
    border: '#E4E4E7',
    darkBorder: '#27272A',
    // Muted
    muted: '#F4F4F5',
    mutedForeground: '#71717A',
    // Accent (nearly black)
    accent: '#18181B',
    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    // Pure
    black: '#000000',
    white: '#FFFFFF',
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
} as const;

export const components = {
    tabBar: {
        height: 64,
        iconFrame: 24,
    },
} as const;

export const theme = {
    colors,
    spacing,
    radius,
    components,
} as const;
