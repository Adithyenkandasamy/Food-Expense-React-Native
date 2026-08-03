/**
 * MessMate - Groups Screen
 * List user's groups, create/join groups.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, FAB, Input, EmptyState, LoadingSkeleton, Avatar } from '../../src/components/ui';
import { useGroups, useCreateGroup, useJoinGroup } from '../../src/hooks/useApi';
import { useGroupStore } from '../../src/store';
import type { Group } from '../../src/types';

export default function GroupsScreen() {
    const { data: groups, isLoading, refetch, isRefetching } = useGroups();
    const createGroup = useCreateGroup();
    const joinGroup = useJoinGroup();
    const { currentGroup, setCurrentGroup } = useGroupStore();

    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    const handleCreate = async () => {
        if (!groupName.trim()) return;
        try {
            const { data } = await createGroup.mutateAsync({ name: groupName.trim(), description: groupDesc || undefined });
            setCurrentGroup(data);
            setShowCreate(false);
            setGroupName('');
            setGroupDesc('');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to create group');
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        try {
            await joinGroup.mutateAsync({ invite_code: inviteCode.trim() });
            setShowJoin(false);
            setInviteCode('');
            refetch();
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.detail || 'Failed to join group');
        }
    };

    const selectGroup = (group: Group) => {
        setCurrentGroup(group);
    };

    return (
        <SafeAreaView className="flex-1 bg-dark-950">
            {/* Header */}
            <View className="px-5 pt-4 pb-2">
                <Text className="text-white text-2xl font-bold">Groups</Text>
                <Text className="text-dark-400 text-sm mt-1">Manage your mess groups</Text>
            </View>

            {/* Quick Actions */}
            <View className="flex-row px-5 gap-3 mb-4">
                <TouchableOpacity
                    onPress={() => setShowCreate(true)}
                    className="flex-1 bg-primary-600 rounded-xl py-3 flex-row items-center justify-center"
                >
                    <Ionicons name="add-circle" size={20} color="#fff" />
                    <Text className="text-white font-semibold ml-2">Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowJoin(true)}
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl py-3 flex-row items-center justify-center"
                >
                    <Ionicons name="enter" size={20} color="#818CF8" />
                    <Text className="text-primary-300 font-semibold ml-2">Join</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5"
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6366F1" />}
            >
                {isLoading ? (
                    <LoadingSkeleton count={3} />
                ) : groups && groups.length > 0 ? (
                    groups.map((group, i) => (
                        <TouchableOpacity key={group.id} onPress={() => selectGroup(group)} activeOpacity={0.7}>
                            <Card delay={i * 100} className={currentGroup?.id === group.id ? 'border-primary-600' : ''}>
                                <View className="flex-row items-center">
                                    <View className="bg-primary-600/20 rounded-xl p-3">
                                        <Ionicons name="people" size={24} color="#818CF8" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-white text-base font-semibold">{group.name}</Text>
                                        <Text className="text-dark-400 text-xs mt-0.5">{group.member_count} members</Text>
                                        {group.description && (
                                            <Text className="text-dark-500 text-xs mt-1" numberOfLines={1}>{group.description}</Text>
                                        )}
                                    </View>
                                    <View className="items-end">
                                        {currentGroup?.id === group.id && (
                                            <View className="bg-primary-600/20 px-2 py-1 rounded-full">
                                                <Text className="text-primary-400 text-xs font-medium">Active</Text>
                                            </View>
                                        )}
                                        <Text className="text-dark-500 text-xs mt-1">Code: {group.invite_code}</Text>
                                    </View>
                                </View>
                            </Card>
                        </TouchableOpacity>
                    ))
                ) : (
                    <EmptyState
                        icon="people-outline"
                        title="No Groups Yet"
                        message="Create a new group or join using an invite code."
                    />
                )}
            </ScrollView>

            {/* Create Group Modal */}
            <Modal visible={showCreate} transparent animationType="slide">
                <View className="flex-1 bg-dark-950/90 justify-end">
                    <View className="bg-dark-900 rounded-t-3xl p-6 border-t border-dark-700">
                        <Text className="text-white text-xl font-bold mb-4">Create Group</Text>
                        <Input label="Group Name" placeholder="e.g. Hostel Room 42" value={groupName} onChangeText={setGroupName} icon="people" />
                        <Input label="Description (optional)" placeholder="What's this group for?" value={groupDesc} onChangeText={setGroupDesc} icon="document-text" />
                        <View className="flex-row gap-3 mt-2">
                            <Button title="Cancel" variant="secondary" onPress={() => setShowCreate(false)} className="flex-1" />
                            <Button title="Create" onPress={handleCreate} loading={createGroup.isPending} className="flex-1" />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Join Group Modal */}
            <Modal visible={showJoin} transparent animationType="slide">
                <View className="flex-1 bg-dark-950/90 justify-end">
                    <View className="bg-dark-900 rounded-t-3xl p-6 border-t border-dark-700">
                        <Text className="text-white text-xl font-bold mb-4">Join Group</Text>
                        <Input label="Invite Code" placeholder="Enter invite code" value={inviteCode} onChangeText={setInviteCode} icon="key" autoCapitalize="characters" />
                        <View className="flex-row gap-3 mt-2">
                            <Button title="Cancel" variant="secondary" onPress={() => setShowJoin(false)} className="flex-1" />
                            <Button title="Join" onPress={handleJoin} loading={joinGroup.isPending} className="flex-1" />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
