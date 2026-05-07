jest.mock('@navigation/navigationRef', () => ({
  openWebPath: jest.fn(),
}));

jest.mock('./expoPushAvailability', () => ({
  shouldUseExpoNotifications: jest.fn(),
}));

const mockLinkingState: {
  initialUrl: string | null;
  initialUrlError: Error | null;
} = {
  initialUrl: null,
  initialUrlError: null,
};

jest.mock('expo-linking', () => ({
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  getInitialURL: jest.fn(() =>
    mockLinkingState.initialUrlError
      ? Promise.reject(mockLinkingState.initialUrlError)
      : Promise.resolve(mockLinkingState.initialUrl),
  ),
}));

const mockNotificationsState: {
  lastResponse: unknown | null;
  lastResponseError: Error | null;
} = {
  lastResponse: null,
  lastResponseError: null,
};

const mockAddNotificationResponseReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));
const mockAddNotificationReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));

jest.mock(
  'expo-notifications',
  () => ({
    addNotificationResponseReceivedListener: mockAddNotificationResponseReceivedListener,
    addNotificationReceivedListener: mockAddNotificationReceivedListener,
    getLastNotificationResponseAsync: jest.fn(() =>
      mockNotificationsState.lastResponseError
        ? Promise.reject(mockNotificationsState.lastResponseError)
        : Promise.resolve(mockNotificationsState.lastResponse),
    ),
    // Foreground banner handler — the runtime registers this on every mount
    // so the OS shows alerts while the app is in the foreground. The test
    // suite never asserts against it; a no-op is enough to satisfy the call.
    setNotificationHandler: jest.fn(),
  }),
  { virtual: true },
);

import { openWebPath } from '@navigation/navigationRef';
import { shouldUseExpoNotifications } from './expoPushAvailability';
import { startNotificationRuntime } from './notificationRuntime';

const openWebPathMock = openWebPath as jest.MockedFunction<typeof openWebPath>;
const shouldUseExpoNotificationsMock =
  shouldUseExpoNotifications as jest.MockedFunction<typeof shouldUseExpoNotifications>;

const flushPromises = () => new Promise(setImmediate);

const buildNotificationResponse = (path: string) => ({
  notification: {
    request: {
      content: {
        data: { type: 'web_route', path },
      },
    },
  },
});

describe('startNotificationRuntime cold-start coordination', () => {
  beforeEach(() => {
    openWebPathMock.mockReset();
    mockAddNotificationResponseReceivedListener.mockClear();
    mockAddNotificationReceivedListener.mockClear();
    mockLinkingState.initialUrl = null;
    mockLinkingState.initialUrlError = null;
    mockNotificationsState.lastResponse = null;
    mockNotificationsState.lastResponseError = null;
  });

  it('routes to the notification path when both notification and link are present', async () => {
    shouldUseExpoNotificationsMock.mockReturnValue(true);
    mockNotificationsState.lastResponse = buildNotificationResponse('/order/notif');
    mockLinkingState.initialUrl = 'https://www.dressfair.com/order/link';

    startNotificationRuntime();
    await flushPromises();

    expect(openWebPathMock).toHaveBeenCalledTimes(1);
    expect(openWebPathMock).toHaveBeenCalledWith('/order/notif');
  });

  it('falls back to the universal link when no notification was tapped', async () => {
    shouldUseExpoNotificationsMock.mockReturnValue(true);
    mockNotificationsState.lastResponse = null;
    mockLinkingState.initialUrl = 'https://www.dressfair.com/order/link';

    startNotificationRuntime();
    await flushPromises();

    expect(openWebPathMock).toHaveBeenCalledTimes(1);
    expect(openWebPathMock).toHaveBeenCalledWith('/order/link');
  });

  it('does not navigate when both sources resolve to home', async () => {
    shouldUseExpoNotificationsMock.mockReturnValue(true);
    mockNotificationsState.lastResponse = null;
    mockLinkingState.initialUrl = null;

    startNotificationRuntime();
    await flushPromises();

    expect(openWebPathMock).not.toHaveBeenCalled();
  });

  it('skips notifications when expo-notifications is unavailable', async () => {
    shouldUseExpoNotificationsMock.mockReturnValue(false);
    mockLinkingState.initialUrl = 'https://www.dressfair.com/order/link';

    startNotificationRuntime();
    await flushPromises();

    expect(mockAddNotificationResponseReceivedListener).not.toHaveBeenCalled();
    expect(openWebPathMock).toHaveBeenCalledWith('/order/link');
  });

  it('swallows individual cold-start errors without crashing', async () => {
    shouldUseExpoNotificationsMock.mockReturnValue(true);
    mockNotificationsState.lastResponseError = new Error('boom');
    mockLinkingState.initialUrl = 'https://www.dressfair.com/order/link';

    startNotificationRuntime();
    await flushPromises();

    expect(openWebPathMock).toHaveBeenCalledWith('/order/link');
  });
});
