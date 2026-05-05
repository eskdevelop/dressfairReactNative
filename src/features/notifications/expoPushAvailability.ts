import { isRunningInExpoGo } from 'expo';

/**
 * Remote push is not supported in Expo Go on the current Expo SDK (project is
 * on SDK 54). Loading `expo-notifications` there triggers errors / LogBox noise.
 *
 * Use a development build (`npx expo run:android`) or EAS for full push support.
 *
 * @see https://docs.expo.dev/develop/development-builds/introduction/
 */
export const shouldUseExpoNotifications = (): boolean => !isRunningInExpoGo();
