import { store } from '@app/store';
import { setNotifications } from '@app/storeSlices/notificationsSlice';

import type { StoredNotification } from './notificationStore';
import { notificationStore } from './notificationStore';

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Side-effecting wrapper around `notificationStore` that also keeps the
// Redux mirror in sync. Every screen that wants to read or mutate the
// inbox should go through this module so we never end up with Redux and
// AsyncStorage drifting out of agreement.
export const notificationInbox = {
  async hydrateFromStorage(): Promise<StoredNotification[]> {
    const list = await notificationStore.list();
    store.dispatch(setNotifications(list));
    return list;
  },

  async record(input: {
    id?: string;
    title: string;
    body: string;
    path?: string;
    read?: boolean;
    data?: Record<string, unknown>;
  }): Promise<void> {
    const item: StoredNotification = {
      id: input.id && input.id.length > 0 ? input.id : generateId(),
      title: input.title.length > 0 ? input.title : 'DressFair',
      body: input.body,
      receivedAt: Date.now(),
      read: input.read ?? false,
      path: input.path,
      data: input.data,
    };
    const next = await notificationStore.add(item);
    store.dispatch(setNotifications(next));
  },

  async markRead(id: string): Promise<void> {
    const next = await notificationStore.markRead(id);
    store.dispatch(setNotifications(next));
  },

  async markAllRead(): Promise<void> {
    const next = await notificationStore.markAllRead();
    store.dispatch(setNotifications(next));
  },

  async remove(id: string): Promise<void> {
    const next = await notificationStore.remove(id);
    store.dispatch(setNotifications(next));
  },

  async clearAll(): Promise<void> {
    await notificationStore.clearAll();
    store.dispatch(setNotifications([]));
  },
};
