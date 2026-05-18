import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CountryCode } from '@shared/config/env';

type ApiSessionState = {
  token: string | null;
  hydrated: boolean;
};

type AppState = {
  country: CountryCode;
  /**
   * When set, OpenCart JSON/checkout requests use this origin (from store/setting
   * `allowed_countries[].base_url`) instead of the hardcoded host in env config.
   */
  storefrontCheckoutApiOriginOverride: string | null;
  /** Increment to force storefront WebView remounts after a region switch. */
  storefrontSurfaceGeneration: number;
  isOffline: boolean;
  isMaintenanceMode: boolean;
  isBootstrapped: boolean;
  isAuthenticated: boolean;
  // OpenCart REST session — distinct from `isAuthenticated` (which tracks the
  // user-auth token used by the storefront WebView). Read by `apiClient`'s
  // request interceptor to attach `x-oc-session`.
  apiSession: ApiSessionState;
  /** Flutter `SessionController.countryConfig` — `/api/rest/store/setting`. */
  storeCurrencyCode: string;
  storeCurrencyTitle: string;
  storeSettingsHydrated: boolean;
};

const initialState: AppState = {
  country: 'UAE',
  storefrontCheckoutApiOriginOverride: null,
  storefrontSurfaceGeneration: 0,
  isOffline: false,
  isMaintenanceMode: false,
  isBootstrapped: false,
  isAuthenticated: false,
  apiSession: {
    token: null,
    hydrated: false,
  },
  storeCurrencyCode: '',
  storeCurrencyTitle: '',
  storeSettingsHydrated: false,
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOffline(state, action: PayloadAction<boolean>) {
      state.isOffline = action.payload;
    },
    setMaintenanceMode(state, action: PayloadAction<boolean>) {
      state.isMaintenanceMode = action.payload;
    },
    setBootstrapped(state, action: PayloadAction<boolean>) {
      state.isBootstrapped = action.payload;
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setApiSession(state, action: PayloadAction<string | null>) {
      state.apiSession.token = action.payload;
      state.apiSession.hydrated = true;
    },
    setStoreCurrencySettings(
      state,
      action: PayloadAction<{ currencyCode: string; currencyTitle: string }>,
    ) {
      state.storeCurrencyCode = action.payload.currencyCode;
      state.storeCurrencyTitle = action.payload.currencyTitle;
      state.storeSettingsHydrated = true;
    },
    setCountry(state, action: PayloadAction<CountryCode>) {
      state.country = action.payload;
    },
    setStorefrontCheckoutApiOriginOverride(state, action: PayloadAction<string | null>) {
      const t = action.payload?.trim() ?? '';
      state.storefrontCheckoutApiOriginOverride = t.length > 0 ? t : null;
    },
    bumpStorefrontSurfaceGeneration(state) {
      state.storefrontSurfaceGeneration += 1;
    },
  },
});

export const {
  setOffline,
  setMaintenanceMode,
  setBootstrapped,
  setAuthenticated,
  setApiSession,
  setStoreCurrencySettings,
  setCountry,
  setStorefrontCheckoutApiOriginOverride,
  bumpStorefrontSurfaceGeneration,
} = slice.actions;
export const appReducer = slice.reducer;
