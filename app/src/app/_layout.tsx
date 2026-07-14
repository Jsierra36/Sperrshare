import {
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
} from '@expo-google-fonts/be-vietnam-pro';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import LoginScreen from '@/components/LoginScreen';
import SplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PostsProvider } from '@/context/posts-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import '@/i18n';

function RootGate() {
  const { user, isReady } = useAuth();
  const { colors } = useTheme();

  if (!isReady) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <PostsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="create" options={{ presentation: 'modal', headerShown: true, title: '' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: true, title: '' }} />
        <Stack.Screen name="account-settings" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="design-settings" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="support" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="post/[id]" options={{ presentation: 'modal', headerShown: true, title: '' }} />
      </Stack>
    </PostsProvider>
  );
}

// Minimum time the splash animation stays up, so it's visible even when fonts/auth
// state resolve instantly (e.g. warm cache) instead of flashing by unseen.
const MIN_SPLASH_DURATION_MS = 700;

function AppShell() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  });
  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinDurationElapsed(true), MIN_SPLASH_DURATION_MS);
    return () => clearTimeout(id);
  }, []);

  if (!fontsLoaded || !minDurationElapsed) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}
