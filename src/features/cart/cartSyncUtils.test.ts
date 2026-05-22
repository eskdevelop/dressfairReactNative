import { parseWebCartItems } from './parseWebCartItems';
import {
  cartContentsMatchNative,
  filterStaleWebCartRows,
  shouldApplyWebCartSnapshot,
} from './cartSyncUtils';
import type { DeletedCartLine } from './cartDeletedKeys';

describe('cartSyncUtils', () => {
  it('detects matching native and web carts', () => {
    const raw = [
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 2, price: 10 },
    ];
    const native = parseWebCartItems(raw);
    expect(cartContentsMatchNative(native, raw)).toBe(true);
  });

  it('detects when web cart still has deleted line', () => {
    const web = [
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 2, price: 10 },
      { id: 2, product_option_id: 3, sku: 'B', name: 'B', quantity: 1, price: 20 },
    ];
    const native = parseWebCartItems([web[0]]);
    expect(cartContentsMatchNative(native, web)).toBe(false);
  });

  it('rejects empty web snapshot when native has items', () => {
    const native = parseWebCartItems([
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 1, price: 10 },
    ]);
    expect(shouldApplyWebCartSnapshot(native, [], null)).toBe(false);
  });

  it('filters recently deleted lines from web snapshot', () => {
    const web = [
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 1, price: 10 },
      { id: 2, product_option_id: 3, sku: 'B', name: 'B', quantity: 1, price: 20 },
    ];
    const deleted: DeletedCartLine[] = [{ lineKey: 'B::3', deletedAt: Date.now() }];
    const filtered = filterStaleWebCartRows(web, deleted);
    expect(filtered).toHaveLength(1);
    expect((filtered[0] as { sku: string }).sku).toBe('A');
  });

  it('allows web snapshot with more lines for home add-to-cart merge', () => {
    const web = [
      { id: 1, product_option_id: 2, sku: 'A', name: 'A', quantity: 1, price: 10 },
      { id: 2, product_option_id: 3, sku: 'B', name: 'B', quantity: 1, price: 20 },
    ];
    const native = parseWebCartItems([web[0]]);
    expect(shouldApplyWebCartSnapshot(native, web, null)).toBe(true);
  });
});
