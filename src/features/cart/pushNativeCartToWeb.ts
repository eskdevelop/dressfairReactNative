import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

import { store } from '@app/store';
import { buildWriteWebCartInjection } from '@features/cart/cartStorageBridgeInjection';
import { cartItemsToWebJson } from '@features/cart/parseWebCartItems';

/** Replace web `localStorage.cart` with the current native cart (no snapshot echo). */
export function pushNativeCartToWebView(webViewRef: RefObject<WebView | null>): void {
  if (!webViewRef.current) return;
  const items = store.getState().cart.items;
  const json = cartItemsToWebJson(items);
  const script = buildWriteWebCartInjection(JSON.stringify(json));
  webViewRef.current.injectJavaScript(`${script}\ntrue;`);
}
