import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
}

export function SecondaryButton({ label, onPress, disabled, style }: SecondaryButtonProps) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            className={`btn-secondary ${disabled ? 'btn-disabled' : ''}`}
            style={style}
        >
            <Text className="btn-secondary-text">{label}</Text>
        </Pressable>
    );
}
