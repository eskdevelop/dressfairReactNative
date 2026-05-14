export type CustomerAddressRecord = {
  id: number;
  customerId: number;
  address: string;
  cityId: number;
  cityAreaId: number;
  isDefault: number;
  cityName?: string;
  areaName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerProfile = {
  id: number;
  firstname: string;
  lastname: string;
  mobile: string;
  email: string;
  image: string;
  addresses: CustomerAddressRecord[];
  /** Optional storefront wallet / marketing fields */
  creditBalanceLabel?: string;
  couponsOffersLabel?: string;
};

export type CustomerProfileApiResult =
  | { ok: true; profile: CustomerProfile }
  | { ok: false; message?: string };

export type StoreCityRecord = {
  id: number;
  countryId: number;
  name: string;
  nameAr: string;
};

export type StoreAreaRecord = {
  id: number;
  cityId: number;
  name: string;
  nameAr: string;
};
