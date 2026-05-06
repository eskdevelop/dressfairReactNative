import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Cross-tab navigation channel for the embedded WebView. Native screens
// (Search, Notifications inbox, Menu deep links) request a path here, and
// the Home tab's WebViewScreen subscribes to `seq` so each new request —
// even repeats of the same path — triggers an `injectJavaScript` redirect
// without remounting the WebView. Using a sequence number rather than just
// the path lets the user tap the same product twice in a row and have it
// re-navigate the second time.
type WebNavState = {
  pendingPath: string | null;
  seq: number;
};

const initialState: WebNavState = {
  pendingPath: null,
  seq: 0,
};

const slice = createSlice({
  name: 'webNav',
  initialState,
  reducers: {
    requestWebNav(state, action: PayloadAction<string>) {
      state.pendingPath = action.payload;
      state.seq += 1;
    },
    clearWebNav(state) {
      state.pendingPath = null;
    },
  },
});

export const { requestWebNav, clearWebNav } = slice.actions;
export const webNavReducer = slice.reducer;
