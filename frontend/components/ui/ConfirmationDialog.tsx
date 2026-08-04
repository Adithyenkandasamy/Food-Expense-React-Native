import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface ConfirmationDialogProps {
    visible: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmationDialog({
    visible,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = false,
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmationDialogProps) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onCancel}
        >
            <View className="dialog-overlay">
                <View className="dialog-card">
                    <Text className="dialog-title">{title}</Text>
                    {description && (
                        <Text className="dialog-desc">{description}</Text>
                    )}
                    <View className="dialog-actions">
                        <View className="flex-1">
                            <SecondaryButton label={cancelLabel} onPress={onCancel} />
                        </View>
                        <View className="flex-1">
                            <Pressable
                                onPress={loading ? undefined : onConfirm}
                                className={`items-center justify-center rounded-xl py-4 px-6 ${destructive ? 'bg-danger' : 'bg-primary'
                                    } ${loading ? 'btn-disabled' : ''}`}
                            >
                                <Text className="text-base font-sans-bold text-white">
                                    {confirmLabel}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
