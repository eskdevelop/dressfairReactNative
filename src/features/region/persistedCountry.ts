import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CountryCode } from '@shared/config/env';

const STORAGE_KEY = '@dressfair/persisted_country_v1';

const ALL: CountryCode[] = ['UAE', 'OMN', 'KSA'];

function isCountryCode(v: string): v is CountryCode {
  return ALL.includes(v as CountryCode);
}

export async function loadPersistedCountry(): Promise<CountryCode | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const t = raw?.trim();
    if (!t || !isCountryCode(t)) return null;
    return t;
  } catch {
    return null;
  }
}

export async function savePersistedCountry(country: CountryCode): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, country);
}
