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

/** Fallback national digit count when store/setting does not provide one. */
export const COUNTRY_MOBILE_NATIONAL_LENGTH: Record<CountryCode, number> = {
  UAE: 9,
  OMN: 8,
  KSA: 9,
};

export function mobileCodeForCountry(country: CountryCode): string {
  return COUNTRY_MOBILE_CODE[country];
}

export function resolveMobileDialCode(
  country: CountryCode,
  fromSettings?: string | null,
): string {
  const fromApi = fromSettings?.replace(/\D/g, '').trim();
  if (fromApi && fromApi.length > 0) return fromApi;
  return mobileCodeForCountry(country);
}

export function resolveNationalMobileLength(
  country: CountryCode,
  fromSettings?: number | null,
): number {
  if (fromSettings != null && Number.isFinite(fromSettings) && fromSettings > 0) {
    return Math.floor(fromSettings);
  }
  return COUNTRY_MOBILE_NATIONAL_LENGTH[country];
}

export function fullMobileNumber(
  country: CountryCode,
  digits: string,
  dialCodeOverride?: string | null,
): string {
  const code = resolveMobileDialCode(country, dialCodeOverride);
  const trimmed = digits.replace(/\D/g, '');
  if (trimmed.startsWith(code)) return trimmed;
  if (trimmed.startsWith('0')) return `${code}${trimmed.slice(1)}`;
  return `${code}${trimmed}`;
}

export function clampNationalMobileDigits(digits: string, maxLength: number): string {
  return digits.replace(/\D/g, '').slice(0, Math.max(1, maxLength));
}

export function isValidNationalMobileLength(digits: string, requiredLength: number): boolean {
  const n = digits.replace(/\D/g, '').length;
  return n === requiredLength;
}

/** National digits for split country-code + phone inputs (WhatsApp login, address form). */
export function nationalMobileDigits(
  country: CountryCode,
  fullPhone: string,
  dialCodeOverride?: string | null,
): string {
  const digits = fullPhone.replace(/\D/g, '');
  if (!digits) return '';
  const code = resolveMobileDialCode(country, dialCodeOverride);
  if (digits.startsWith(code)) return digits.slice(code.length);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

/** Human-readable phone for OTP screens — e.g. +971 33 091 89520 */
export function formatAuthPhoneDisplay(fullPhone: string): string {
  const digits = fullPhone.replace(/\D/g, '');
  if (!digits) return '';

  const codes = Object.values(COUNTRY_MOBILE_CODE).sort((a, b) => b.length - a.length);
  for (const code of codes) {
    if (!digits.startsWith(code)) continue;
    const national = digits.slice(code.length);
    if (national.length >= 9) {
      const part1 = national.slice(0, 2);
      const part2 = national.slice(2, 5);
      const part3 = national.slice(5, 9);
      const rest = national.slice(9);
      const tail = rest.length > 0 ? ` ${rest}` : '';
      return `+${code} ${part1} ${part2} ${part3}${tail}`.trim();
    }
    return `+${code} ${national}`.trim();
  }

  return `+${digits}`;
}
