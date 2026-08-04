import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface GhostButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
}

export function GhostButton({
    label,
    onPress,
    disabled = false,
    style,
    icon,
}: GhostButtonProps) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            className={`btn-ghost flex-row gap-2 ${disabled ? 'btn-disabled' : ''}`}
            style={style}
        >
            {icon}
            <Text className="btn-ghost-text">{label}</Text>
        </Pressable>
    );
}
