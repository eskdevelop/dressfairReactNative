import React, { useCallback, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import * as SplashScreenModule from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { useAppDispatch, useAppSelector } from '@app/hooks';
import { store } from '@app/store';
import { setAuthenticated } from '@app/storeSlices/appSlice';
import { setCartBadgeQuantity } from '@app/storeSlices/cartBadgeSlice';
import { clearWebNav } from '@app/storeSlices/webNavSlice';
import { clearCachedProfile } from '@features/account/customerProfileCache';
import { sessionStore } from '@features/auth/sessionStore';
import { openSettings } from '@navigation/navigationRef';
import type { MainTabParamList } from '@navigation/types';
import { getEnvConfig } from '@shared/config/env';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';
import { AppAsyncState } from '@shared/ui/AppAsyncState';
import { safeOpenExternalUrl } from '@shared/webview/externalLinks';
import { isPaymentGatewayHost } from '@shared/webview/paymentGateways';
import { isAllowedUrl } from '@shared/webview/urlPolicy';
import { AUTH_CAPTURE_INJECTION_BEFORE_CONTENT } from './authCaptureInjection';
import { parseBridgeMessage } from './bridgeMessage';
import { detectPaymentRedirect } from './paymentRedirectPolicy';
import { CART_COUNT_BRIDGE_INJECTION } from './cartCountBridgeInjection';
import { STOREFRONT_HIDE_MOBILE_HEADER_INJECTION } from './storefrontHideMobileHeaderInjection';
import { STOREFRONT_OPEN_LOGIN_MODAL_INJECTION } from './storefrontOpenLoginModalInjection';

type Props = {
  /** Relative path (e.g. `/ae/cart`) or full storefront URL (`https://…`). */
  path: string;
  /**
   * Category tab only: SPA categories live on `/ae` (same URL); open the drawer
   * by clicking the storefront mobile menu button once the DOM is hydrated.
   */
  openMobileCategoryMenuOnLoad?: boolean;
  /**
   * Bottom tab tapped: snap WebView to this tab's root URL if user navigated away
   * (e.g. product page). Already at category root → tap re-opens mega-menu via JS.
   */
  tabReselectMode?: 'home' | 'category' | 'cart';
  /**
   * Subscribe to Redux `webNav` / `openWebPath` updates. Must be true only for
   * the Home WebView — otherwise Search/inbox product taps rewrite Category/Cart URIs.
   */
  applyWebNavFromStore?: boolean;
  /**
   * When false, skips top safe-area inset so a parent screen can provide its own
   * header without double-padding (e.g. category PLP WebView under a search bar).
   * Default true for tab WebViews.
   */
  applyTopSafeArea?: boolean;
  /**
   * Immersive PDP: transparent shell and no top inset so the WebView draws under the
   * status bar (icons over content). Overrides applyTopSafeArea for the top edge.
   */
  statusBarOverContent?: boolean;
  /**
   * When true (embedded category PLP only), inject CSS/JS to hide the storefront
   * `.mobile-header` row so it does not stack under the native search bar.
   */
  hideStorefrontMobileHeader?: boolean;
  /**
   * When true, injects a lightweight DOM observer that posts `cart_count` bridge
   * messages so the Cart tab badge can reflect the storefront cart.
   */
  reportCartCountToNative?: boolean;
  /**
   * Cart tab: separate WebViews keep stale cart HTML after mutations on Home. When true,
   * reload whenever this tab gains focus after the first visit (badge DOM may be hidden on Home).
   */
  reloadWebWhenTabFocused?: boolean;
  /**
   * After loading regional storefront home, inject JS that opens the web "Sign In / Register" modal
   * (SPA — no workable `/login` URL in RN WebViews). Implies `.mobile-header` must stay visible.
   */
  openStorefrontLoginModal?: boolean;
};

const CHECKOUT_PATH_HINT =
  /checkout|payment|cart|order|confirm|success|failure|callback|3ds|return|pay/i;

const looksCheckoutRelated = (url: string): boolean => {
  try {
    const u = new URL(url);
    return CHECKOUT_PATH_HINT.test(u.pathname + u.search);
  } catch {
    return false;
  }
};

const isHttpsUrl = (url: string): boolean => url.startsWith('https://');

/** Relative storefront path (leading `/`) or absolute `http(s)` URL for `source.uri`. */
const storefrontUri = (seed: string, webBaseUrl: string): string => {
  const s = seed.trim();
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  return s.startsWith('/') ? `${webBaseUrl}${s}` : `${webBaseUrl}/${s}`;
};

const storefrontUrlComparable = (uri: string): string | null => {
  try {
    const u = new URL(uri);
    const host = u.hostname.replace(/^www\./i, '').toLowerCase();
    const pathPart = (u.pathname.replace(/\/+$/, '') || '/').toLowerCase();
    return `${host}${pathPart}`;
  } catch {
    return null;
  }
};

/** Locale storefront landings (/ae, /om, /sa) plus `/` count as Home-tab "root". */
const isAtRegionalHome = (url: string): boolean => {
  try {
    const p = new URL(url).pathname.replace(/\/+$/, '') || '/';
    if (p === '/') return true;
    return /^\/(ae|om|sa)$/i.test(p);
  } catch {
    return false;
  }
};

const isInternalWebViewUrl = (url: string): boolean =>
  url.startsWith('about:blank') ||
  url.startsWith('data:') ||
  url.startsWith('blob:') ||
  url.startsWith('javascript:');

const safeHost = (url: string): string | null => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};

