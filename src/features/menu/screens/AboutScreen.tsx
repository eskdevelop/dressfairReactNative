import React, { useCallback } from 'react';

import { useAppSelector } from '@app/hooks';
import { confirmOpenAccountDeletion } from '@features/account/openAccountDeletion';
import type { CountryCode } from '@shared/config/env';

import {
  aboutBlocks,
  aboutIsPlaceholder,
  aboutLastUpdated,
  aboutTitle,
} from '../content/about';
import { LegalScreen } from './LegalScreen';

export function AboutScreen() {
  const country = useAppSelector(s => s.app.country) as CountryCode;

  const onBuriedDelete = useCallback(() => {
    confirmOpenAccountDeletion(country);
  }, [country]);

  return (
    <LegalScreen
      title={aboutTitle}
      lastUpdated={aboutLastUpdated}
      blocks={aboutBlocks}
      isPlaceholder={aboutIsPlaceholder}
      webPath="/about-us"
      webEventName="legal_about_open_web"
      buriedLink={{ label: 'Request account deletion', onPress: onBuriedDelete }}
    />
  );
}
