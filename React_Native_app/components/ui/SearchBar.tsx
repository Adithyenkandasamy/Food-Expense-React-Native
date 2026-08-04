import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search…' }: SearchBarProps) {
    return (
        <View className="search-bar">
            <Search size={16} color="#71717A" />
            <TextInput
                className="search-input"
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#71717A"
                autoCapitalize="none"
            />
            {value.length > 0 && (
                <Pressable onPress={() => onChangeText('')}>
                    <X size={16} color="#71717A" />
                </Pressable>
            )}
        </View>
    );
}
