import { fetchProductDetail } from './productDetailApi';
import {
  getCachedProductDetail,
  prefetchProductDetail,
  rememberProductDetail,
} from './productDetailCache';

jest.mock('./productDetailApi', () => ({
  fetchProductDetail: jest.fn(),
}));

const fetchProductDetailMock = fetchProductDetail as jest.MockedFunction<typeof fetchProductDetail>;

const detail = {
  productId: 1,
  productGroupId: 1,
  availableQty: 10,
  sku: 'SKU-1',
  currencyCode: 'AED',
  name: 'Test Product',
  color: 'Black',
  price: {
    normalPrice: 50,
    hasSale: false,
    hasOffer: false,
    hasBundle: false,
    hasNormal: true,
  },
  images: ['img.jpg'],
  sizeOptions: [],
  colorOptions: [],
};

describe('productDetailCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached detail synchronously after prefetch', async () => {
    fetchProductDetailMock.mockResolvedValue({ ok: true, detail });

    expect(getCachedProductDetail('SKU-1')).toBeNull();

    await prefetchProductDetail('SKU-1');

    expect(getCachedProductDetail('SKU-1')).toEqual(detail);
    expect(fetchProductDetailMock).toHaveBeenCalledTimes(1);
  });

  it('dedupes in-flight prefetch requests', async () => {
    const sku2 = { ...detail, sku: 'SKU-2', productId: 2 };
    fetchProductDetailMock.mockResolvedValue({ ok: true, detail: sku2 });

    const first = prefetchProductDetail('SKU-2');
    const second = prefetchProductDetail('SKU-2');
    await Promise.all([first, second]);

    expect(fetchProductDetailMock).toHaveBeenCalledTimes(1);
  });

  it('rememberProductDetail stores detail in memory', () => {
    rememberProductDetail(detail);
    expect(getCachedProductDetail('SKU-1')).toEqual(detail);
  });
});
