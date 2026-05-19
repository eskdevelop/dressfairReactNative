import {
  customerAvatarFallbackLetter,
  customerAvatarUri,
  normalizeAddressIsDefault,
  parseCustomerProfileResponse,
} from '@features/account/parseCustomerProfile';

describe('normalizeAddressIsDefault', () => {
  it('treats boolean true and common string/number shapes as default', () => {
    expect(normalizeAddressIsDefault(true)).toBe(1);
    expect(normalizeAddressIsDefault(false)).toBe(0);
    expect(normalizeAddressIsDefault(1)).toBe(1);
    expect(normalizeAddressIsDefault(0)).toBe(0);
    expect(normalizeAddressIsDefault('1')).toBe(1);
    expect(normalizeAddressIsDefault('true')).toBe(1);
    expect(normalizeAddressIsDefault('2')).toBe(0);
  });
});

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
      expect(r.profile.addresses[0]?.isDefault).toBe(1);
    }
  });

  it('maps is_default when API sends boolean true', () => {
    const body = {
      success: true,
      data: {
        id: 1,
        firstname: 'A',
        lastname: 'B',
        email: '',
        mobile: '',
        image: '',
        addresses: [
          {
            id: 10,
            customer_id: 1,
            address: 'Street',
            city_id: 2,
            city_area_id: 3,
            is_default: true,
          },
        ],
      },
    };
    const r = parseCustomerProfileResponse(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.profile.addresses[0]?.isDefault).toBe(1);
  });

  it('maps default key when is_default is absent (OpenCart-style)', () => {
    const body = {
      success: true,
      data: {
        id: 1,
        firstname: 'A',
        lastname: 'B',
        email: '',
        mobile: '',
        image: '',
        addresses: [
          {
            id: 11,
            customer_id: 1,
            address: 'Here',
            city_id: 2,
            city_area_id: 3,
            default: '1',
          },
        ],
      },
    };
    const r = parseCustomerProfileResponse(body);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.profile.addresses[0]?.isDefault).toBe(1);
  });

  it('uses profile-level default_address_id when per-address is_default is missing', () => {
    const body = {
      success: true,
      data: {
        id: 1,
        firstname: 'A',
        lastname: 'B',
        email: '',
        mobile: '',
        image: '',
        default_address_id: '22',
        addresses: [
          {
            id: 21,
            customer_id: 1,
            address: 'Old',
            city_id: 1,
            city_area_id: 1,
          },
          {
            id: 22,
            customer_id: 1,
            address: 'New',
            city_id: 2,
            city_area_id: 3,
          },
        ],
      },
    };
    const r = parseCustomerProfileResponse(body);
    expect(r.ok).toBe(true);
    if (r.ok) {
      const d = r.profile.addresses.find(a => a.id === 22);
      const o = r.profile.addresses.find(a => a.id === 21);
      expect(d?.isDefault).toBe(1);
      expect(o?.isDefault).toBe(0);
      expect(r.profile.addresses[0]?.id).toBe(22);
    }
  });

  it('reads default from nested default_address object id', () => {
    const body = {
      success: true,
      data: {
        id: 1,
        firstname: 'A',
        lastname: 'B',
        email: '',
        mobile: '',
        image: '',
        default_address: { id: 99, address: 'X' },
        addresses: [
          {
            customer_address_id: 98,
            customer_id: 1,
            address: 'A',
            city_id: 1,
            city_area_id: 1,
          },
          {
            customer_address_id: 99,
            customer_id: 1,
            address: 'B',
            city_id: 1,
            city_area_id: 2,
          },
        ],
      },
    };
    const r = parseCustomerProfileResponse(body);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.profile.addresses.find(a => a.id === 99)?.isDefault).toBe(1);
      expect(r.profile.addresses.find(a => a.id === 98)?.isDefault).toBe(0);
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

describe('customerAvatarFallbackLetter', () => {
  it('uses first name then last name then email letter', () => {
    expect(
      customerAvatarFallbackLetter({
        firstname: 'Ada',
        lastname: 'Lovelace',
        email: 'ada@example.com',
      }),
    ).toBe('A');
    expect(
      customerAvatarFallbackLetter({
        firstname: '',
        lastname: 'Lovelace',
        email: '',
      }),
    ).toBe('L');
    expect(
      customerAvatarFallbackLetter({
        firstname: '',
        lastname: '',
        email: 'namepk61@gmail.com',
      }),
    ).toBe('N');
  });

  it('returns ? when nothing usable', () => {
    expect(customerAvatarFallbackLetter(null)).toBe('?');
    expect(
      customerAvatarFallbackLetter({
        firstname: '',
        lastname: '',
        email: '@@@',
      }),
    ).toBe('?');
  });
});
