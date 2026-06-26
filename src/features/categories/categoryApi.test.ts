import { buildProductsListingUrl } from './categoryApi';
import { parseListingProductRow } from './categoryModel';

jest.mock('@shared/config/storefrontUrls', () => ({
  storefrontStoreUrl: (path: string) => `https://9711694.ecomplug.com/api/rest/store/${path}`,
}));

describe('buildProductsListingUrl', () => {
  it('builds unfiltered page-1 URL', () => {
    expect(buildProductsListingUrl('w-cloth', 1)).toBe(
      'https://9711694.ecomplug.com/api/rest/store/products/w-cloth?page=1',
    );
  });

  it('builds filtered URL with sort, color, and size', () => {
    const url = buildProductsListingUrl('w-cloth', 1, {
      sort: 'new',
      order: 'desc',
      color: 'Green',
      size: 'XL',
    });
    expect(url).toContain('products/w-cloth?page=1');
    expect(url).toContain('sort=new');
    expect(url).toContain('order=desc');
    expect(url).toContain('color=Green');
    expect(url).toContain('size=XL');
  });
});

describe('parseListingProductRow offer price array', () => {
  it('parses dressfair.com product with price array', () => {
    const row = parseListingProductRow({
      product_id: 2991,
      product_sku: 'H-104LG',
      currency_code: 'AED',
      name: 'Three Piece Zipper Closure Hoodie Sportswear Set',
      name_ar: 'test',
      product_category: { id: 15, name: 'Women Clothings', name_ar: 'x' },
      price: [{ normal_price: 120, offer_price: 76, has_offer: true }],
      images: [{ image: 'productimages/foo.webp', isMain: 1 }],
    });

    expect(row).not.toBeNull();
    expect(row?.productSku).toBe('H-104LG');
    expect(row?.price.hasOffer).toBe(true);
    expect(row?.price.offerPrice).toBe(76);
    expect(row?.price.normalPrice).toBe(120);
  });
});
