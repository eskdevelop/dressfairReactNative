import {
  parsePaymentMethodsForTest,
  paymentMethodsUrlCandidatesForTest,
} from './checkoutApi';

describe('fetchPaymentMethods parsing', () => {
  it('parses Flutter success envelope', () => {
    const raw = {
      success: true,
      data: [
        { id: 1, name: 'Cash On Delivery', class_name: 'cod', logo: 'https://cdn/logo.png' },
        { id: 2, name: 'Card', class_name: 'card' },
      ],
    };
    expect(parsePaymentMethodsForTest(raw)).toEqual([
      { id: 1, name: 'Cash On Delivery', className: 'cod', logo: 'https://cdn/logo.png' },
      { id: 2, name: 'Card', className: 'card' },
    ]);
  });

  it('ignores invalid rows', () => {
    const raw = {
      success: true,
      data: [{ id: 0, name: '' }, { id: 3, name: 'COD' }],
    };
    expect(parsePaymentMethodsForTest(raw)).toEqual([{ id: 3, name: 'COD' }]);
  });

  it('includes Flutter payment-methods path', () => {
    const urls = paymentMethodsUrlCandidatesForTest();
    expect(urls.some(u => u.endsWith('/api/rest/payment-methods'))).toBe(true);
  });
});
