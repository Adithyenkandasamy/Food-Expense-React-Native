import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function SignUp() {
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setError('Please fill in all required fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await signUp({
                name: name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || undefined,
            });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            setError(e.message || 'Registration failed');
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
                        <Text className="auth-title">Create account</Text>
                        <Text className="auth-subtitle">
                            Join MessMate to track your mess expenses
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="auth-form">
                        <Input
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            autoCapitalize="words"
                        />

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
                            label="Phone (optional)"
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+91 9876543210"
                            keyboardType="phone-pad"
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Minimum 6 characters"
                            secureTextEntry
                            showPasswordToggle
                        />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Re-enter password"
                            secureTextEntry
                            showPasswordToggle
                        />

                        {error ? (
                            <Text className="text-sm font-sans-medium text-danger">
                                {error}
                            </Text>
                        ) : null}

                        <PrimaryButton
                            label="Create Account"
                            onPress={handleSignUp}
                            loading={loading}
                            disabled={!name.trim() || !email.trim() || !password.trim()}
                        />
                    </View>

                    {/* Footer */}
                    <View className="auth-link-row">
                        <Text className="auth-link-copy">
                            Already have an account?
                        </Text>
                        <Pressable onPress={() => router.push('/(auth)/sign-in')}>
                            <Text className="auth-link">Sign In</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
