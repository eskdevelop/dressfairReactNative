import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './storeSlices/appSlice';
import { notificationsReducer } from './storeSlices/notificationsSlice';
import { webNavReducer } from './storeSlices/webNavSlice';
import { wishlistReducer } from './storeSlices/wishlistSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    notifications: notificationsReducer,
    webNav: webNavReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
