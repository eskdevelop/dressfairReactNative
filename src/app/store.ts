import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './storeSlices/appSlice';
import { notificationsReducer } from './storeSlices/notificationsSlice';
import { webNavReducer } from './storeSlices/webNavSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    notifications: notificationsReducer,
    webNav: webNavReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
