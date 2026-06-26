import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { releasePrewarm, subscribePrewarm } from './pdpWebPrewarm';

/** Phone UA — must match the real PDP WebView so the warmed cache is reused. */
const PREWARM_USER_AGENT =
  Platform.OS === 'ios'
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.154 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

// Keep a hidden WebView alive briefly after load so late image/data requests
// also land in the shared cache, then unmount to free memory (cache persists).
const COOLDOWN_AFTER_LOAD_MS = 1200;
// Hard ceiling so a stuck warm never leaks a hidden WebView.
const MAX_WARM_LIFETIME_MS = 12000;

function PrewarmWebView({ url }: { url: string }) {
  const doneRef = useRef(false);

  useEffect(() => {
    const hardStop = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        releasePrewarm(url);
      }
    }, MAX_WARM_LIFETIME_MS);
    return () => clearTimeout(hardStop);
  }, [url]);

  const finish = () => {
    if (doneRef.current) return;
    setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      releasePrewarm(url);
    }, COOLDOWN_AFTER_LOAD_MS);
  };

  return (
    <WebView
      source={{ uri: url }}
      userAgent={PREWARM_USER_AGENT}
      // Warm the same caches the real PDP reads from.
      cacheEnabled
      domStorageEnabled
      javaScriptEnabled
      sharedCookiesEnabled={Platform.OS === 'ios'}
      thirdPartyCookiesEnabled
      // Headless warm: never let it pull focus or run media.
      androidLayerType="software"
      mediaPlaybackRequiresUserAction
      onLoadEnd={finish}
      onError={finish}
      onHttpError={finish}
      originWhitelist={['https://*']}
      // No navigation should ever escape the hidden warmer.
      onShouldStartLoadWithRequest={req => req.url === url || req.url.startsWith('https://')}
      style={{ flex: 1 }}
    />
  );
}

/**
 * Renders the hidden background WebViews requested via {@link prewarmPdp}.
 * Mounted once near the app root, positioned far offscreen with zero hit area
 * so it never affects layout or interaction.
 */
export function PdpWebPrewarmHost(): React.ReactElement | null {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => subscribePrewarm(setUrls), []);

  if (urls.length === 0) return null;

  return (
    <View
      pointerEvents="none"
      collapsable={false}
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        left: -10000,
        top: -10000,
        opacity: 0,
        overflow: 'hidden',
      }}
    >
      {urls.map(url => (
        <PrewarmWebView key={url} url={url} />
      ))}
    </View>
  );
}
