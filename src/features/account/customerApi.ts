import axios from 'axios';

import { parseCustomerProfileResponse } from '@features/account/parseCustomerProfile';
import { withStorefrontUnauthorizedClear } from '@features/account/storefrontRequest';
import type { CustomerProfileApiResult } from '@features/account/types';
import { storefrontCheckoutUrl } from '@shared/config/storefrontUrls';
import { buildStorefrontAuthHeaders } from '@shared/network/storefrontAuthHeaders';

const TIMEOUT_MS = 20000;

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
      const ok =
        data.success === true ||
        data.success === 1 ||
        data.success === '1' ||
        data.success === 'true';
      return {
        success: ok,
        message: typeof data.message === 'string' ? data.message : undefined,
      };
    },
  );