// Bridge sentinel posted by the injected JS once the storefront has actually
// painted its first frame. We hide the native splash on this signal — not on
// `onLoadEnd`, which fires when the network load finishes but BEFORE the
// WebView has flushed its first paint. Hiding on `onLoadEnd` exposes the
// white SafeAreaView for the duration of (paint - load), which the user
// perceives as a "white screen flash" between the logo and the storefront.
const FIRST_PAINT_SENTINEL = '__dressfair_first_paint__';
const FIRST_PAINT_INJECTION = `
(function() {
  if (window.__dressfairPaintNotified) return true;
  function notify() {
    if (window.__dressfairPaintNotified) return;
    window.__dressfairPaintNotified = true;
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: '${FIRST_PAINT_SENTINEL}' }));
    }
  }
  function whenLoaded() {
    // Two RAFs: first one resolves layout, second resolves paint.
    requestAnimationFrame(function() { requestAnimationFrame(notify); });
  }
  if (document.readyState === 'complete') {
    whenLoaded();
  } else {
    window.addEventListener('load', whenLoaded, { once: true });
  }
})();
true;
`;

// App Store Review Guideline 4.8 (Login Services) compliance.
//
// The web storefront's "Sign in / Register" modal renders a "Continue with
// Google" button that has NO Google-specific selector — its classes are
// generic Tailwind utilities and there is no data-attribute or aria-label.
// The button is identified ONLY by its trimmed text content ("Google"),
// which CSS cannot match. We therefore inject a MutationObserver-based
// hider rather than a static <style> rule.
//
// Why an observer and not a one-shot pass:
//   The login UI is a modal that mounts AFTER user interaction (tapping
//   "Order & Account"). At page load the button does not exist in the DOM,
//   so a single querySelectorAll-on-load would find nothing.
//
// Scope:
//   Hides only buttons whose entire visible label is exactly one of the
//   listed social-provider strings. This avoids accidentally hiding any
//   product card, blog post, or category tile that merely mentions Google.
//
// Effect on App Review:
//   With this button hidden, the only login methods exposed in the iOS app
//   are phone + WhatsApp OTP (sign-in) and email + password (register).
//   Neither is a third-party login service, so Guideline 4.8's parity
//   requirement does not apply — Sign in with Apple is not required.
const HIDE_THIRD_PARTY_LOGIN_INJECTION = `
(function() {
  // Bump this string whenever the injection logic changes so the
  // 'installed' debug log proves which generation of the code the
  // device is actually running. If you see 'installed:v1' but you
  // shipped 'v3', the WebView is running a stale bundle.
  var INJECTION_VERSION = 'v3';
  if (window.__dressfairSocialHiderInstalled === INJECTION_VERSION) return true;
  window.__dressfairSocialHiderInstalled = INJECTION_VERSION;

  var SOCIAL_LABELS = [
    'google',
    'continue with google',
    'sign in with google',
    'sign up with google',
    'login with google',
    'log in with google',
    'facebook',
    'continue with facebook',
    'sign in with facebook',
    'login with facebook',
    'log in with facebook'
  ];

  // Decoration text rendered alongside the social buttons. Once we hide
  // every social button there is nothing to "continue with", so leaving
  // the divider visible looks broken AND would invite an App Review
  // tester to investigate why the prompt has no options. We strip these
  // separators outright. Matched as substrings so localized variants
  // (e.g. "OR CONTINUE WITH ANOTHER METHOD") are still caught.
  var DECORATION_SUBSTRINGS = [
    'or continue with other ways',
    'or continue with',
    'or sign in with',
    'or login with',
    'or log in with'
  ];

  function isDecorationText(text) {
    var trimmed = (text || '').trim().toLowerCase();
    if (trimmed.length === 0 || trimmed.length > 60) return false;
    for (var i = 0; i < DECORATION_SUBSTRINGS.length; i++) {
      if (trimmed.indexOf(DECORATION_SUBSTRINGS[i]) !== -1) return true;
    }
    return false;
  }

  function postDebug(label, detail) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: '__dressfair_social_hider_debug__',
          label: label,
          detail: detail || null
        }));
      }
    } catch (e) {}
  }

  // Read every textual signal the storefront might use to label the
  // button: the visible text, and accessibility attributes. We deliberately
  // do NOT walk into descendant SVG <title> elements separately because
  // textContent already aggregates them — but we DO snapshot aria-label /
  // title / alt because icon-only social buttons often expose the provider
  // there (e.g. <button aria-label="Sign in with Google"><svg/></button>).
  function readSignals(el) {
    var signals = [];
    var text = (el.textContent || '').trim();
    if (text) signals.push(text);
    if (el.getAttribute) {
      var aria = el.getAttribute('aria-label');
      if (aria) signals.push(aria);
      var title = el.getAttribute('title');
      if (title) signals.push(title);
    }
    var inner = el.querySelectorAll ? el.querySelectorAll('img[alt], [aria-label], [title]') : [];
    for (var i = 0; i < inner.length; i++) {
      var alt = inner[i].getAttribute('alt');
      if (alt) signals.push(alt);
      var iAria = inner[i].getAttribute('aria-label');
      if (iAria) signals.push(iAria);
      var iTitle = inner[i].getAttribute('title');
      if (iTitle) signals.push(iTitle);
    }
    return signals;
  }

  function isSocialSignal(signal) {
    var trimmed = (signal || '').trim().toLowerCase();
    if (trimmed.length === 0 || trimmed.length > 80) return false;
    for (var i = 0; i < SOCIAL_LABELS.length; i++) {
      if (trimmed === SOCIAL_LABELS[i]) return true;
    }
    // Substring fallback for short labels. Capped at 30 chars so a product
    // title like "Google Pixel 8 Phone Case Genuine Leather" (41 chars) is
    // never accidentally hidden, but "Continue with Google" (20) is.
    if (trimmed.length <= 30) {
      if (trimmed.indexOf('google') !== -1) return true;
      if (trimmed.indexOf('facebook') !== -1) return true;
    }
    return false;
  }

  // Last-resort detector: the official Google "G" logo always uses these
  // four brand-color fills. If a button contains an inline SVG with all
  // four, it is virtually certainly a Google login control regardless of
  // what (or whether) the visible label says.
  var GOOGLE_BRAND_FILLS = ['#FFC107', '#FF3D00', '#4CAF50', '#1976D2'];
  function hasGoogleBrandSvg(el) {
    if (!el.querySelectorAll) return false;
    var paths = el.querySelectorAll('svg path[fill]');
    if (paths.length < 4) return false;
    var seen = {};
    for (var i = 0; i < paths.length; i++) {
      var fill = (paths[i].getAttribute('fill') || '').toUpperCase();
      seen[fill] = true;
    }
    for (var j = 0; j < GOOGLE_BRAND_FILLS.length; j++) {
      if (!seen[GOOGLE_BRAND_FILLS[j].toUpperCase()]) return false;
    }
    return true;
  }

  function isSocialButton(el) {
    var signals = readSignals(el);
    for (var i = 0; i < signals.length; i++) {
      if (isSocialSignal(signals[i])) return { match: 'label', value: signals[i] };
    }
    if (hasGoogleBrandSvg(el)) return { match: 'svg-brand', value: 'google-svg' };
    return null;
  }

  function hideIfSocial(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.dataset && el.dataset.dressfairHidden === '1') return;
    var hit = isSocialButton(el);
    if (!hit) return;
    el.dataset.dressfairHidden = '1';
    el.style.setProperty('display', 'none', 'important');
    postDebug('hidden', hit.match + ':' + (hit.value || '').slice(0, 40));
    // Collapse the wrapping social-button row if it now has no visible
    // children, so we don't leave an empty flex gap in the modal.
    var parent = el.parentElement;
    if (parent) {
      var visibleSiblings = 0;
      for (var i = 0; i < parent.children.length; i++) {
        var child = parent.children[i];
        if (child.dataset && child.dataset.dressfairHidden === '1') continue;
        visibleSiblings++;
      }
      if (visibleSiblings === 0) {
        parent.style.setProperty('display', 'none', 'important');
      }
    }
  }

  // Diagnostic helper: when scanning new DOM, log any button-shaped element
  // that mentions "google" anywhere in its outerHTML so we can see WHY a
  // button isn't matching when one obviously should. Capped to first 200
  // chars and only sent for buttons/links to keep the bridge quiet.
  function maybeLogNearMiss(el) {
    if (!el || el.nodeType !== 1) return;
    if (!el.outerHTML) return;
    var snippet = el.outerHTML.slice(0, 200);
    if (snippet.toLowerCase().indexOf('google') === -1) return;
    if (el.dataset && el.dataset.dressfairLogged === '1') return;
    el.dataset.dressfairLogged = '1';
    postDebug('candidate', snippet);
  }

  function hideIfDecoration(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.dataset && el.dataset.dressfairHidden === '1') return;
    // Only consider leaf-ish elements so we don't accidentally hide an
    // entire section just because some descendant says "or continue with".
    // querySelector returns null when the element has no nested buttons,
    // which is the signature of a divider/label rather than a container.
    if (el.querySelector && el.querySelector('button, input, [role="button"], a[href]')) return;
    if (!isDecorationText(el.textContent)) return;
    el.dataset.dressfairHidden = '1';
    el.style.setProperty('display', 'none', 'important');
    postDebug('hidden', 'decoration:' + (el.textContent || '').trim().slice(0, 40));
  }

  function scan(root) {
    if (!root || root.nodeType !== 1) return;
    var nodes = root.querySelectorAll('button, a[role="button"], a, [role="button"]');
    for (var i = 0; i < nodes.length; i++) {
      maybeLogNearMiss(nodes[i]);
      hideIfSocial(nodes[i]);
    }
    if (root.matches && (
      root.matches('button') ||
      root.matches('a[role="button"]') ||
      root.matches('a') ||
      root.matches('[role="button"]')
    )) {
      maybeLogNearMiss(root);
      hideIfSocial(root);
    }
    // Walk likely decoration containers (small text elements) for the
    // "Or continue with…" divider. Limited to short, leaf-like elements
    // to avoid hiding genuine paragraphs that happen to contain the
    // phrase.
    var decoCandidates = root.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    for (var k = 0; k < decoCandidates.length; k++) {
      hideIfDecoration(decoCandidates[k]);
    }
    if (root.matches && root.matches('p, span, div, h1, h2, h3, h4, h5, h6')) {
      hideIfDecoration(root);
    }
  }

  scan(document.documentElement);
  postDebug('installed', INJECTION_VERSION);

  // MutationObserver attachment is best-effort. On Android, the imperative
  // injectJavaScript() call we run from onLoadEnd can fire during a
  // transient navigation state where document.documentElement is briefly
  // null; the periodic rescan loop below covers that case so a missed
  // observer install is not a functional failure. We retry on
  // DOMContentLoaded if the immediate attempt has nothing to attach to.
  function attachObserver() {
    var target = document.documentElement || document.body;
    if (!target) return false;
    try {
      var observer = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            scan(added[j]);
          }
          // Text changes on existing nodes (e.g. i18n hydration swapping a
          // placeholder for the localized "Google" string) also need a recheck.
          if (mutations[i].type === 'characterData' && mutations[i].target.parentElement) {
            scan(mutations[i].target.parentElement);
          }
        }
      });
      observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true
      });
      postDebug('observer_armed', null);
      return true;
    } catch (e) {
      return false;
    }
  }

  if (!attachObserver()) {
    if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', attachObserver, { once: true });
    }
  }

  // Safety-net periodic rescan. The MutationObserver should catch every
  // modal mount instantly, but we have observed cases on Android where
  // the modal renders via a portal / animation library that produces no
  // observable mutation on documentElement (e.g. the modal node pre-mounts
  // hidden and only flips an attribute to become visible — which our
  // observer does not watch by design, because watching attributes
  // page-wide is expensive). A periodic full-document rescan guarantees
  // the button eventually disappears even if the observer is bypassed.
  //
  // Cost: one querySelectorAll over the document every 300ms. On a
  // typical storefront page that is well under 1ms; negligible vs. the
  // ~16ms paint budget. We self-terminate after IDLE_TIMEOUT_MS of no
  // user interaction to avoid burning battery on long-lived sessions,
  // and we re-arm on the next click so opening the modal hours after
  // launch is still covered.
  var RESCAN_INTERVAL_MS = 300;
  var IDLE_TIMEOUT_MS = 30000;
  var lastInteractionAt = Date.now();
  var rescanTimer = null;

  function rescanTick() {
    if (Date.now() - lastInteractionAt > IDLE_TIMEOUT_MS) {
      if (rescanTimer !== null) {
        clearInterval(rescanTimer);
        rescanTimer = null;
      }
      return;
    }
    scan(document.documentElement);
  }

  function startRescanLoop() {
    lastInteractionAt = Date.now();
    if (rescanTimer === null) {
      rescanTimer = setInterval(rescanTick, RESCAN_INTERVAL_MS);
      postDebug('rescan_started', null);
    }
  }

  try {
    startRescanLoop();
    // Any user interaction (tap, key, scroll) re-arms the loop. We use
    // capture phase so we see the event before any storefront handler can
    // stopPropagation it.
    document.addEventListener('click', startRescanLoop, true);
    document.addEventListener('touchstart', startRescanLoop, true);
    document.addEventListener('keydown', startRescanLoop, true);
  } catch (rescanErr) {
    postDebug('rescan_setup_error', String(rescanErr && rescanErr.message ? rescanErr.message : rescanErr).slice(0, 100));
  }
})();
true;
`;

