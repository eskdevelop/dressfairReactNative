import type { RootState } from '@app/store';

export function selectUnreadNotificationCount(state: RootState): number {
  return state.notifications.items.filter(i => !i.read).length;
}
