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
    const isPassword = secureTextEntry && showPasswordToggle;

    return (
        <View style={containerStyle}>
            {label && <Text className="field-label">{label}</Text>}
            <View className={`field-input flex-row items-center ${error ? 'field-input-error' : ''}`}>
                <TextInput
                    className="flex-1 text-base font-sans-medium text-primary p-0"
                    placeholderTextColor="#71717A"
                    secureTextEntry={isPassword ? !visible : secureTextEntry}
                    {...rest}
                />
                {isPassword && (
                    <Pressable onPress={() => setVisible(v => !v)} hitSlop={8}>
                        {visible ? (
                            <EyeOff size={18} color="#71717A" />
                        ) : (
                            <Eye size={18} color="#71717A" />
                        )}
                    </Pressable>
                )}
            </View>
            {error && <Text className="field-error">{error}</Text>}
            {!error && helper && <Text className="field-helper">{helper}</Text>}
        </View>
    );
}
