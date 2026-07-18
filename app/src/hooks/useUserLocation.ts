import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export type UserLocationStatus = 'loading' | 'granted' | 'denied' | 'unavailable';

/**
 * Requests foreground location permission once on mount and resolves the user's current
 * coordinates. Never throws to the caller — permission denial, no GPS, or any other
 * failure just resolves to a null location, so callers can fall back to a fixed map
 * center (see PostMap's DEFAULT_CENTER) without extra handling.
 */
export function useUserLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== 'granted') {
          if (!cancelled) setStatus('denied');
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setStatus('granted');
        }
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, status };
}
