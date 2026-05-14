import {
  customerAvatarUri,
  parseCustomerProfileResponse,
} from '@features/account/parseCustomerProfile';

describe('parseCustomerProfileResponse', () => {
  it('maps a successful data envelope with addresses', () => {
    const body = {
      success: true,
      data: {
        id: 410,
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
        mobile: '971500000000',
        image: '',
        addresses: [
          {
            id: 1,
            customer_id: 410,
            address: 'Street 1',
            city_id: 2,
            city_area_id: 3,
            is_default: 1,
            city: { name: 'Dubai', name_ar: '', country_id: 1, id: 2 },
            area: { name: 'Marina', name_ar: '', city_id: 2, id: 3 },
          },
        ],
      },
    };
    const r = parseCustomerProfileResponse(body);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.profile.id).toBe(410);
      expect(r.profile.firstname).toBe('Ada');
      expect(r.profile.addresses.length).toBe(1);
      expect(r.profile.addresses[0]?.cityName).toBe('Dubai');
    }
  });

  it('returns failure when success is false', () => {
    expect(
      parseCustomerProfileResponse({
        success: false,
        message: 'Nope',
      }).ok,
    ).toBe(false);
  });
});

describe('customerAvatarUri', () => {
  it('joins relative paths to the CDN base', () => {
    const u = customerAvatarUri(
      { image: 'profile/abc.jpg' },
      'https://cdn.example.com/',
    );
    expect(u).toBe('https://cdn.example.com/profile/abc.jpg');
  });

  it('returns absolute URLs unchanged', () => {
    expect(
      customerAvatarUri(
        { image: 'https://other.com/x.png' },
        'https://cdn.example.com',
      ),
    ).toBe('https://other.com/x.png');
  });
});