// Category tab — `.menu-icons-mobile` opens the mega-menu drawer on mobile.
// SPA headers mount after hydration; poll briefly then click once. The WebView
// stays visible; this injection runs without blocking native UI.
const MOBILE_CATEGORY_MENU_CLICK_JS = `
(function() {
  function clearDrawerWait() {
    if (window.__dressfairCategoryDrawerWaitId != null) {
      clearInterval(window.__dressfairCategoryDrawerWaitId);
      window.__dressfairCategoryDrawerWaitId = null;
    }
  }
  if (window.__dressfairCategoryMenuRetryId != null) {
    clearInterval(window.__dressfairCategoryMenuRetryId);
    window.__dressfairCategoryMenuRetryId = null;
  }
  clearDrawerWait();
  window.__dressfairCategoryMenuAutoOpenStarted = false;
  var sel = '.mobile-header button.menu-icons-mobile';
  var tries = 0;
  var max = 26;
  var iv = setInterval(function() {
    tries++;
    var btn = document.querySelector(sel);
    if (!btn || typeof btn.click !== 'function') {
      if (tries >= max) {
        clearInterval(iv);
        window.__dressfairCategoryMenuRetryId = null;
      }
      return;
    }
    if (btn.getAttribute('aria-expanded') === 'true') {
      clearInterval(iv);
      window.__dressfairCategoryMenuRetryId = null;
      return;
    }
    window.__dressfairCategoryMenuOpened = true;
    btn.click();
    clearInterval(iv);
    window.__dressfairCategoryMenuRetryId = null;
    var waitN = 0;
    window.__dressfairCategoryDrawerWaitId = setInterval(function() {
      waitN++;
      var b = document.querySelector(sel);
      if (b && b.getAttribute('aria-expanded') === 'true') {
        clearDrawerWait();
        return;
      }
      if (waitN >= 48) {
        clearDrawerWait();
      }
    }, 43);
  }, 200);
  window.__dressfairCategoryMenuRetryId = iv;
})();
true;
`;

