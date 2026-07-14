import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/context/theme-context';
import { fonts, spacing } from '@/theme/colors';
import Logo from './Logo';

// Brief branded entrance shown while fonts/auth state load — see _layout.tsx,
// which also enforces a minimum display time so this is visible even on fast loads.
export default function SplashScreen() {
  const { colors } = useTheme();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(8);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.back(1.6)) });
    opacity.value = withTiming(1, { duration: 300 });
    textOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) });
    textTranslateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.ease) });
  }, [opacity, scale, textOpacity, textTranslateY]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Animated.View style={logoStyle}>
        <Logo size={84} />
      </Animated.View>
      <Animated.Text style={[styles.appName, { color: colors.text, fontFamily: fonts.heading }, textStyle]}>
        Sperrshare
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 22, marginTop: spacing.md },
});
