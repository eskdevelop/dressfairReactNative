import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

type CartBadgeState = {
  quantity: number;
};

const initialState: CartBadgeState = {
  quantity: 0,
};

const slice = createSlice({
  name: 'cartBadge',
  initialState,
  reducers: {
    setCartBadgeQuantity(state, action: PayloadAction<number>) {
      const n = Math.floor(Number(action.payload));
      state.quantity = Number.isFinite(n) && n > 0 ? Math.min(n, 9999) : 0;
    },
  },
});

export const { setCartBadgeQuantity } = slice.actions;
export const cartBadgeReducer = slice.reducer;
