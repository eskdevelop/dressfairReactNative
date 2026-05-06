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
  },
});

export const {
  setOffline,
  setMaintenanceMode,
  setBootstrapped,
  setAuthenticated,
  setApiSession,
} = slice.actions;
export const appReducer = slice.reducer;
