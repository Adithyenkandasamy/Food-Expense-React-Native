import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface OutlineButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode;
}

export function OutlineButton({
    label,
    onPress,
    disabled = false,
    style,
    icon,
}: OutlineButtonProps) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            className={`btn-outline flex-row gap-2 ${disabled ? 'btn-disabled' : ''}`}
            style={style}
        >
            {icon}
            <Text className="btn-outline-text">{label}</Text>
        </Pressable>
    );
}
