/**
 * MessMate - Login Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../src/components/ui';
import { useAuthStore } from '../../src/store';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore((s) => s.login);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            await login({ email: email.trim().toLowerCase(), password });
            router.replace('/(tabs)');
        } catch (err: any) {
            Alert.alert('Login Failed', err?.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-dark-950" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 justify-center px-6 py-12">
                    {/* Header */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} className="items-center mb-10">
                        <View className="bg-primary-600 rounded-3xl p-4 mb-4">
                            <Ionicons name="restaurant" size={40} color="#fff" />
                        </View>
                        <Text className="text-white text-3xl font-bold">Welcome Back</Text>
                        <Text className="text-dark-400 text-base mt-2">Sign in to your MessMate account</Text>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <Input
                            label="Email"
                            icon="mail-outline"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <View className="mb-4">
                            <Text className="text-dark-300 text-sm mb-1.5 font-medium">Password</Text>
                            <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4">
                                <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                                <View className="flex-1">
                                    <Input
                                        placeholder="Enter password"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        className="border-0 bg-transparent px-0"
                                    />
                                </View>
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity className="self-end mb-6">
                            <Text className="text-primary-400 text-sm">Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button title="Sign In" onPress={handleLogin} loading={loading} size="lg" />
                    </Animated.View>

                    {/* Register link */}
                    <Animated.View entering={FadeInDown.delay(300).duration(500)} className="flex-row justify-center mt-8">
                        <Text className="text-dark-400 text-base">Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text className="text-primary-400 text-base font-semibold">Sign Up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
