import { Alert, Linking } from 'react-native';

import type { CountryCode } from '@shared/config/env';
import { accountSecurityUrl } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';

/** Opens the regional storefront account-security page in Safari/Chrome. */
export function confirmOpenAccountDeletion(country: CountryCode): void {
  Alert.alert(
    'Delete account',
    'This opens your DressFair account security page in your browser. Scroll to the bottom and tap "Delete your Dressfair account" to continue.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () => {
          const url = accountSecurityUrl(country);
          analytics.track('account_deletion_open_web', { url });
          Linking.openURL(url).catch(() =>
            Alert.alert(
              'Unable to open link',
              'Please check your internet connection and try again.',
            ),
          );
        },
      },
    ],
  );
}
