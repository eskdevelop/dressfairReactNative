import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dressfair_notifications_v1';
const MAX_STORED = 200;

export type StoredNotification = {
  // Stable identifier used for de-duplication and per-row deletion. We
  // generate one ourselves rather than relying on the OS request id so the
  // same id survives across the foreground/background/cold-start paths.
  id: string;
  title: string;
  body: string;
  receivedAt: number;
  read: boolean;
  // Optional storefront path the notification deep-links to. Validated /
  // sanitised by the notification router before it lands here, so a stored
  // path is always safe to feed to the WebView.
  path?: string;
  // Raw payload kept for forward-compatibility (analytics, future filters).
  data?: Record<string, unknown>;
};

export const notificationStore = {
  async list(): Promise<StoredNotification[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      // Be defensive about the shape — older versions of the app may have
      // written a different schema, and AsyncStorage corruption is rare but
      // not impossible. Drop entries that don't look like StoredNotification.
      return parsed.filter(
        (item): item is StoredNotification =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.body === 'string' &&
          typeof item.receivedAt === 'number' &&
          typeof item.read === 'boolean',
      );
    } catch {
      return [];
    }
  },

  async add(item: StoredNotification): Promise<StoredNotification[]> {
    const current = await notificationStore.list();
    // De-dupe by id and cap the inbox length so the AsyncStorage payload
    // can't grow unbounded for long-lived users (200 items ≈ tens of KB).
    const next = [item, ...current.filter(existing => existing.id !== item.id)].slice(
      0,
      MAX_STORED,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async markRead(id: string): Promise<StoredNotification[]> {
    const current = await notificationStore.list();
    const next = current.map(item =>
      item.id === id ? { ...item, read: true } : item,
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async markAllRead(): Promise<StoredNotification[]> {
    const current = await notificationStore.list();
    const next = current.map(item => ({ ...item, read: true }));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async remove(id: string): Promise<StoredNotification[]> {
    const current = await notificationStore.list();
    const next = current.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
