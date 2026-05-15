import axios from 'axios';

import { parseCustomerProfileResponse } from '@features/account/parseCustomerProfile';
import { withStorefrontUnauthorizedClear } from '@features/account/storefrontRequest';
import type { CustomerProfileApiResult } from '@features/account/types';
import { clearStoredUserSession } from '@features/auth/authSync';
import { storefrontCheckoutUrl } from '@shared/config/storefrontUrls';
import { analytics } from '@shared/observability/analytics';
import {
  buildStorefrontAuthHeaders,
  buildStorefrontAuthHeadersMultipart,
} from '@shared/network/storefrontAuthHeaders';

const TIMEOUT_MS = 20000;
/** Multipart uploads can be slower; RN `fetch` avoids axios FormData issues with `content://` URIs. */
const MULTIPART_TIMEOUT_MS = 45000;

const customerInfoUrl = (): string =>
  storefrontCheckoutUrl('customer/info');

const customerUpdateUrl = (): string =>
  storefrontCheckoutUrl('update/customer/info');

export const fetchCustomerProfile = async (): Promise<CustomerProfileApiResult> =>
  withStorefrontUnauthorizedClear(
    'storefront_customer_profile_401',
    async () => {
      const headers = await buildStorefrontAuthHeaders();
      const response = await axios.get(customerInfoUrl(), {
        timeout: TIMEOUT_MS,
        headers,
      });
      const data =
        response.data && typeof response.data === 'object'
          ? (response.data as Record<string, unknown>)
          : {};
      return parseCustomerProfileResponse(data);
    },
  );

export type UpdateCustomerProfileFields = {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
};

const parseUpdateEnvelope = (
  data: Record<string, unknown>,
): { success: boolean; message?: string } => {
  const ok =
    data.success === true ||
    data.success === 1 ||
    data.success === '1' ||
    data.success === 'true';
  return {
    success: ok,
    message: typeof data.message === 'string' ? data.message : undefined,
  };
};

/** JSON update (matches native browser POST to `update/customer/info`). */
export const updateCustomerProfileJson = async (
  fields: UpdateCustomerProfileFields,
): Promise<{ success: boolean; message?: string }> =>
  withStorefrontUnauthorizedClear(
    'storefront_customer_update_401',
    async () => {
      const headers = await buildStorefrontAuthHeaders();
      const response = await axios.post(customerUpdateUrl(), fields, {
        timeout: TIMEOUT_MS,
        headers,
      });
      const data =
        response.data && typeof response.data === 'object'
          ? (response.data as Record<string, unknown>)
          : {};
      return parseUpdateEnvelope(data);
    },
  );

/** Flutter `sendMultipartPostRequest`: fields + optional file field `image`. */
export type ProfileImagePayload = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

export const updateCustomerProfileMultipart = async (
  fields: UpdateCustomerProfileFields,
  image?: ProfileImagePayload | null,
): Promise<{ success: boolean; message?: string }> => {
  const headers = await buildStorefrontAuthHeadersMultipart();
  const form = new FormData();
  form.append('first_name', fields.first_name);
  form.append('last_name', fields.last_name);
  form.append('email', fields.email);
  form.append('mobile', fields.mobile);
  if (image?.uri) {
    form.append('image', {
      uri: image.uri,
      name: image.fileName?.trim() || 'profile.jpg',
      type: image.mimeType?.trim() || 'image/jpeg',
    } as unknown as Blob);
  }

  const url = customerUpdateUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MULTIPART_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: form,
      signal: controller.signal,
    });

    if (response.status === 401) {
      analytics.track('customer_token_rejected_clearing_native_session');
      await clearStoredUserSession();
    }

    const text = await response.text();
    let data: Record<string, unknown> = {};
    if (text.length > 0) {
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = {};
      }
    }

    return parseUpdateEnvelope(data);
  } finally {
    clearTimeout(timer);
  }
};
