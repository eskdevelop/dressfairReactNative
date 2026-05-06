// Jest setup — global mocks shared across the suite.

// AsyncStorage uses native code that is unavailable in the Jest environment.
// The package ships an in-memory mock that mirrors the real API closely
// enough for our store-layer tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-secure-store wraps a native EventEmitter that is unavailable in the
// Jest environment. The session/auth code paths only ever call the simple
// get/set/delete helpers, so an in-memory shim is sufficient for tests.
jest.mock('expo-secure-store', () => {
  const memory = new Map<string, string>();
  return {
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    getItemAsync: jest.fn(async (key: string) => memory.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      memory.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      memory.delete(key);
    }),
  };
});
