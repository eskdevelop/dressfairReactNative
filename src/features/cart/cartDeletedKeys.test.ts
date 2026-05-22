import {
  deletedLineKeySet,
  mergeDeletedLines,
  pruneDeletedLines,
  CART_DELETED_LINE_TTL_MS,
} from './cartDeletedKeys';

describe('cartDeletedKeys', () => {
  it('prunes expired deleted lines', () => {
    const now = Date.now();
    const entries = [
      { lineKey: 'A::1', deletedAt: now - CART_DELETED_LINE_TTL_MS - 1 },
      { lineKey: 'B::2', deletedAt: now },
    ];
    expect(pruneDeletedLines(entries, now)).toHaveLength(1);
    expect(deletedLineKeySet(entries, now).has('B::2')).toBe(true);
  });

  it('merges new deleted keys', () => {
    const merged = mergeDeletedLines([{ lineKey: 'A::1', deletedAt: 1 }], ['B::2'], 2);
    expect(merged.map(e => e.lineKey).sort()).toEqual(['A::1', 'B::2']);
  });
});
