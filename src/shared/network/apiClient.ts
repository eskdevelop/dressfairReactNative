import type { AxiosError } from 'axios';
import axios from 'axios';

import { store } from '@app/store';
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
  const country = store.getState().app.country;
  config.baseURL = getEnvConfig(country).apiBaseUrl;
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
