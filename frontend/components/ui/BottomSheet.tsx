import React from 'react';
import {
    View,
    Text,
    Modal,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '@/constants/theme';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <Pressable className="modal-overlay" onPress={onClose} />
                <View className="modal-sheet">
                    <View className="modal-handle" />
                    <View className="modal-header">
                        <Text className="modal-title">{title}</Text>
                        <Pressable
                            onPress={onClose}
                            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
                            hitSlop={8}
                        >
                            <X size={16} color={colors.primary} />
                        </Pressable>
                    </View>
                    <ScrollView
                        className="modal-body"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {children}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
