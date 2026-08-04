import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, { containerClass: string; textClass: string; fontSize: number }> = {
    sm: { containerClass: 'avatar-sm', textClass: 'avatar-text text-xs', fontSize: 12 },
    md: { containerClass: 'avatar-md', textClass: 'avatar-text text-sm', fontSize: 14 },
    lg: { containerClass: 'avatar-lg', textClass: 'avatar-text text-xl', fontSize: 20 },
    xl: { containerClass: 'avatar-xl', textClass: 'avatar-text text-2xl', fontSize: 24 },
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
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('');
}

export function Avatar({ name = '', imageUri, size = 'md' }: AvatarProps) {
    const { containerClass, textClass } = sizeMap[size];
    if (imageUri) {
        const imgStyle = {
            sm: { width: 32, height: 32, borderRadius: 16 },
            md: { width: 40, height: 40, borderRadius: 20 },
            lg: { width: 56, height: 56, borderRadius: 28 },
            xl: { width: 80, height: 80, borderRadius: 40 },
        }[size];
        return <Image source={{ uri: imageUri }} style={imgStyle} />;
    }
    return (
        <View className={containerClass}>
            <Text className={textClass}>{getInitials(name)}</Text>
        </View>
    );
}
