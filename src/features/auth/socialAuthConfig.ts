import Constants from 'expo-constants';

/**
 * Social-login client IDs, sourced from `app.json` -> `expo.extra`.
 * Fill these once the OAuth clients exist (see the plan's setup guide):
 *  - googleWebClientId  : Google Cloud "Web application" OAuth client.
 *  - googleIosClientId  : Google Cloud "iOS" OAuth client (also in GoogleService-Info.plist).
 *  - appleServicesId    : Apple "Services ID" for Sign in with Apple on Android (web flow).
 *  - appleRedirectUri   : Return URL registered for that Services ID.
 */
type SocialAuthExtra = {
  googleWebClientId?: string;
  googleIosClientId?: string;
  appleServicesId?: string;
  appleRedirectUri?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as SocialAuthExtra;

export const googleWebClientId = extra.googleWebClientId ?? '';
export const googleIosClientId = extra.googleIosClientId ?? '';
export const appleServicesId = extra.appleServicesId ?? '';
export const appleRedirectUri = extra.appleRedirectUri ?? '';
