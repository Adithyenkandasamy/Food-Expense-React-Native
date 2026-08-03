/**
 * MessMate - Register Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((s) => s.register);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await register({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone || undefined, password });
            router.replace('/(tabs)');
        } catch (err: any) {
            Alert.alert('Registration Failed', err?.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-dark-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center px-6 py-12">
                    {/* Header */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center mb-8">
                        <View className="bg-primary-600 rounded-3xl p-4 mb-4">
                            <Ionicons name="person-add" size={36} color="#fff" />
                        </View>
                        <Text className="text-white text-3xl font-bold">Create Account</Text>
                        <Text className="text-dark-400 text-base mt-2">Join MessMate and manage meals</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <Input label="Full Name *" icon="person-outline" placeholder="Adhi" value={name} onChangeText={setName} />
                        <Input label="Email *" icon="mail-outline" placeholder="you@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <Input label="Phone" icon="call-outline" placeholder="+91-9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <Input label="Password *" icon="lock-closed-outline" placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
                        <Input label="Confirm Password *" icon="shield-checkmark-outline" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                        <Button title="Create Account" onPress={handleRegister} loading={loading} size="lg" className="mt-2" />
                    </Animated.View>

                    {/* Login link */}
                    <Animated.View entering={FadeInDown.delay(300).duration(500)} className="flex-row justify-center mt-6">
                        <Text className="text-dark-400 text-base">Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text className="text-primary-400 text-base font-semibold">Sign In</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
