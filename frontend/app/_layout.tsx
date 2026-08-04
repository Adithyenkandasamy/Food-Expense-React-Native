import { SplashScreen, Stack } from 'expo-router';
import '@/global.css';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => { });

function InitializationErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-background">
      <Text className="text-xl font-sans-bold text-primary mb-3">
        Initialization Timeout
      </Text>
      <Text className="text-sm font-sans-medium text-muted-foreground text-center mb-6">
        The app is taking too long to load. Please check your connection.
      </Text>
      <Pressable onPress={onRetry} className="btn-primary">
        <Text className="btn-primary-text">Retry</Text>
      </Pressable>
    </View>
  );
}

function RootLayoutContent() {
  const [timedOut, setTimedOut] = useState(false);

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf'),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded) {
        setTimedOut(true);
        SplashScreen.hideAsync().catch(() => { });
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (timedOut && !fontsLoaded) {
    return <InitializationErrorScreen onRetry={() => setTimedOut(false)} />;
  }

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
