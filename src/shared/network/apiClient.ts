import type { AxiosError } from 'axios';
import axios from 'axios';

import { store } from '@app/store';
import {
  OC_MERCHANT_ID,
  OC_MERCHANT_LANGUAGE,
} from '@features/api/sessionApi';
import { getEnvConfig } from '@shared/config/env';

export type ApiFailure = {
  message: string;
  statusCode?: number;
};

const initialCountry = store.getState().app.country;

export const apiClient = axios.create({
  baseURL: getEnvConfig(initialCountry).apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use(config => {
  const state = store.getState();
  const country = state.app.country;
  config.baseURL = getEnvConfig(country).apiBaseUrl;

  // OpenCart REST plugin requires merchant identification on every call. We
  // attach it unconditionally so any future axios consumer (cart, profile)
  // that piggy-backs on this client gets the headers for free.
  config.headers.set('x-oc-merchant-id', OC_MERCHANT_ID);
  config.headers.set('x-oc-merchant-language', OC_MERCHANT_LANGUAGE);

  const token = state.app.apiSession?.token;
  if (token && token.length > 0) {
    config.headers.set('x-oc-session', token);
  }

  return config;
});

apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const normalized: ApiFailure = {
      message: error.message || 'Unexpected network error',
      statusCode: error.response?.status,
    };
    return Promise.reject(normalized);
  },
);
