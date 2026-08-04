import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle } from 'react-native';

interface SecondaryButtonProps {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export function SecondaryButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    style,
}: SecondaryButtonProps) {
    const isDisabled = disabled || loading;
    return (
        <Pressable
            onPress={isDisabled ? undefined : onPress}
            className={`btn-secondary ${isDisabled ? 'btn-disabled' : ''}`}
            style={style}
        >
            {loading ? (
                <ActivityIndicator color="#09090B" size="small" />
            ) : (
                <Text className="btn-secondary-text">{label}</Text>
            )}
        </Pressable>
    );
}
