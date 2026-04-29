import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CountryCode } from '@shared/config/env';

type AppState = {
  country: CountryCode;
  isOffline: boolean;
  isMaintenanceMode: boolean;
  isBootstrapped: boolean;
  isAuthenticated: boolean;
};

const initialState: AppState = {
  country: 'UAE',
  isOffline: false,
  isMaintenanceMode: false,
  isBootstrapped: false,
  isAuthenticated: false,
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCountry(state, action: PayloadAction<CountryCode>) {
      state.country = action.payload;
    },
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
  },
});

export const {
  setCountry,
  setOffline,
  setMaintenanceMode,
  setBootstrapped,
  setAuthenticated,
} = slice.actions;
export const appReducer = slice.reducer;
