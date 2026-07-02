import { parseWebCartItems } from './parseWebCartItems';
import {
  cartContentsMatchNative,
  cartSignature,
  reconcileWebCartSnapshot,
} from './cartSyncUtils';
import type { DeletedCartLine } from './cartDeletedKeys';

const row = (sku: string, optionId: number, quantity = 1, price = 10) => ({
  id: optionId,
  product_option_id: optionId,
  sku,
  name: sku,
  quantity,
  price,
});

const keyMap = (raw: unknown[]): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const line of parseWebCartItems(raw)) out[line.lineKey] = line.quantity;
  return out;
};

describe('cartContentsMatchNative', () => {
  it('does not treat unparseable web rows as matching an empty native cart', () => {
    expect(cartContentsMatchNative([], [{ foo: 'bar', quantity: 2 }])).toBe(false);
  });

  it('detects matching native and web carts (ignoring selection)', () => {
    const raw = [row('A', 2, 2)];
    expect(cartContentsMatchNative(parseWebCartItems(raw), raw)).toBe(true);
  });

  it('detects when web cart still has an extra line', () => {
    const web = [row('A', 2, 2), row('B', 3, 1, 20)];
    expect(cartContentsMatchNative(parseWebCartItems([web[0]]), web)).toBe(false);
  });
});

describe('reconcileWebCartSnapshot', () => {
  it('never wipes a non-empty native cart from an empty web read', () => {
    const native = parseWebCartItems([row('A', 2)]);
    const result = reconcileWebCartSnapshot({
      nativeItems: native,
      rawWebItems: [],
      recentlyDeletedLines: [],
      lastWebCartByKey: keyMap([row('A', 2)]),
      hasWebBaseline: true,
    });
    expect(result.isEmptyWeb).toBe(true);
    expect(result.changed).toBe(false);
    expect(result.items).toEqual(native);
  });

  it('adds a brand-new web line after a native delete without resurrecting ghosts', () => {
    // Deleted A and B natively, then added a new product C via the web modal.
    const deleted: DeletedCartLine[] = [
      { lineKey: 'A::2', deletedAt: Date.now() },
      { lineKey: 'B::3', deletedAt: Date.now() },
    ];
    const web = [row('A', 2), row('B', 3, 1, 20), row('C', 4, 1, 30)];
    const result = reconcileWebCartSnapshot({
      nativeItems: [],
      rawWebItems: web,
      recentlyDeletedLines: deleted,
      // Baseline still knows A and B (native delete never dropped them from web).
      lastWebCartByKey: { 'A::2': 1, 'B::3': 1 },
      hasWebBaseline: true,
    });
    expect(result.items.map(i => i.sku)).toEqual(['C']);
    expect(result.webHasGhosts).toBe(true);
    expect(result.changed).toBe(true);
    // Guard for A and B is kept (they were not deliberately re-added).
    expect(result.nextDeletedLines.map(d => d.lineKey).sort()).toEqual(['A::2', 'B::3']);
  });

  it('re-adds a previously deleted line when its quantity increases (deliberate re-add)', () => {
    const deleted: DeletedCartLine[] = [
      { lineKey: 'A::2', deletedAt: Date.now() },
      { lineKey: 'B::3', deletedAt: Date.now() },
    ];
    // User re-added A via the web modal -> its qty went 1 -> 2. B is an untouched ghost.
    const web = [row('A', 2, 2), row('B', 3, 1, 20)];
    const result = reconcileWebCartSnapshot({
      nativeItems: [],
      rawWebItems: web,
      recentlyDeletedLines: deleted,
      lastWebCartByKey: { 'A::2': 1, 'B::3': 1 },
      hasWebBaseline: true,
    });
    expect(result.items.map(i => i.sku)).toEqual(['A']);
    // A's guard is lifted; B stays guarded.
    expect(result.nextDeletedLines.map(d => d.lineKey)).toEqual(['B::3']);
  });

  it('does not lift the guard on the first snapshot of a session (cold-start safety)', () => {
    const deleted: DeletedCartLine[] = [{ lineKey: 'A::2', deletedAt: Date.now() }];
    const web = [row('A', 2)];
    const result = reconcileWebCartSnapshot({
      nativeItems: [],
      rawWebItems: web,
      recentlyDeletedLines: deleted,
      lastWebCartByKey: {},
      hasWebBaseline: false,
    });
    expect(result.items).toHaveLength(0);
    expect(result.nextDeletedLines.map(d => d.lineKey)).toEqual(['A::2']);
  });

  it('preserves native-only lines the web snapshot has not echoed yet', () => {
    const native = parseWebCartItems([row('X', 9)]);
    const web = [row('A', 2)];
    const result = reconcileWebCartSnapshot({
      nativeItems: native,
      rawWebItems: web,
      recentlyDeletedLines: [],
      lastWebCartByKey: { 'A::2': 1 },
      hasWebBaseline: true,
    });
    expect(result.items.map(i => i.sku).sort()).toEqual(['A', 'X']);
  });

  it('reports no change when the reconciled cart matches native', () => {
    const native = parseWebCartItems([row('A', 2)]);
    const web = [row('A', 2)];
    const result = reconcileWebCartSnapshot({
      nativeItems: native,
      rawWebItems: web,
      recentlyDeletedLines: [],
      lastWebCartByKey: { 'A::2': 1 },
      hasWebBaseline: true,
    });
    expect(result.changed).toBe(false);
    expect(cartSignature(result.items)).toBe(cartSignature(native));
  });
});
