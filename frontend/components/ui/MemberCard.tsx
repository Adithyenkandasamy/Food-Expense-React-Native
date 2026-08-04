import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from './Avatar';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/theme';
import type { GroupMember } from '@/src/types';

interface MemberCardProps {
    member: GroupMember;
    onPress?: () => void;
}

export function MemberCard({ member, onPress }: MemberCardProps) {
    const isAdmin = member.role === 'admin';
    return (
        <Pressable className="member-card" onPress={onPress}>
            <Avatar name={member.user?.name ?? 'User'} size="md" />
            <View className="flex-1 ml-3">
                <Text className="text-sm font-sans-semibold text-primary" numberOfLines={1}>
                    {member.user?.name ?? 'Unknown'}
                </Text>
                <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
                    {member.user?.email}
                </Text>
            </View>
            <View
                className={`role-badge ${isAdmin ? 'role-badge-admin' : 'role-badge-member'}`}
            >
                <Text
                    className={
                        isAdmin ? 'role-badge-text-admin' : 'role-badge-text-member'
                    }
                >
                    {isAdmin ? 'Admin' : 'Member'}
                </Text>
            </View>
        </Pressable>
    );
}
