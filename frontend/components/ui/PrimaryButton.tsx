import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export function PrimaryButton({
    label,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
}: PrimaryButtonProps) {
    const isDisabled = disabled || loading;
    return (
        <Pressable
            onPress={isDisabled ? undefined : onPress}
            className={`btn-primary ${isDisabled ? 'btn-disabled' : ''}`}
            style={style}
        >
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text className="btn-primary-text" style={textStyle}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
}
