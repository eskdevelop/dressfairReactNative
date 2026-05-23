import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useAppSelector } from '@app/hooks';
import { colors, radii, spacing } from '@app/theme/tokens';
import { openWebPath } from '@navigation/navigationRef';
import { AppDeleteDialog } from '@shared/ui/AppDeleteDialog';
import { analytics } from '@shared/observability/analytics';
import { crashReporter } from '@shared/observability/crash';

import { notificationInbox } from './notificationInbox';
import type { StoredNotification } from './notificationStore';

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return '';
  }
};

export function NotificationsInboxScreen() {
  const items = useAppSelector(state => state.notifications.items);
  const hydrated = useAppSelector(state => state.notifications.hydrated);
  const [deleteTarget, setDeleteTarget] = useState<StoredNotification | null>(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  // Re-hydrate every time the tab gains focus so a push that arrived while
  // the user was on a different tab is reflected immediately when they come
  // back. The runtime listeners already update Redux for foreground pushes,
  // but background-arrival writes only land in AsyncStorage until the next
  // hydrate, so a focus-driven hydrate keeps the list eventually consistent.
  useFocusEffect(
    useCallback(() => {
      void notificationInbox.hydrateFromStorage().catch(error => {
        crashReporter.capture(error, {
          source: 'NotificationsInboxScreen.hydrate',
        });
      });
    }, []),
  );

  const onRefresh = useCallback(async () => {
    try {
      await notificationInbox.hydrateFromStorage();
    } catch (error) {
      crashReporter.capture(error, {
        source: 'NotificationsInboxScreen.refresh',
      });
    }
  }, []);

  const onPressItem = useCallback((item: StoredNotification) => {
    analytics.track('notification_inbox_item_opened', {
      id: item.id,
      hadPath: Boolean(item.path),
      wasUnread: !item.read,
    });
    void notificationInbox.markRead(item.id).catch(error => {
      crashReporter.capture(error, {
        source: 'NotificationsInboxScreen.markRead',
      });
    });
    if (item.path && item.path.length > 0) {
      openWebPath(item.path);
    }
  }, []);

  const onDeleteItem = useCallback((item: StoredNotification) => {
    setDeleteTarget(item);
  }, []);

  const confirmDeleteItem = useCallback(() => {
    const item = deleteTarget;
    if (!item) return;
    setDeleteTarget(null);
    analytics.track('notification_inbox_item_deleted', { id: item.id });
    void notificationInbox.remove(item.id).catch(error => {
      crashReporter.capture(error, { source: 'NotificationsInboxScreen.remove' });
    });
  }, [deleteTarget]);

  const onMarkAllRead = useCallback(() => {
    analytics.track('notification_inbox_mark_all_read', { count: items.length });
    void notificationInbox.markAllRead().catch(error => {
      crashReporter.capture(error, {
        source: 'NotificationsInboxScreen.markAllRead',
      });
    });
  }, [items.length]);

  const onClearAll = useCallback(() => {
    if (items.length === 0) return;
    setClearAllConfirm(true);
  }, [items.length]);

  const confirmClearAll = useCallback(() => {
    setClearAllConfirm(false);
    analytics.track('notification_inbox_clear_all', { count: items.length });
    void notificationInbox.clearAll().catch(error => {
      crashReporter.capture(error, { source: 'NotificationsInboxScreen.clearAll' });
    });
  }, [items.length]);

  const unreadCount = useMemo(
    () => items.reduce((acc, item) => (item.read ? acc : acc + 1), 0),
    [items],
  );

  const renderItem = useCallback(
    ({ item }: { item: StoredNotification }) => (
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: item.read ? colors.background : '#FFF7ED',
        }}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Notification: ${item.title}`}
          onPress={() => onPressItem(item)}
          onLongPress={() => onDeleteItem(item)}
          style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radii.pill,
              backgroundColor: item.read ? '#F3F4F6' : colors.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="notifications"
              size={18}
              color={item.read ? colors.textMuted : '#FFFFFF'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: colors.textPrimary,
                  fontWeight: item.read ? '500' : '700',
                }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginLeft: spacing.sm,
                }}
              >
                {formatRelativeTime(item.receivedAt)}
              </Text>
            </View>
            {item.body.length > 0 ? (
              <Text
                style={{
                  color: colors.textMuted,
                  marginTop: spacing.xs,
                }}
                numberOfLines={3}
              >
                {item.body}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: spacing.sm,
                gap: spacing.lg,
              }}
            >
              {item.path ? (
                <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '600' }}>
                  Tap to view
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => onDeleteItem(item)}
                accessibilityRole="button"
                accessibilityLabel="Delete notification"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: colors.danger, fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    ),
    [onDeleteItem, onPressItem],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.textPrimary,
            }}
          >
            Notifications
          </Text>
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'You are all caught up'}
          </Text>
        </View>
        {items.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            {unreadCount > 0 ? (
              <TouchableOpacity onPress={onMarkAllRead} accessibilityRole="button">
                <Text style={{ color: colors.brand, fontWeight: '600' }}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onClearAll} accessibilityRole="button">
              <Text style={{ color: colors.danger }}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color={colors.textMuted}
          />
          <Text
            style={{
              color: colors.textPrimary,
              fontWeight: '600',
              marginTop: spacing.md,
            }}
          >
            {hydrated ? 'No notifications yet' : 'Loading…'}
          </Text>
          {hydrated ? (
            <Text
              style={{
                color: colors.textMuted,
                marginTop: spacing.xs,
                textAlign: 'center',
              }}
            >
              Order updates and announcements will appear here, even when you
              are offline.
            </Text>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
              tintColor={colors.brand}
            />
          }
        />
      )}

      <AppDeleteDialog
        visible={deleteTarget !== null}
        message="This notification will be removed from your inbox."
        confirmLabel="Delete"
        onConfirm={confirmDeleteItem}
        onCancel={() => setDeleteTarget(null)}
      />

      <AppDeleteDialog
        visible={clearAllConfirm}
        message="All notifications will be permanently removed from your inbox."
        confirmLabel="Clear all"
        onConfirm={confirmClearAll}
        onCancel={() => setClearAllConfirm(false)}
      />
    </SafeAreaView>
  );
}
