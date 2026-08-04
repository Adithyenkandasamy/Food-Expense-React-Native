import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    Pressable,
    ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string;
    helper?: string;
    containerStyle?: ViewStyle;
    showPasswordToggle?: boolean;
}

export function Input({
    label,
    error,
    helper,
    containerStyle,
    showPasswordToggle,
    secureTextEntry,
    ...rest
}: InputProps) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = secureTextEntry && showPasswordToggle;

    const borderClass = error
        ? 'field-input-error'
        : focused
            ? 'field-input-focus'
            : '';

    return (
        <View style={containerStyle}>
            {label && <Text className="field-label">{label}</Text>}
            <View className={`field-input flex-row items-center ${borderClass}`}>
                <TextInput
                    className="flex-1 text-base font-sans-medium text-primary p-0"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={isPassword ? !visible : secureTextEntry}
                    onFocus={(e) => {
                        setFocused(true);
                        rest.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        rest.onBlur?.(e);
                    }}
                    {...rest}
                />
                {isPassword && (
                    <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
                        {visible ? (
                            <EyeOff size={18} color={colors.mutedForeground} />
                        ) : (
                            <Eye size={18} color={colors.mutedForeground} />
                        )}
                    </Pressable>
                )}
            </View>
            {error && <Text className="field-error">{error}</Text>}
            {!error && helper && <Text className="field-helper">{helper}</Text>}
        </View>
    );
}
