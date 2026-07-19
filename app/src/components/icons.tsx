import { Path, Circle, Svg } from 'react-native-svg';

// Verified paths from Lucide (ISC license, unpkg.com/lucide-static) — not hand-drawn.
// Each icon is a small stroke-based glyph; `color`/`size` control appearance.

type IconProps = { size?: number; color?: string };

const strokeProps = {
  fill: 'none' as const,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconPlus({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14" stroke={color} {...strokeProps} />
      <Path d="M12 5v14" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconUser({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="5" stroke={color} {...strokeProps} />
      <Path d="M20 21a8 8 0 0 0-16 0" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconBell({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M10.268 21a2 2 0 0 0 3.464 0" stroke={color} {...strokeProps} />
      <Path
        d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        stroke={color}
        {...strokeProps}
      />
    </Svg>
  );
}

export function IconSunMoon({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2v2" stroke={color} {...strokeProps} />
      <Path
        d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
        stroke={color}
        {...strokeProps}
      />
      <Path d="M16 12a4 4 0 0 0-4-4" stroke={color} {...strokeProps} />
      <Path d="m19 5-1.256 1.256" stroke={color} {...strokeProps} />
      <Path d="M20 12h2" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconLifeBuoy({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} {...strokeProps} />
      <Path d="m4.93 4.93 4.24 4.24" stroke={color} {...strokeProps} />
      <Path d="m14.83 9.17 4.24-4.24" stroke={color} {...strokeProps} />
      <Path d="m14.83 14.83 4.24 4.24" stroke={color} {...strokeProps} />
      <Path d="m9.17 14.83-4.24 4.24" stroke={color} {...strokeProps} />
      <Circle cx="12" cy="12" r="4" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconLogOut({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m16 17 5-5-5-5" stroke={color} {...strokeProps} />
      <Path d="M21 12H9" stroke={color} {...strokeProps} />
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconChevronRight({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m9 18 6-6-6-6" stroke={color} {...strokeProps} />
    </Svg>
  );
}

export function IconLanguages({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m5 8 6 6" stroke={color} {...strokeProps} />
      <Path d="m4 14 6-6 2-3" stroke={color} {...strokeProps} />
      <Path d="M2 5h12" stroke={color} {...strokeProps} />
      <Path d="M7 2h1" stroke={color} {...strokeProps} />
      <Path d="m22 22-5-10-5 10" stroke={color} {...strokeProps} />
      <Path d="M14 18h6" stroke={color} {...strokeProps} />
    </Svg>
  );
}

// Standard "recenter to my location" glyph (Lucide's Locate icon) — minimalist crosshair,
// used instead of a target/bullseye emoji to match the rest of the app's line-icon set.
export function IconLocate({ size = 24, color = '#000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12h3" stroke={color} {...strokeProps} />
      <Path d="M19 12h3" stroke={color} {...strokeProps} />
      <Path d="M12 2v3" stroke={color} {...strokeProps} />
      <Path d="M12 19v3" stroke={color} {...strokeProps} />
      <Circle cx="12" cy="12" r="7" stroke={color} {...strokeProps} />
    </Svg>
  );
}
