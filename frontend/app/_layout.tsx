import { SplashScreen, Stack, usePathname, useGlobalSearchParams } from "expo-router";
import '@/global.css';
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '../src/config/posthog';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Screen shown when the Clerk Publishable Key is missing.
 * This is the most likely cause for hangs in EAS production builds if env vars aren't set correctly.
 */
function MissingClerkKeyScreen() {
  useEffect(() => {
    // Ensure splash is hidden so the user can see this error message
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#000' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#fff' }}>
        Missing Clerk Publishable Key
      </Text>
      <Text style={{ textAlign: 'center', lineHeight: 22, color: '#ccc' }}>
        Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file or EAS Secrets and restart.
      </Text>
    </View>
  );
}

/**
 * Screen shown if initialization (fonts or auth) takes too long.
 */
function InitializationErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#000' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12, color: '#fff' }}>
        Initialization Timeout
      </Text>
      <Text style={{ textAlign: 'center', lineHeight: 22, color: '#ccc', marginBottom: 24 }}>
        The app is taking too long to load fonts or authentication. Please check your connection or environment variables.
      </Text>
      <TouchableOpacity 
        onPress={onRetry}
        style={{ backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
      >
        <Text style={{ fontWeight: '600', color: '#000' }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootLayoutContent() {
  const { isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const [timedOut, setTimedOut] = useState(false);

  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')
  });

  // Log status for debugging production builds (visible in logcat or remote debuggers)
  useEffect(() => {
    console.log('[RootLayout] Load Status:', {
      fontsLoaded,
      authLoaded,
      publishableKey: publishableKey ? 'PRESENT' : 'MISSING',
      pathname
    });
  }, [fontsLoaded, authLoaded, pathname]);

  // Handle timeout logic: if after 10 seconds we are still not loaded, force splash hide and show error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fontsLoaded || !authLoaded) {
        console.warn('[RootLayout] Initialization timed out after 10s');
        setTimedOut(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [fontsLoaded, authLoaded]);

  // Standard splash screen hiding logic
  useEffect(() => {
    if (fontsLoaded && authLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, authLoaded]);

  // PostHog screen tracking
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const sanitizedParams = Object.keys(params).reduce((acc, key) => {
        if (['id', 'tab', 'view'].includes(key)) {
          acc[key] = params[key];
        }
        return acc;
      }, {} as Record<string, string | string[]>);

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...sanitizedParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  // If timed out and still not loaded, show the error screen
  if (timedOut && (!fontsLoaded || !authLoaded)) {
    return <InitializationErrorScreen onRetry={() => setTimedOut(false)} />;
  }

  // Prevent rendering children until fonts and auth are ready (or until timeout)
  if (!fontsLoaded || !authLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

export default function RootLayout() {
  // If the key is missing entirely, show the error screen immediately and ensure splash hides
  if (!publishableKey) {
    return <MissingClerkKeyScreen />;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
      }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootLayoutContent />
      </ClerkProvider>
    </PostHogProvider>
  );
}
