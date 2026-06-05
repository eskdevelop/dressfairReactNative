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
  /**
   * Customer JWT mirrored from SecureStore for synchronous WebView auth injection
   * (`beforeContentLoaded`). Async SecureStore reads race checkout's first fetch.
   */
  customerSessionToken: string | null;
  // OpenCart REST session — distinct from `isAuthenticated` (which tracks the
  // user-auth token used by the storefront WebView). Read by `apiClient`'s
  // request interceptor to attach `x-oc-session`.
  apiSession: ApiSessionState;
  /** Flutter `SessionController.countryConfig` — `/api/rest/store/setting`. */
  storeCurrencyCode: string;
  storeCurrencyTitle: string;
  storeShippingAmount: string;
  storeFreeShippingLimit: string;
  storeSettingsHydrated: boolean;
  /** National mobile digits from `/api/rest/store/setting` (region row). */
  storeMobileNationalLength: number | null;
  /** Dial code from store/setting (e.g. `971`). */
  storeMobileDialCode: string | null;
  /**
   * OpenCart `country_id` from store/setting (`CountryConfigModel.countryId`) for
   * `GET /api/rest/store/cities/{id}`. Null until settings hydrate or on region switch.
   */
  storeOpenCartCountryId: string | null;
};

const initialState: AppState = {
  country: 'UAE',
  storefrontCheckoutApiOriginOverride: null,
  storefrontSurfaceGeneration: 0,
  isOffline: false,
  isMaintenanceMode: false,
  isBootstrapped: false,
  isAuthenticated: false,
  customerSessionToken: null,
  apiSession: {
    token: null,
    hydrated: false,
  },
  storeCurrencyCode: '',
  storeCurrencyTitle: '',
  storeShippingAmount: '',
  storeFreeShippingLimit: '',
  storeSettingsHydrated: false,
  storeMobileNationalLength: null,
  storeMobileDialCode: null,
  storeOpenCartCountryId: null,
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
      if (!action.payload) {
        state.customerSessionToken = null;
      }
    },
    setCustomerSessionToken(state, action: PayloadAction<string | null>) {
      const t = action.payload?.trim() ?? '';
      state.customerSessionToken = t.length >= 20 ? t : null;
      state.isAuthenticated = state.customerSessionToken !== null;
    },
    setApiSession(state, action: PayloadAction<string | null>) {
      state.apiSession.token = action.payload;
      state.apiSession.hydrated = true;
    },
    setStoreCurrencySettings(
      state,
      action: PayloadAction<{
        currencyCode: string;
        currencyTitle: string;
        shippingAmount?: string;
        freeShippingLimit?: string;
        mobileNationalLength?: number | null;
        mobileDialCode?: string | null;
      }>,
    ) {
      state.storeCurrencyCode = action.payload.currencyCode;
      state.storeCurrencyTitle = action.payload.currencyTitle;
      state.storeShippingAmount = action.payload.shippingAmount ?? state.storeShippingAmount;
      state.storeFreeShippingLimit = action.payload.freeShippingLimit ?? state.storeFreeShippingLimit;
      if (action.payload.mobileNationalLength !== undefined) {
        state.storeMobileNationalLength = action.payload.mobileNationalLength;
      }
      if (action.payload.mobileDialCode !== undefined) {
        const digits = action.payload.mobileDialCode?.replace(/\D/g, '').trim();
        state.storeMobileDialCode = digits && digits.length > 0 ? digits : null;
      }
      state.storeSettingsHydrated = true;
    },
    setCountry(state, action: PayloadAction<CountryCode>) {
      state.country = action.payload;
    },
    setStorefrontCheckoutApiOriginOverride(state, action: PayloadAction<string | null>) {
      const t = action.payload?.trim() ?? '';
      state.storefrontCheckoutApiOriginOverride = t.length > 0 ? t : null;
    },
    setStoreOpenCartCountryId(state, action: PayloadAction<string | null>) {
      const t = action.payload?.trim() ?? '';
      state.storeOpenCartCountryId = t.length > 0 ? t : null;
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
  setCustomerSessionToken,
  setApiSession,
  setStoreCurrencySettings,
  setCountry,
  setStorefrontCheckoutApiOriginOverride,
  setStoreOpenCartCountryId,
  bumpStorefrontSurfaceGeneration,
} = slice.actions;
export const appReducer = slice.reducer;
