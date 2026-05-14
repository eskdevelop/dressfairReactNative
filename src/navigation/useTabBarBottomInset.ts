import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Below this, Android edge-to-edge often reports `bottom=0` while the nav strip still consumes space. */
const UNRELIABLE_BOTTOM_THRESHOLD = 8;
/** Fallback padding when safe-area bottom is unreliable (≈ gesture bar / legacy nav). */
const ANDROID_BOTTOM_FALLBACK_MIN = 40;
const ANDROID_BOTTOM_FALLBACK_CAP = 48;

export function useTabBarBottomInset(): number {
  const { bottom } = useSafeAreaInsets();
  if (Platform.OS === 'android') {
    if (bottom >= UNRELIABLE_BOTTOM_THRESHOLD) {
      return bottom;
    }
    return Math.min(Math.max(bottom, ANDROID_BOTTOM_FALLBACK_MIN), ANDROID_BOTTOM_FALLBACK_CAP);
  }
  return bottom;
}
