import React from 'react';

import {
  privacyBlocks,
  privacyIsPlaceholder,
  privacyLastUpdated,
  privacyTitle,
} from '../content/privacy';
import { LegalScreen } from './LegalScreen';

export function PrivacyScreen() {
  return (
    <LegalScreen
      title={privacyTitle}
      lastUpdated={privacyLastUpdated}
      blocks={privacyBlocks}
      isPlaceholder={privacyIsPlaceholder}
      webPath="/privacy"
      webEventName="legal_privacy_open_web"
    />
  );
}
