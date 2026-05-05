import * as Linking from 'expo-linking';

// Allowlist of URL schemes that we will hand off to the OS via `Linking.openURL`.
// Anything else (javascript:, intent:, file:, content:, market:, fb:, …) is
// dropped because it can be abused to open arbitrary apps, navigate to local
// resources, or execute script in the WebView context.
const ALLOWED_EXTERNAL_SCHEMES: ReadonlySet<string> = new Set([
  'https:',
  'mailto:',
  'tel:',
  'sms:',
]);

export const isAllowedExternalScheme = (url: string): boolean => {
  try {
    return ALLOWED_EXTERNAL_SCHEMES.has(new URL(url).protocol);
  } catch {
    return false;
  }
};

// Returns true if the URL was actually handed off, false if it was rejected by
// the scheme allowlist or `Linking.openURL` failed. Callers should treat false
// as "do not navigate" and may surface telemetry.
export const safeOpenExternalUrl = async (url: string): Promise<boolean> => {
  if (!isAllowedExternalScheme(url)) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
};
