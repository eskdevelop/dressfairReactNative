import { isRunningInExpoGo } from 'expo';

/**
 * Remote push is not supported in Expo Go (SDK 53+ on Android). Loading
 * `expo-notifications` there triggers errors / LogBox noise.
 *
 * Use a development build (`npx expo run:android`) or EAS for full push support.
 *
 * @see https://docs.expo.dev/develop/development-builds/introduction/
 */
export const shouldUseExpoNotifications = (): boolean => !isRunningInExpoGo();
