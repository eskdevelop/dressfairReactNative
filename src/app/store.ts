import { configureStore } from '@reduxjs/toolkit';

import { appReducer } from './storeSlices/appSlice';
import { cartBadgeReducer } from './storeSlices/cartBadgeSlice';
import { cartReducer } from '@features/cart/cartSlice';
import { notificationsReducer } from './storeSlices/notificationsSlice';
import { webNavReducer } from './storeSlices/webNavSlice';
import { wishlistReducer } from './storeSlices/wishlistSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    cart: cartReducer,
    cartBadge: cartBadgeReducer,
    notifications: notificationsReducer,
    webNav: webNavReducer,
    wishlist: wishlistReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
