import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function SignIn() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await signIn({ email: email.trim(), password });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            setError(e.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="auth-scroll"
                    contentContainerClassName="auth-content"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Brand */}
                    <View className="auth-brand">
                        <View className="auth-logo-mark">
                            <Text className="auth-logo-mark-text">M</Text>
                        </View>
                        <Text className="auth-title">Welcome back</Text>
                        <Text className="auth-subtitle">
                            Sign in to your MessMate account
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="auth-form">
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry
                            showPasswordToggle
                        />

                        {error ? (
                            <Text className="text-sm font-sans-medium text-danger">
                                {error}
                            </Text>
                        ) : null}

                        <PrimaryButton
                            label="Sign In"
                            onPress={handleSignIn}
                            loading={loading}
                            disabled={!email.trim() || !password.trim()}
                        />
                    </View>

                    {/* Footer */}
                    <View className="auth-link-row">
                        <Text className="auth-link-copy">
                            Don't have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/sign-up')}>
                            <Text className="auth-link">Sign Up</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
