jest.mock('axios');

jest.mock('./apiSessionStore', () => ({
  apiSessionStore: {
    saveToken: jest.fn(),
    getToken: jest.fn(),
    clear: jest.fn(),
  },
}));

import axios from 'axios';

import { store } from '@app/store';
import { setApiSession } from '@app/storeSlices/appSlice';

import { apiSessionStore } from './apiSessionStore';
import {
  bootstrapSession,
  hydrateSessionFromStorage,
  OC_MERCHANT_ID,
} from './sessionApi';

const axiosGet = axios.get as jest.MockedFunction<typeof axios.get>;
const mockedSaveToken =
  apiSessionStore.saveToken as jest.MockedFunction<
    typeof apiSessionStore.saveToken
  >;
const mockedGetToken =
  apiSessionStore.getToken as jest.MockedFunction<
    typeof apiSessionStore.getToken
  >;

const ok = <T,>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as never,
});

describe('sessionApi', () => {
  beforeEach(() => {
    axiosGet.mockReset();
    mockedSaveToken.mockReset();
    mockedGetToken.mockReset();
    mockedSaveToken.mockResolvedValue(undefined);
    mockedGetToken.mockResolvedValue(null);
    store.dispatch(setApiSession(null));
  });

  describe('bootstrapSession', () => {
    it('hits rest_api.session with the merchant id and persists the token', async () => {
      axiosGet.mockResolvedValueOnce(ok({ success: 1, data: { session: 'tok-123' } }));

      const result = await bootstrapSession();

      expect(result).toBe('tok-123');
      expect(axiosGet).toHaveBeenCalledTimes(1);
      const [url, config] = axiosGet.mock.calls[0];
      expect(url).toBe(
        'https://backend.dressfair.com/index.php?route=extension/opencart/rest_api.session',
      );
      expect(config?.headers).toMatchObject({
        'x-oc-merchant-id': OC_MERCHANT_ID,
      });
      expect(mockedSaveToken).toHaveBeenCalledWith('tok-123');
      expect(store.getState().app.apiSession.token).toBe('tok-123');
    });

    it('retries once when the first response has no token', async () => {
      axiosGet
        .mockResolvedValueOnce(ok({ success: 1, data: {} }))
        .mockResolvedValueOnce(ok({ success: 1, data: { session: 'tok-2' } }));

      const result = await bootstrapSession();

      expect(result).toBe('tok-2');
      expect(axiosGet).toHaveBeenCalledTimes(2);
      expect(mockedSaveToken).toHaveBeenCalledWith('tok-2');
    });

    it('returns null and never throws when axios rejects', async () => {
      axiosGet.mockRejectedValueOnce(new Error('boom'));

      const result = await bootstrapSession();

      expect(result).toBeNull();
      expect(mockedSaveToken).not.toHaveBeenCalled();
      expect(store.getState().app.apiSession.token).toBeNull();
    });

    it('returns null and skips persistence when both attempts come back empty', async () => {
      axiosGet
        .mockResolvedValueOnce(ok({ success: 1, data: {} }))
        .mockResolvedValueOnce(ok({ success: 1, data: {} }));

      const result = await bootstrapSession();

      expect(result).toBeNull();
      expect(mockedSaveToken).not.toHaveBeenCalled();
    });
  });

  describe('hydrateSessionFromStorage', () => {
    it('mirrors a stored token into Redux', async () => {
      mockedGetToken.mockResolvedValueOnce('cached-tok');

      const result = await hydrateSessionFromStorage();

      expect(result).toBe('cached-tok');
      expect(store.getState().app.apiSession.token).toBe('cached-tok');
    });

    it('returns null when SecureStore is empty', async () => {
      mockedGetToken.mockResolvedValueOnce(null);

      const result = await hydrateSessionFromStorage();

      expect(result).toBeNull();
    });

    it('swallows SecureStore errors', async () => {
      mockedGetToken.mockRejectedValueOnce(new Error('secure store offline'));

      const result = await hydrateSessionFromStorage();

      expect(result).toBeNull();
    });
  });
});
