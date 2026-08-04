import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '@/constants/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search...',
}: SearchBarProps) {
    return (
        <View className="search-bar">
            <Search size={16} color={colors.mutedForeground} />
            <TextInput
                className="search-input"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText('')} hitSlop={8}>
                    <X size={16} color={colors.mutedForeground} />
                </Pressable>
            )}
        </View>
    );
}
