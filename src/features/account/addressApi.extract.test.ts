import { extractCustomerAddressIdFromSaveEnvelope } from '@features/account/addressApi';

describe('extractCustomerAddressIdFromSaveEnvelope', () => {
  it('reads top-level customer_address_id', () => {
    expect(
      extractCustomerAddressIdFromSaveEnvelope({
        success: true,
        customer_address_id: 42,
      }),
    ).toBe(42);
  });

  it('finds id nested under data.address', () => {
    expect(
      extractCustomerAddressIdFromSaveEnvelope({
        success: true,
        data: {
          address: { customer_address_id: '99' },
        },
      }),
    ).toBe(99);
  });

  it('walks arrays of address rows', () => {
    expect(
      extractCustomerAddressIdFromSaveEnvelope({
        success: true,
        data: {
          addresses: [{ address_id: 7 }],
        },
      }),
    ).toBe(7);
  });
});
