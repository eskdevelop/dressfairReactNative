import React from 'react';

import { useAppSelector } from '@app/hooks';
import {
  privacyBlocks,
  privacyIsPlaceholder,
  privacyLastUpdated,
  privacyTitle,
} from '../content/privacy';
import { LegalScreen } from './LegalScreen';
import { privacyPolicyUrl } from '@shared/config/env';

export function PrivacyScreen() {
  const country = useAppSelector(s => s.app.country);
  return (
    <LegalScreen
      title={privacyTitle}
      lastUpdated={privacyLastUpdated}
      blocks={privacyBlocks}
      isPlaceholder={privacyIsPlaceholder}
      absoluteWebUrl={privacyPolicyUrl(country)}
      webEventName="legal_privacy_open_web"
    />
  );
}
