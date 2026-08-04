import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(() => {
      if (isSignedIn) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/sign-in');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#09090B" />
    </View>
  );
}
