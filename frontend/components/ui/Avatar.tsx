import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '@/constants/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeConfig: Record<AvatarSize, { containerClass: string; textClass: string; imgSize: number }> = {
    sm: { containerClass: 'avatar-sm', textClass: 'avatar-text text-xs', imgSize: 32 },
    md: { containerClass: 'avatar-md', textClass: 'avatar-text text-sm', imgSize: 40 },
    lg: { containerClass: 'avatar-lg', textClass: 'avatar-text text-xl', imgSize: 56 },
    xl: { containerClass: 'avatar-xl', textClass: 'avatar-text text-2xl', imgSize: 80 },
};

interface AvatarProps {
    name?: string;
    imageUri?: string;
    size?: AvatarSize;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export function Avatar({ name = '', imageUri, size = 'md' }: AvatarProps) {
    const { containerClass, textClass, imgSize } = sizeConfig[size];

    if (imageUri) {
        return (
            <Image
                source={{ uri: imageUri }}
                style={{
                    width: imgSize,
                    height: imgSize,
                    borderRadius: imgSize / 2,
                }}
            />
        );
    }

    return (
        <View className={containerClass}>
            <Text className={textClass}>{getInitials(name)}</Text>
        </View>
    );
}
