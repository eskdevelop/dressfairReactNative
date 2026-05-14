import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CountryCode } from '@shared/config/env';

type ApiSessionState = {
  token: string | null;
  hydrated: boolean;
};

type AppState = {
  country: CountryCode;
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
  },
});

export const {
  setOffline,
  setMaintenanceMode,
  setBootstrapped,
  setAuthenticated,
  setApiSession,
  setStoreCurrencySettings,
} = slice.actions;
export const appReducer = slice.reducer;
