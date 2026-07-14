import { View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { useTheme } from '@/context/theme-context';

type Props = { size?: number };

// Same sofa glyph as the map pins (Lucide, ISC-licensed, unpkg.com/lucide-static)
// so the app logo and the map markers read as the same shape at a glance.
export default function Logo({ size = 72 }: Props) {
  const { colors } = useTheme();
  const iconSize = size * 0.56;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
        <Path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
        <Path d="M4 18v2" />
        <Path d="M20 18v2" />
      </Svg>
    </View>
  );
}
