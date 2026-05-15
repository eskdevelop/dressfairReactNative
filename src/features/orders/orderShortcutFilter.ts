import type { Order } from './types';

/** Temu-style order shortcuts from Account → OrderHistory. */
export type OrderHistoryShortcut =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'returns';

/** Single bucket per order (priority avoids double-count on Account badges). */
export function orderShortcutBucket(orderStatus: string): OrderHistoryShortcut | null {
  const s = orderStatus.toLowerCase();

  if (
    s.includes('return') ||
    s.includes('refund') ||
    s.includes('exchang') ||
    s.includes('rma')
  ) {
    return 'returns';
  }
  if (s.includes('deliver') || s.includes('complete') || s === 'completed') {
    return 'delivered';
  }
  if (s.includes('ship')) {
    return 'shipped';
  }
  if (s.includes('process') || s.includes('pack') || s.includes('pick')) {
    return 'processing';
  }
  if (
    s.includes('pend') ||
    s.includes('unpaid') ||
    s.includes('await') ||
    (s.includes('pay') &&
      !s.includes('paid') &&
      !s.includes('paypal') &&
      !s.includes('repay'))
  ) {
    return 'pending_payment';
  }
  return null;
}

export function orderMatchesShortcut(
  orderStatus: string,
  shortcut: OrderHistoryShortcut,
): boolean {
  return orderShortcutBucket(orderStatus) === shortcut;
}

/** Count orders per shortcut (each order contributes to at most one bucket). */
export function countOrdersByShortcut(orders: Order[]): Record<OrderHistoryShortcut, number> {
  const empty: Record<OrderHistoryShortcut, number> = {
    pending_payment: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    returns: 0,
  };
  if (!orders.length) return empty;
  const next = { ...empty };
  for (const o of orders) {
    const b = orderShortcutBucket(o.orderStatus);
    if (b) next[b] += 1;
  }
  return next;
}
