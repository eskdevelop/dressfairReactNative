import type { CountryCode } from '@shared/config/env';

export type AuthCustomerSummary = {
  id?: string | number;
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
};

export type AuthSuccessPayload = {
  success: true;
  token: string;
  customer?: AuthCustomerSummary;
  message?: string;
};

export type AuthFailurePayload = {
  success: false;
  message?: string;
  error?: string;
};

export type AuthApiResult = AuthSuccessPayload | AuthFailurePayload;

export type RegisterFields = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
};

export const COUNTRY_MOBILE_CODE: Record<CountryCode, string> = {
  UAE: '971',
  OMN: '968',
  KSA: '966',
};

export function mobileCodeForCountry(country: CountryCode): string {
  return COUNTRY_MOBILE_CODE[country];
}

export function fullMobileNumber(country: CountryCode, digits: string): string {
  const trimmed = digits.replace(/\D/g, '');
  return `${mobileCodeForCountry(country)}${trimmed}`;
}
