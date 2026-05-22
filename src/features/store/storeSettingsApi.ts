import axios from 'axios';

import type { CountryCode } from '@shared/config/env';
import { countryIsoCode2 } from '@shared/config/env';
import { storefrontStoreSettingUrlCandidates } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

const REQUEST_MS = 15_000;

/** Axios may return SPA HTML when `/api/rest/*` is routed to Next instead of OpenCart. */
function responseLooksLikeHtmlDocument(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const t = raw.trimStart().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html') || t.startsWith('<!--');
}

function extractSettingData(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.success === false) return null;
  const d = o.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) return d as Record<string, unknown>;
  return null;
}

export type StoreCurrencySettings = {
  currencyCode: string;
  currencyTitle: string;
  shippingAmount: string;
  freeShippingLimit: string;
};

function trimSlashLocal(s: string): string {
  return s.replace(/\/+$/, '');
}

/**
 * Resolve OC JSON origin from `allowed_countries[].base_url` for the active ISO2
 * (Flutter `CountryConfigModel.allowedCountries`).
 */
export function parseCheckoutOriginOverride(
  data: Record<string, unknown>,
  country: CountryCode,
): string | null {
  const targetIso = countryIsoCode2(country);
  const raw = data.allowed_countries;
  if (!Array.isArray(raw)) return null;
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const iso = String(o.iso_code_2 ?? o.isoCode2 ?? '').trim().toUpperCase();
    if (iso !== targetIso) continue;
    const host = String(o.base_url ?? o.baseUrl ?? '').trim();
    if (!host) return null;
    const withScheme = /^https?:\/\//i.test(host) ? host : `https://${host}`;
    try {
      return trimSlashLocal(new URL(withScheme).origin);
    } catch {
      return null;
    }
  }
  return null;
}

/** Flutter `CountryConfigModel.fromJson` currency + shipping fields (`config_model.dart`). */
export function parseStoreSettingCurrency(data: Record<string, unknown>): StoreCurrencySettings | null {
  const currencyCode = String(data.currency_code ?? data.currencyCode ?? '').trim();
  const currencyTitle = String(data.currency_title ?? data.currencyTitle ?? '').trim();
  if (!currencyCode && !currencyTitle) return null;
  return {
    currencyCode,
    currencyTitle,
    shippingAmount: String(data.shipping_amount ?? data.shippingAmount ?? '').trim(),
    freeShippingLimit: String(data.free_shipping_limit ?? data.freeShippingLimit ?? '').trim(),
  };
}

/**
 * OpenCart `country_id` for `GET /api/rest/store/cities/{id}` (`CountryConfigModel.country_id`).
 * Prefer `allowed_countries[]` row matching active ISO2; else root `country_id`.
 */
export function parseStoreSettingOpenCartCountryId(
  data: Record<string, unknown>,
  country: CountryCode,
): string | null {
  const targetIso = countryIsoCode2(country);
  const raw = data.allowed_countries;
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const iso = String(o.iso_code_2 ?? o.isoCode2 ?? '').trim().toUpperCase();
      if (iso !== targetIso) continue;
      const id = o.country_id ?? o.countryId;
      if (id !== undefined && id !== null && String(id).trim().length > 0) {
        return String(id);
      }
    }
  }
  const root = data.country_id ?? data.countryId;
  if (root !== undefined && root !== null && String(root).trim().length > 0) {
    return String(root);
  }
  return null;
}

export type StoreSettingsFetchResult = {
  ok: boolean;
  settings?: StoreCurrencySettings;
  /** Flutter `countryConfig.countryId` for provinces list. */
  openCartCountryId?: string | null;
  /** When store/setting lists this region in `allowed_countries`, prefer this OC origin. */
  checkoutApiOriginOverride?: string | null;
  error?: string;
};

/**
 * Flutter `GET {base}/api/rest/store/setting` (see `session_repository.dart` / `AppUrl.settingApi`).
 * Tries the same storefront origins as mobile-categories until JSON succeeds.
 */
export async function fetchStoreSettingsFromNetwork(country: CountryCode): Promise<StoreSettingsFetchResult> {
  const urls = storefrontStoreSettingUrlCandidates(country);
  const headers = await buildStorefrontAuthHeaders();
  let lastError = 'Store settings request failed';

  type AttemptOk = { idx: number; url: string; res: Awaited<ReturnType<typeof axios.get<unknown>>> };
  type AttemptFail = { idx: number; url: string; error: string };

  const attempts = await Promise.all(
    urls.map(async (url, idx): Promise<AttemptOk | AttemptFail> => {
      try {
        const res = await axios.get<unknown>(url, {
          headers,
          timeout: REQUEST_MS,
          validateStatus: status => typeof status === 'number' && status < 600,
        });
        return { idx, url, res };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Network error';
        return { idx, url, error: message };
      }
    }),
  );

  attempts.sort((a, b) => a.idx - b.idx);

  for (const attempt of attempts) {
    if ('error' in attempt) {
      lastError = attempt.error;
      continue;
    }
    const { res, url } = attempt;
    const raw = res.data;
    if (res.status !== 200) {
      lastError = `${url} HTTP ${String(res.status)}`;
      continue;
    }
    if (responseLooksLikeHtmlDocument(raw)) {
      lastError = `${url} returned HTML`;
      continue;
    }
    const row = extractSettingData(raw);
    if (!row) {
      lastError = `${url} unexpected JSON shape`;
      continue;
    }
    const settings = parseStoreSettingCurrency(row);
    if (!settings) {
      lastError = `${url} missing currency in setting payload`;
      continue;
    }
    const checkoutApiOriginOverride = parseCheckoutOriginOverride(row, country);
    const openCartCountryId = parseStoreSettingOpenCartCountryId(row, country);
    return { ok: true, settings, checkoutApiOriginOverride, openCartCountryId };
  }

  return { ok: false, error: lastError };
}
