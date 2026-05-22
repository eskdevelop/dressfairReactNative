import React, { useEffect, useRef } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { store } from '@app/store';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import {
  CART_WRITE_ONLY_INJECTION,
  buildWriteWebCartInjection,
} from '@features/cart/cartStorageBridgeInjection';
import { ackPendingWebWrite, selectWebWriteGeneration } from '@features/cart/cartSlice';
import { cartItemsToWebJson } from '@features/cart/parseWebCartItems';
import { getEnvConfig, type CountryCode } from '@shared/config/env';

/**
 * Hidden WebView mounted once at tab shell level.
 * Writes native cart to web `localStorage` on delete/qty changes — does NOT read back.
 */
export function CartWebWriteBridge(): React.ReactElement {
  const dispatch = useAppDispatch();
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const webWriteGeneration = useAppSelector(selectWebWriteGeneration);
  const uri = getEnvConfig(country).webCartUrl;
  const webViewRef = useRef<WebView>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    if (webWriteGeneration === 0 || !readyRef.current || !webViewRef.current) return;
    const items = store.getState().cart.items;
    const json = cartItemsToWebJson(items);
    const script = buildWriteWebCartInjection(JSON.stringify(json));
    webViewRef.current.injectJavaScript(`${script}\ntrue;`);
    dispatch(ackPendingWebWrite());
  }, [dispatch, webWriteGeneration]);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', width: 0, height: 0, opacity: 0, overflow: 'hidden' }}
    >
      <WebView
        ref={webViewRef}
        key={`cart-write-${country}`}
        source={{ uri }}
        domStorageEnabled
        sharedCookiesEnabled={Platform.OS === 'ios'}
        thirdPartyCookiesEnabled
        javaScriptEnabled
        injectedJavaScriptBeforeContentLoaded={CART_WRITE_ONLY_INJECTION}
        onLoadEnd={() => {
          readyRef.current = true;
        }}
        style={{ width: 1, height: 1 }}
      />
    </View>
  );
}
