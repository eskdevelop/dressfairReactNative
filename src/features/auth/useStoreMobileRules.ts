import { useMemo } from 'react';

import { useAppSelector } from '@app/hooks';
import type { CountryCode } from '@shared/config/env';

import {
  resolveMobileDialCode,
  resolveNationalMobileLength,
} from './authTypes';

export type StoreMobileRules = {
  country: CountryCode;
  dialCode: string;
  nationalLength: number;
};

/** Dial code + national digit limit from store/setting with env fallbacks. */
export function useStoreMobileRules(): StoreMobileRules {
  const country = useAppSelector(s => s.app.country) as CountryCode;
  const storeDialCode = useAppSelector(s => s.app.storeMobileDialCode);
  const storeNationalLength = useAppSelector(s => s.app.storeMobileNationalLength);

  return useMemo(
    () => ({
      country,
      dialCode: resolveMobileDialCode(country, storeDialCode),
      nationalLength: resolveNationalMobileLength(country, storeNationalLength),
    }),
    [country, storeDialCode, storeNationalLength],
  );
}
