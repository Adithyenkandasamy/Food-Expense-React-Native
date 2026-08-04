import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  useEffect(() => {
    // Small delay to ensure navigator is ready in React Navigation 7
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}
