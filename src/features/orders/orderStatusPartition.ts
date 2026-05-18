import type { OrderHistoryShortcut } from './orderShortcutFilter';
import type { Order } from './types';

/** Mirrors Flutter `GetOrderStatusController.orderTrackTabs` (excluding "All"). */
export type TrackTabId = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancel' | 'returned';

export const TRACK_TABS: { id: TrackTabId; label: string }[] = [
  { id: 'all', label: 'All orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancel', label: 'Cancel' },
  { id: 'returned', label: 'Returned' },
];

/** Same as Flutter `order.orderStatus.toUpperCase()` on list header. */
export function statusDisplayUpper(raw: string): string {
  return raw.trim().toUpperCase();
}

/**
 * Maps an order to a track sub-tab, mirroring
 * `GetOrderStatusController.getOrderStatus` switch on `orderStatus.toLowerCase()`.
 * `complete` and unknown statuses only appear under "All orders".
 */
export function flutterTrackBucket(orderStatus: string): TrackTabId | null {
  const status = orderStatus.trim().toLowerCase();
  switch (status) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'canceled':
    case 'cancel':
    case 'cancelled':
      return 'cancel';
    case 'returned':
    case 'return':
      return 'returned';
    case 'complete':
      return null;
    default:
      return null;
  }
}

export function partitionOrdersForTrackTabs(orders: Order[]): Record<TrackTabId, Order[]> {
  const result: Record<TrackTabId, Order[]> = {
    all: [...orders],
    pending: [],
    processing: [],
    shipped: [],
    delivered: [],
    cancel: [],
    returned: [],
  };
  for (const order of orders) {
    const bucket = flutterTrackBucket(order.orderStatus);
    if (bucket) {
      result[bucket].push(order);
    }
  }
  return result;
}

/** Account `OrderStatusRow` shortcuts → same tabs as Flutter. */
export function shortcutToTrackTab(shortcut: OrderHistoryShortcut): TrackTabId {
  switch (shortcut) {
    case 'pending_payment':
      return 'pending';
    case 'processing':
      return 'processing';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    case 'returns':
      return 'returned';
  }
}
