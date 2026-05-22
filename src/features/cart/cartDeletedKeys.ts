/** Ignore stale web re-adds of natively deleted lines for this window. */
export const CART_DELETED_LINE_TTL_MS = 10 * 60 * 1000;

export type DeletedCartLine = {
  lineKey: string;
  deletedAt: number;
};

export function pruneDeletedLines(entries: DeletedCartLine[], now = Date.now()): DeletedCartLine[] {
  return entries.filter(e => now - e.deletedAt < CART_DELETED_LINE_TTL_MS);
}

export function deletedLineKeySet(entries: DeletedCartLine[], now = Date.now()): Set<string> {
  return new Set(pruneDeletedLines(entries, now).map(e => e.lineKey));
}

export function mergeDeletedLines(
  existing: DeletedCartLine[],
  lineKeys: string[],
  now = Date.now(),
): DeletedCartLine[] {
  const byKey = new Map(pruneDeletedLines(existing, now).map(e => [e.lineKey, e]));
  for (const lineKey of lineKeys) {
    byKey.set(lineKey, { lineKey, deletedAt: now });
  }
  return [...byKey.values()];
}
