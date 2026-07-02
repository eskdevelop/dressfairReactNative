import type { DeletedCartLine } from './cartDeletedKeys';
import { pruneDeletedLines } from './cartDeletedKeys';
import type { CartLineItem } from './cartTypes';
import { parseWebCartItems } from './parseWebCartItems';

type CartSigRow = { k: string; q: number; p: number };

function toSigRows(items: CartLineItem[]): CartSigRow[] {
  return items
    .map(row => ({ k: row.lineKey, q: row.quantity, p: row.price }))
    .sort((a, b) => a.k.localeCompare(b.k));
}

/** Stable content signature (ignores selection) so we can detect real changes. */
export function cartSignature(items: CartLineItem[]): string {
  return JSON.stringify(toSigRows(items));
}

/** Compare native cart lines with a web snapshot (ignores selection). */
export function cartContentsMatchNative(
  nativeItems: CartLineItem[],
  rawWebItems: unknown[],
): boolean {
  const incoming = parseWebCartItems(rawWebItems);
  if (Array.isArray(rawWebItems) && rawWebItems.length > 0 && incoming.length === 0) {
    return false;
  }
  return cartSignature(nativeItems) === cartSignature(incoming);
}

export type WebCartReconcileInput = {
  /** Current native cart (source of truth for deletes + selection). */
  nativeItems: CartLineItem[];
  /** Raw `localStorage.cart` payload posted by the web bridge. */
  rawWebItems: unknown[];
  /** Lines removed natively — blocked from re-adding until a deliberate re-add. */
  recentlyDeletedLines: DeletedCartLine[];
  /** Quantities from the previous web snapshot this session (key → qty). */
  lastWebCartByKey: Record<string, number>;
  /**
   * Whether we've already recorded a web snapshot this session. The first
   * snapshot after launch is treated as a baseline (no deliberate-add detection)
   * so a persisted delete-guard is not lifted by a stale cold-start read.
   */
  hasWebBaseline: boolean;
  now?: number;
};

export type WebCartReconcileResult = {
  /** New native cart to persist (selection preserved from previous native lines). */
  items: CartLineItem[];
  /** Delete-guard after lifting deliberate web re-adds. */
  nextDeletedLines: DeletedCartLine[];
  /** Web quantities to remember for the next diff. */
  nextWebCartByKey: Record<string, number>;
  /** True when `items` differs from the incoming native cart. */
  changed: boolean;
  /** Web still holds guarded (deleted) lines → native should rewrite web storage. */
  webHasGhosts: boolean;
  /** Web reported an empty cart (never wipes a non-empty native cart). */
  isEmptyWeb: boolean;
};

/**
 * Single deterministic web → native reconcile.
 *
 * Rules:
 * - Empty web reads never wipe a non-empty native cart (stale/among-load reads).
 * - A web line is a *deliberate* add when it is new, or its quantity increased,
 *   versus the previous web snapshot — this lifts the delete-guard for that line
 *   so a user who re-adds a previously deleted product sees it again.
 * - Any line still in the delete-guard is filtered out (ghosts the storefront SPA
 *   kept in memory after a native delete cannot resurrect themselves).
 * - Native-only lines (added natively, not yet echoed by web) are preserved.
 */
export function reconcileWebCartSnapshot(
  input: WebCartReconcileInput,
): WebCartReconcileResult {
  const now = input.now ?? Date.now();
  const nativeItems = input.nativeItems;
  const incoming = parseWebCartItems(input.rawWebItems);
  const lastWeb = input.lastWebCartByKey ?? {};

  const nextWebCartByKey: Record<string, number> = {};
  for (const line of incoming) {
    nextWebCartByKey[line.lineKey] = line.quantity;
  }

  const prunedGuard = pruneDeletedLines(input.recentlyDeletedLines, now);

  // Empty web read: keep native as-is, never wipe from a stale/among-load read.
  if (incoming.length === 0) {
    return {
      items: nativeItems,
      nextDeletedLines: prunedGuard,
      nextWebCartByKey,
      changed: false,
      webHasGhosts: false,
      isEmptyWeb: true,
    };
  }

  // Lift the delete-guard for deliberate re-adds (new key or increased quantity).
  let guard = prunedGuard;
  if (input.hasWebBaseline && guard.length > 0) {
    const deliberate = new Set<string>();
    for (const line of incoming) {
      const prevQty = lastWeb[line.lineKey];
      if (prevQty == null || line.quantity > prevQty) {
        deliberate.add(line.lineKey);
      }
    }
    if (deliberate.size > 0) {
      guard = guard.filter(entry => !deliberate.has(entry.lineKey));
    }
  }

  const guardSet = new Set(guard.map(entry => entry.lineKey));
  const prevSelectionByKey = new Map(
    nativeItems.map(row => [row.lineKey, row.isSelected]),
  );

  const survivingWeb = incoming
    .filter(line => !guardSet.has(line.lineKey))
    .map(line => ({
      ...line,
      isSelected: prevSelectionByKey.get(line.lineKey) ?? line.isSelected ?? true,
    }));

  const webKeys = new Set(incoming.map(line => line.lineKey));
  const nativeOnly = nativeItems.filter(row => !webKeys.has(row.lineKey));

  const items = [...survivingWeb, ...nativeOnly];
  const webHasGhosts = incoming.some(line => guardSet.has(line.lineKey));

  return {
    items,
    nextDeletedLines: guard,
    nextWebCartByKey,
    changed: cartSignature(items) !== cartSignature(nativeItems),
    webHasGhosts,
    isEmptyWeb: false,
  };
}
