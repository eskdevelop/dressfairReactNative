import type { DeletedCartLine } from './cartDeletedKeys';
import { deletedLineKeySet } from './cartDeletedKeys';
import type { CartLineItem } from './cartTypes';
import { cartLineKey, parseWebCartItems } from './parseWebCartItems';

type CartSigRow = { k: string; q: number; p: number };

function toSigRows(items: CartLineItem[]): CartSigRow[] {
  return items
    .map(row => ({ k: row.lineKey, q: row.quantity, p: row.price }))
    .sort((a, b) => a.k.localeCompare(b.k));
}

function rawRowLineKey(row: Record<string, unknown>): string | null {
  const sku = typeof row.sku === 'string' ? row.sku.trim() : '';
  const optionRaw = row.product_option_id ?? row.productOptionId;
  const optionId = typeof optionRaw === 'number' ? optionRaw : Number(optionRaw);
  if (!sku || !Number.isFinite(optionId) || optionId <= 0) return null;
  return cartLineKey(sku, optionId);
}

/** Drop rows web is trying to re-add after a native delete. */
export function filterStaleWebCartRows(
  rawItems: unknown[],
  recentlyDeletedLines: DeletedCartLine[],
): unknown[] {
  if (!Array.isArray(rawItems)) return [];
  const deleted = deletedLineKeySet(recentlyDeletedLines);
  if (deleted.size === 0) return rawItems;
  return rawItems.filter(row => {
    if (!row || typeof row !== 'object') return false;
    const key = rawRowLineKey(row as Record<string, unknown>);
    return key ? !deleted.has(key) : true;
  });
}

/** Compare native cart lines with a web snapshot (ignores selection). */
export function cartContentsMatchNative(
  nativeItems: CartLineItem[],
  rawWebItems: unknown[],
): boolean {
  const incoming = parseWebCartItems(rawWebItems);
  return JSON.stringify(toSigRows(nativeItems)) === JSON.stringify(toSigRows(incoming));
}

/**
 * Web → native sync rules:
 * - Native deletes win over stale web reads (fewer web lines).
 * - Empty web reads never wipe a non-empty native cart.
 * - Pending native writes only accept a matching web echo.
 */
export function shouldApplyWebCartSnapshot(
  nativeItems: CartLineItem[],
  rawWebItems: unknown[],
  pendingWebWriteAt: number | null,
): boolean {
  const incoming = parseWebCartItems(rawWebItems);

  if (pendingWebWriteAt) {
    return cartContentsMatchNative(nativeItems, rawWebItems);
  }

  if (incoming.length === 0 && nativeItems.length > 0) {
    return false;
  }

  if (incoming.length < nativeItems.length) {
    return false;
  }

  return true;
}
