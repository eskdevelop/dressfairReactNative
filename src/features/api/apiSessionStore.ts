import * as SecureStore from 'expo-secure-store';

// OpenCart REST API session token. This is the value the backend hands out
// from `rest_api.session` and that we then echo back via the `x-oc-session`
// header on every subsequent call (suggestions, productsLp, etc.).
//
// Stored separately from the user-auth token (`dressfair_token`) so that
// signing out of the storefront does not invalidate the API session — the
// search tab keeps working for guests, which is the load-bearing
// 4.2-resubmission surface.
const TOKEN_KEY = 'dressfair_oc_session';

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export const apiSessionStore = {
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY, secureStoreOptions);
  },
  async saveToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token, secureStoreOptions);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY, secureStoreOptions);
  },
};
