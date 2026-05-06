import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { StoredNotification } from '@features/notifications/notificationStore';

// Mirrors the AsyncStorage-backed notification inbox into Redux so screens
// (the inbox list, the tab bar badge) can render reactively without each
// having to read AsyncStorage on focus. AsyncStorage remains the source of
// truth across launches; Redux is a runtime cache that is replaced wholesale
// after each mutation in `notificationStore`.
type NotificationsState = {
  items: StoredNotification[];
  hydrated: boolean;
};

const initialState: NotificationsState = {
  items: [],
  hydrated: false,
};

const slice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<StoredNotification[]>) {
      state.items = action.payload;
      state.hydrated = true;
    },
  },
});

export const { setNotifications } = slice.actions;
export const notificationsReducer = slice.reducer;
