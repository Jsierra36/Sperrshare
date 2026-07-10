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
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from '@/components/LoginScreen';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PostsProvider } from '@/context/posts-context';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import '@/i18n';

function RootGate() {
  const { user, isReady } = useAuth();
  const { colors } = useTheme();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
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

function AppShell() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    PlusJakartaSans_600SemiBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
  });
  const { colors } = useTheme();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
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