const COMBINED_INJECTION = `${FIRST_PAINT_INJECTION}\n${HIDE_THIRD_PARTY_LOGIN_INJECTION}`;

// Patches fetch/XHR before page scripts load so storefront login POSTs can
// tunnel `token` into native SecureStore via the bridge.
const BEFORE_PAGE_SCRIPTS_INJECTION = `${AUTH_CAPTURE_INJECTION_BEFORE_CONTENT}\n${HIDE_THIRD_PARTY_LOGIN_INJECTION}`;

// Hide the native splash exactly once across the app's lifetime; remounts of
// WebViewScreen (e.g. tab switches) must not retrigger preventAutoHide.
let nativeSplashHidden = false;
const hideNativeSplashOnce = (_reason: string) => {
  if (nativeSplashHidden) return;
  nativeSplashHidden = true;
  SplashScreenModule.hideAsync().catch(() => {
    // Swallow: splash can already be hidden if the user backgrounded the app.
  });
};

export function WebViewScreen({
  path,
  openMobileCategoryMenuOnLoad = false,
  tabReselectMode,
  applyWebNavFromStore = false,
  applyTopSafeArea = true,
  statusBarOverContent = false,
  hideStorefrontMobileHeader = false,
  reportCartCountToNative = false,
  reloadWebWhenTabFocused = false,
  openStorefrontLoginModal = false,
}: Props) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const isFirstCartFocusRef = useRef(true);
  const [canGoBack, setCanGoBack] = useState(false);
  // Initial load is masked by the native splash; subsequent loads keep the
  // previously-painted page visible until the next one finishes (browser-like
  // behaviour), so the AppLoader overlay is never used during normal
  // navigation. It is only re-introduced when the user manually retries
  // after an error (`reload()` flips `loading` true via that code path).
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cfg = getEnvConfig(store.getState().app.country);
  const allowedHostSet = useMemo(() => new Set(cfg.allowedDomains), [cfg.allowedDomains]);
  const insets = useSafeAreaInsets();
  const shellBackgroundColor = statusBarOverContent ? 'transparent' : '#FFFFFF';
  /** Manual top inset replaces SafeAreaView so immersive PDP never paints a white safe-area tray. */
  const paddingTop = statusBarOverContent ? 0 : applyTopSafeArea ? insets.top : 0;

  const injectedJavaScriptBundle = useMemo(() => {
    const parts = [COMBINED_INJECTION];
    if (hideStorefrontMobileHeader) parts.push(STOREFRONT_HIDE_MOBILE_HEADER_INJECTION);
    if (reportCartCountToNative) parts.push(CART_COUNT_BRIDGE_INJECTION);
    if (openStorefrontLoginModal) parts.push(STOREFRONT_OPEN_LOGIN_MODAL_INJECTION);
    return parts.join('\n');
  }, [hideStorefrontMobileHeader, openStorefrontLoginModal, reportCartCountToNative]);

  // Cross-tab navigation channel: when native Search or the Inbox screen asks
  // to drive the Home WebView to a specific storefront path, we surface
  // that request here through Redux. We watch the monotonic sequence
  // number so a duplicate request (same path tapped twice) still triggers
  // a re-navigation. The implementation swaps the WebView's `source.uri`
  // rather than calling `injectJavaScript` because the cold-start case
  // (notification tap launches the app) dispatches the request BEFORE the
  // WebView has mounted; `injectJavaScript` against an unloaded WebView is
  // a silent no-op, but baking the path into the initial source URI works
  // every time. URI swaps still push to the WebView's history so the
  // hardware-back / canGoBack flow keeps working as before.
  const webNavSeq = useAppSelector(state => state.webNav.seq);
  const webNavPendingPath = useAppSelector(state => state.webNav.pendingPath);

  // Snapshot the pending path at mount so a deep link queued before this
  // screen rendered (cold-start notification, splash → tabs hand-off) is
  // applied as the initial URI rather than as a post-mount swap.
  const initialPath = useMemo(() => {
    if (!applyWebNavFromStore) return path;
    const pending = store.getState().webNav.pendingPath;
    return pending && pending.length > 0 ? pending : path;
  }, [applyWebNavFromStore, path]);
  const [currentUri, setCurrentUri] = useState(() =>
    storefrontUri(initialPath, cfg.webBaseUrl),
  );
  const lastKnownUrlRef = useRef(storefrontUri(initialPath, cfg.webBaseUrl));

  const lastAppliedSeqRef = useRef(0);

  React.useEffect(() => {
    lastKnownUrlRef.current = currentUri;
  }, [currentUri]);

  React.useEffect(() => {
    if (!applyWebNavFromStore) return;
    if (store.getState().webNav.pendingPath) {
      dispatch(clearWebNav());
    }
    lastAppliedSeqRef.current = store.getState().webNav.seq;
  }, [applyWebNavFromStore, dispatch]);

  React.useEffect(() => {
    if (!applyWebNavFromStore) return;
    if (webNavSeq <= lastAppliedSeqRef.current) return;
    lastAppliedSeqRef.current = webNavSeq;
    if (!webNavPendingPath) return;
    const targetUri = storefrontUri(webNavPendingPath, cfg.webBaseUrl);
    setCurrentUri(targetUri);
    analytics.track('webview_cross_tab_navigation', {
      target: webNavPendingPath,
    });
    dispatch(clearWebNav());
  }, [
    applyWebNavFromStore,
    cfg.webBaseUrl,
    dispatch,
    webNavPendingPath,
    webNavSeq,
  ]);

  const flushCategoryMegaMenuProbe = useCallback(
    (reason: 'load_end' | 'tab_focus' | 'tab_reselect') => {
      if (!openMobileCategoryMenuOnLoad || tabReselectMode !== 'category') return;
      const rootUri = storefrontUri(path, cfg.webBaseUrl);
      const rk = storefrontUrlComparable(rootUri);
      const live = lastKnownUrlRef.current || currentUri;
      if (!live) return;
      const lk = storefrontUrlComparable(live);
      if (rk !== null && lk !== null && rk !== lk) return;
      webViewRef.current?.injectJavaScript(MOBILE_CATEGORY_MENU_CLICK_JS);
      analytics.track('webview_category_menu_inject', { reason });
    },
    [cfg.webBaseUrl, currentUri, openMobileCategoryMenuOnLoad, path, tabReselectMode],
  );

  const handleTabReselect = useCallback(() => {
    if (!tabReselectMode) return;
    const live = lastKnownUrlRef.current || currentUri;
    if (!live) return;

    const homeRoot = storefrontUri('/', cfg.webBaseUrl);
    let atRoot = false;
    let targetUri = '';

    if (tabReselectMode === 'home') {
      atRoot = isAtRegionalHome(live);
      targetUri = homeRoot;
    } else {
      targetUri = storefrontUri(path, cfg.webBaseUrl);
      const a = storefrontUrlComparable(live);
      const b = storefrontUrlComparable(targetUri);
      atRoot = a !== null && b !== null && a === b;
    }

    if (!atRoot) {
      setCurrentUri(targetUri);
      analytics.track('webview_tab_reselect_snap', {
        mode: tabReselectMode,
        reset: true,
      });
      return;
    }

    if (tabReselectMode === 'category' && openMobileCategoryMenuOnLoad) {
      setTimeout(() => flushCategoryMegaMenuProbe('tab_reselect'), 64);
      analytics.track('webview_tab_reselect_snap', {
        mode: tabReselectMode,
        reopenDrawer: true,
      });
    }
  }, [
    cfg.webBaseUrl,
    currentUri,
    flushCategoryMegaMenuProbe,
    openMobileCategoryMenuOnLoad,
    path,
    tabReselectMode,
  ]);

  React.useEffect(() => {
    if (!tabReselectMode) return;
    const tabNav = navigation as BottomTabNavigationProp<MainTabParamList>;
    return tabNav.addListener('tabPress', handleTabReselect);
  }, [navigation, tabReselectMode, handleTabReselect]);

  useFocusEffect(
    useCallback(() => {
      if (!openMobileCategoryMenuOnLoad || tabReselectMode !== 'category') {
        return undefined;
      }
      let cancelled = false;
      // Short delay lets the native WebView commit the active tab frame; DOM
      // hydration is driven by repeated injection inside MOBILE_CATEGORY_MENU_CLICK_JS.
      const tmid = setTimeout(() => {
        if (!cancelled) flushCategoryMegaMenuProbe('tab_focus');
      }, 72);

      return () => {
        cancelled = true;
        clearTimeout(tmid);
      };
    }, [
      flushCategoryMegaMenuProbe,
      openMobileCategoryMenuOnLoad,
      path,
      tabReselectMode,
    ]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!reloadWebWhenTabFocused) return undefined;

      if (isFirstCartFocusRef.current) {
        isFirstCartFocusRef.current = false;
        return undefined;
      }

      let cancelled = false;
      const frame = requestAnimationFrame(() => {
        if (!cancelled && webViewRef.current) {
          webViewRef.current.reload();
          analytics.track('webview_reload_cart_tab_focus');
        }
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }, [reloadWebWhenTabFocused]),
  );

  React.useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavChange = (nav: WebViewNavigation) => {
    lastKnownUrlRef.current = nav.url;
    setCanGoBack(nav.canGoBack);
    if (!looksCheckoutRelated(nav.url)) return;
    const payment = detectPaymentRedirect(nav.url);
    if (payment.isPaymentCallback) {
      analytics.track('payment_callback_detected', {
        status: payment.status,
      });
    }
  };

  // Safety net: if the WebView never reaches first paint within 15s (slow
  // network, dead host, etc.), drop the native splash and surface retry.
  // Only arm this while this tab is focused — Android throttles background
  // WebViews, so Category/Cart would falsely time out on cold start if all
  // tabs mount at once.
  React.useEffect(() => {
    if (initialLoadDone || !isFocused) return;
    const timer = setTimeout(() => {
      if (!initialLoadDone) {
        hideNativeSplashOnce('safety_timeout_15s');
        setError(prev => prev ?? 'Page load is taking too long. Tap Retry.');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [initialLoadDone, isFocused]);

  const handleWebMessage = async (event: WebViewMessageEvent) => {
    // Handle the first-paint sentinel BEFORE the host filter so a redirect
    // to a payment-gateway page can't accidentally suppress it (and because
    // the message carries no privileged data — it is a one-bit "I painted"
    // signal). This is what dismisses the native splash, replacing the
    // older `onLoadEnd` trigger which fired before first paint and left a
    // white flash for (paint - load) ms.
    try {
      const raw = event.nativeEvent.data;
      if (typeof raw === 'string' && raw.indexOf(FIRST_PAINT_SENTINEL) !== -1) {
        const parsed = JSON.parse(raw) as { type?: unknown };
        if (parsed && parsed.type === FIRST_PAINT_SENTINEL) {
          if (!initialLoadDone) {
            setInitialLoadDone(true);
            hideNativeSplashOnce('webview_first_paint');
          }
          return;
        }
      }
      // Surface the social-login hider's debug pings to the Metro log so we
      // can confirm the injection is firing on each platform during dev.
      // These messages are safe to forward without the host check below
      // because they carry no privileged data.
      if (
        typeof raw === 'string' &&
        raw.indexOf('__dressfair_social_hider_debug__') !== -1
      ) {
        const parsed = JSON.parse(raw) as { type?: unknown; label?: unknown; detail?: unknown };
        if (parsed && parsed.type === '__dressfair_social_hider_debug__') {
          analytics.track('social_login_hider', {
            label: typeof parsed.label === 'string' ? parsed.label : 'unknown',
            detail: typeof parsed.detail === 'string' ? parsed.detail : null,
          });
          return;
        }
      }
    } catch {
      // Fall through to the normal bridge-message path on parse errors.
    }
    // Drop bridge messages that did not originate from a first-party page so
    // a third-party gateway page rendered mid-checkout cannot exfiltrate auth
    // state or coerce in-app navigation.
    const messageOriginHost = safeHost(event.nativeEvent.url);
    if (!messageOriginHost || !allowedHostSet.has(messageOriginHost)) {
      analytics.track('webview_message_dropped_untrusted_origin', {
        host: messageOriginHost ?? 'unknown',
      });
      return;
    }

    const payload = parseBridgeMessage(event.nativeEvent.data);
    if (!payload) {
      analytics.track('webview_message_invalid_payload');
      return;
    }

    try {
      if (payload.type === 'auth') {
        await clearCachedProfile();
        await sessionStore.saveToken(payload.token);
        dispatch(setAuthenticated(true));
        analytics.track('webview_customer_jwt_saved', {
          token_length: payload.token.length,
        });
      } else if (payload.type === 'logout') {
        await sessionStore.clear();
        await clearCachedProfile();
        dispatch(setAuthenticated(false));
      } else if (payload.type === 'open_external') {
        if (isHttpsUrl(payload.url) && isAllowedUrl(payload.url)) {
          webViewRef.current?.injectJavaScript(
            `window.location.href = ${JSON.stringify(payload.url)}; true;`,
          );
          analytics.track('webview_forced_in_app_navigation', { target: payload.url });
        } else {
          const handed = await safeOpenExternalUrl(payload.url);
          analytics.track(
            handed
              ? 'webview_open_external_handoff'
              : 'webview_open_external_blocked_scheme',
            { target: payload.url },
          );
        }
      } else if (payload.type === 'open_settings') {
        analytics.track('webview_open_settings_requested');
        openSettings();
      } else if (payload.type === 'cart_count') {
        dispatch(setCartBadgeQuantity(payload.quantity));
      }
    } catch (error) {
      crashReporter.capture(error, { source: 'WebViewScreen.handleWebMessage' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: shellBackgroundColor, paddingTop }}>
      <AppAsyncState
        isLoading={loading}
        errorMessage={error}
        overlay
        onRetry={() => {
          setError(null);
          setLoading(true);
          webViewRef.current?.reload();
        }}
      >
        <View />
      </AppAsyncState>
      <View style={{ flex: 1 }}>
        <WebView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          ref={webViewRef}
          source={{ uri: currentUri }}
          cacheEnabled
          domStorageEnabled
          javaScriptEnabled
          injectedJavaScript={injectedJavaScriptBundle}
          injectedJavaScriptBeforeContentLoaded={BEFORE_PAGE_SCRIPTS_INJECTION}
          setSupportMultipleWindows={false}
          originWhitelist={['https://*', 'about:blank', 'data:*', 'blob:*']}
          onLoadStart={() => {
            // Intentionally NO setLoading(true) here:
            //  • First load: native splash is still covering the screen.
            //  • Subsequent loads: keep the current page visible during the
            //    transition so we never flash an AppLoader over a working UI
            //    (a slow redirect would otherwise leave the spinner stuck).
            setError(null);
            analytics.track('webview_load_start', { path });
          }}
          onLoadProgress={event => {
            if (loading && event.nativeEvent.progress > 0.25) {
              setLoading(false);
            }
          }}
          onLoadEnd={() => {
            setLoading(false);
            // NOTE: Do NOT hide the native splash here. `onLoadEnd` fires when
            // the network load finishes but BEFORE the WebView has flushed its
            // first paint, which causes a white-flash between logo and content.
            // The splash is now hidden by the FIRST_PAINT_SENTINEL message
            // posted from `injectedJavaScript`. The `safety_timeout_15s`
            // useEffect above remains as a last-resort fallback for pages
            // where the injected JS cannot run (e.g. immediate native error).
            analytics.track('webview_load_end', { path });
            // Belt-and-suspenders re-injection. The `injectedJavaScript` prop
            // is captured by the native WebView at mount time, so a Fast
            // Refresh of the JS bundle does NOT push a new injection into an
            // already-mounted WebView. Imperatively re-running the social
            // login hider on every load guarantees it survives:
            //   • dev workflow Fast Refresh (the original symptom),
            //   • Single-Page-App route changes that don't fire onLoadEnd
            //     again but do still trigger this handler on the first nav,
            //   • Android WebView edge cases where injectedJavaScript runs
            //     before Next.js hydration completes and the observer is
            //     installed on a transient document.
            // The injection is idempotent (guarded by
            // window.__dressfairSocialHiderInstalled) so re-running is free.
            webViewRef.current?.injectJavaScript(HIDE_THIRD_PARTY_LOGIN_INJECTION);
            if (hideStorefrontMobileHeader) {
              webViewRef.current?.injectJavaScript(STOREFRONT_HIDE_MOBILE_HEADER_INJECTION);
            }
            if (reportCartCountToNative) {
              webViewRef.current?.injectJavaScript(CART_COUNT_BRIDGE_INJECTION);
            }
            if (openStorefrontLoginModal) {
              webViewRef.current?.injectJavaScript(STOREFRONT_OPEN_LOGIN_MODAL_INJECTION);
              void setTimeout(() => {
                webViewRef.current?.injectJavaScript(STOREFRONT_OPEN_LOGIN_MODAL_INJECTION);
              }, 980);
              void setTimeout(() => {
                webViewRef.current?.injectJavaScript(STOREFRONT_OPEN_LOGIN_MODAL_INJECTION);
              }, 2820);
            }
            if (openMobileCategoryMenuOnLoad && tabReselectMode === 'category' && isFocused) {
              // Start probing for the mega-menu as soon as the document load
              // event fires; SPA hydration may still lag, handled by retries in MOBILE_CATEGORY_MENU_CLICK_JS.
              setTimeout(() => flushCategoryMegaMenuProbe('load_end'), 0);
            }
          }}
          onNavigationStateChange={onNavChange}
          onMessage={handleWebMessage}
          onError={() => {
            // If the very first load fails, the native splash must still be
            // dropped so the user can see the error UI and retry.
            hideNativeSplashOnce('webview_onError');
            setError('Unable to load page. Please retry.');
          }}
          onShouldStartLoadWithRequest={request => {
            try {
              if (isInternalWebViewUrl(request.url)) {
                return true;
              }
              // Only HTTPS is allowed inside the WebView. Plain HTTP and any
              // exotic scheme (mailto:, tel:, intent:, market:, geo:, etc.) is
              // handed to the OS via a scheme allowlist so the WebView never
              // renders insecure content nor opens untrusted schemes.
              if (!isHttpsUrl(request.url)) {
                void safeOpenExternalUrl(request.url);
                return false;
              }
              const host = safeHost(request.url);
              if (!host) {
                analytics.track('webview_blocked_invalid_url');
                return false;
              }
              if (allowedHostSet.has(host)) {
                if (looksCheckoutRelated(request.url)) {
                  const payment = detectPaymentRedirect(request.url);
                  if (payment.isPaymentCallback) {
                    analytics.track('payment_redirect_started', {
                      status: payment.status,
                    });
                  }
                }
                return true;
              }
              // Cross-domain HTTPS: only render in-WebView when it matches a
              // curated payment-gateway suffix (Tap, HyperPay, Tabby, Tamara,
              // 3DS directory servers). Anything else is handed to the OS
              // browser to close phishing / open-redirect surface area.
              if (isPaymentGatewayHost(host)) {
                analytics.track('webview_payment_gateway_in_app', { host });
                return true;
              }
              analytics.track('webview_external_handoff', { target: request.url });
              void safeOpenExternalUrl(request.url);
              return false;
            } catch {
              analytics.track('webview_blocked_invalid_url');
              return false;
            }
          }}
        />
      </View>
    </View>
  );
}
