import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'dressfair_token';
const PUSH_TOKEN_KEY = 'dressfair_push_token';

export const sessionStore = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async clear(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },
  async savePushToken(token: string): Promise<void> {
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  },
  async getPushToken(): Promise<string | null> {
    return AsyncStorage.getItem(PUSH_TOKEN_KEY);
  },
};
