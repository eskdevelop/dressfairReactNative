jest.mock('axios');

import axios from 'axios';

import { store } from '@app/store';
import { setApiSession } from '@app/storeSlices/appSlice';
import { productHrefForSku } from '@shared/config/env';

import { fetchSuggestions, searchProductsLp } from './searchApi';

const axiosGet = axios.get as jest.MockedFunction<typeof axios.get>;

const ok = <T,>(data: T) => Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config: {} as never });

describe('searchApi', () => {
  beforeEach(() => {
    axiosGet.mockReset();
    store.dispatch(setApiSession('test-session-token'));
  });

  describe('fetchSuggestions', () => {
    it('builds the correct URL and forwards the merchant + session headers', async () => {
      axiosGet.mockReturnValueOnce(ok({ success: 1, data: [] }));

      await fetchSuggestions('blue dress');

      expect(axiosGet).toHaveBeenCalledTimes(1);
      const [url, config] = axiosGet.mock.calls[0];
      expect(url).toBe(
        'https://backend.dressfair.com/index.php?route=extension/opencart/feed_rest_api.getSearchSuggestions&query=blue%20dress',
      );
      expect(config?.headers).toMatchObject({
        Accept: 'application/json',
        'x-oc-merchant-id': expect.any(String),
        'x-oc-merchant-language': 'en-gb',
        'x-oc-session': 'test-session-token',
      });
    });

    it('classifies rows with sku as products and rows without as queries', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: 1,
          data: [
            { title: 'Maxi Dress' },
            { title: 'Long Maxi Dress - Black', sku: 'C-568BK' },
            { title: '   ' }, // dropped: empty after trim
            { title: 'Mini Dress' },
            { title: 'Backless', sku: '   ' }, // sku trimmed empty -> query
          ],
        }),
      );

      const result = await fetchSuggestions('dress');

      expect(result).toEqual([
        { kind: 'query', title: 'Maxi Dress' },
        { kind: 'product', title: 'Long Maxi Dress - Black', sku: 'C-568BK' },
        { kind: 'query', title: 'Mini Dress' },
        { kind: 'query', title: 'Backless' },
      ]);
    });

    it('returns empty for unsuccessful envelopes (no throw)', async () => {
      axiosGet.mockReturnValueOnce(ok({ success: false, data: [{ title: 'x' }] }));
      await expect(fetchSuggestions('x')).resolves.toEqual([]);
    });

    it('returns empty when the response is not JSON (HTML fallback)', async () => {
      axiosGet.mockReturnValueOnce(ok(null as unknown as Record<string, unknown>));
      await expect(fetchSuggestions('x')).resolves.toEqual([]);
    });

    it('skips the network call for empty queries', async () => {
      const result = await fetchSuggestions('   ');
      expect(result).toEqual([]);
      expect(axiosGet).not.toHaveBeenCalled();
    });
  });

  describe('searchProductsLp', () => {
    it('builds the correct URL with limit / page / simple flags', async () => {
      axiosGet.mockReturnValueOnce(
        ok({ success: true, data: [], total_pages: 1 }),
      );

      await searchProductsLp('dress');

      expect(axiosGet).toHaveBeenCalledTimes(1);
      const [url] = axiosGet.mock.calls[0];
      expect(url).toBe(
        'https://backend.dressfair.com/index.php?route=extension/opencart/rest_api.productsLp&limit=30&page=1&simple=1&search_attribute=dress',
      );
    });

    it('respects the page parameter', async () => {
      axiosGet.mockReturnValueOnce(
        ok({ success: true, data: [], total_pages: 4 }),
      );
      await searchProductsLp('dress', { page: 3 });
      const [url] = axiosGet.mock.calls[0];
      expect(url).toContain('page=3');
    });

    it('parses products and resolves the SKU-based href', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: true,
          data: [
            {
              product_id: 910,
              name: 'Maxi Dress - Blue',
              model: 'C-889BL',
              image: 'https://eskdxb.com/shared-images/C-889/C-889BL/1.webp',
              price: '74.00',
              special: '69.00',
              currency_code: 'AED',
            },
          ],
          total_pages: 2,
        }),
      );

      const { items, lastPage } = await searchProductsLp('dress');

      expect(lastPage).toBe(2);
      expect(items).toEqual([
        {
          productId: '910',
          sku: 'C-889BL',
          name: 'Maxi Dress - Blue',
          price: '74.00',
          specialPrice: '69.00',
          imageUrl: 'https://eskdxb.com/shared-images/C-889/C-889BL/1.webp',
          thumbRelativePath: null,
          currencyCode: 'AED',
          href: '/ae/p/C-889BL',
        },
      ]);
    });

    it('stores thumbRelativePath when the API image is not an absolute URL', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: true,
          data: [
            {
              product_id: 1,
              name: 'Rel Image',
              model: 'R-1',
              image: 'catalog/demo/image.webp',
              price: '10.00',
              currency_code: 'AED',
            },
          ],
          total_pages: 1,
        }),
      );

      const { items } = await searchProductsLp('x');
      expect(items[0].imageUrl).toBe('catalog/demo/image.webp');
      expect(items[0].thumbRelativePath).toBe('catalog/demo/image.webp');
    });

    it('treats absent, zero, or non-discounted special prices as null', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: true,
          data: [
            // Zero special.
            {
              product_id: 1,
              name: 'A',
              model: 'A-1',
              price: '10.00',
              special: '0.00',
              currency_code: 'AED',
            },
            // Special omitted.
            {
              product_id: 2,
              name: 'B',
              model: 'B-2',
              price: '20.00',
              currency_code: 'AED',
            },
            // Special equal to price (live API quirk — not a real discount).
            {
              product_id: 3,
              name: 'C',
              model: 'C-3',
              price: '65.00',
              special: '65.00',
              currency_code: 'AED',
            },
            // Special above price (data error — definitely not a discount).
            {
              product_id: 4,
              name: 'D',
              model: 'D-4',
              price: '50.00',
              special: '60.00',
              currency_code: 'AED',
            },
          ],
        }),
      );

      const { items } = await searchProductsLp('x');
      expect(items.map(item => item.specialPrice)).toEqual([
        null,
        null,
        null,
        null,
      ]);
    });

    it('preserves a genuine discount (special < price)', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: true,
          data: [
            {
              product_id: 5,
              name: 'E',
              model: 'E-5',
              price: '74.00',
              special: '69.00',
              currency_code: 'AED',
            },
          ],
        }),
      );
      const { items } = await searchProductsLp('x');
      expect(items[0].specialPrice).toBe('69.00');
    });

    it('drops products that are missing id or name', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: true,
          data: [
            { product_id: '', name: 'No id', model: 'X' },
            { product_id: 1, name: '', model: 'Y' },
            { product_id: 2, name: 'Valid', model: 'Z' },
          ],
        }),
      );

      const { items } = await searchProductsLp('x');
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe('2');
    });

    it('accepts both success:1 and success:true envelopes', async () => {
      axiosGet.mockReturnValueOnce(
        ok({
          success: 1,
          data: [{ product_id: 1, name: 'A', model: 'A-1', price: '10' }],
        }),
      );
      const result = await searchProductsLp('x');
      expect(result.items).toHaveLength(1);
    });

    it('falls back to lastPage=1 when the envelope omits paging', async () => {
      axiosGet.mockReturnValueOnce(ok({ success: true, data: [] }));
      const { lastPage } = await searchProductsLp('x');
      expect(lastPage).toBe(1);
    });
  });

  describe('productHrefForSku', () => {
    it('produces the UAE product path', () => {
      expect(productHrefForSku('C-568BK', 'UAE')).toBe('/ae/p/C-568BK');
    });

    it('URL-encodes special characters in the SKU', () => {
      expect(productHrefForSku('A B/C', 'UAE')).toBe('/ae/p/A%20B%2FC');
    });

    it('returns null for empty SKUs', () => {
      expect(productHrefForSku('', 'UAE')).toBeNull();
      expect(productHrefForSku('   ', 'UAE')).toBeNull();
    });

    it('honours the country prefix', () => {
      expect(productHrefForSku('X-1', 'OMN')).toBe('/om/p/X-1');
      expect(productHrefForSku('X-1', 'KSA')).toBe('/sa/p/X-1');
    });
  });
});
