import React from 'react';

import {
  termsBlocks,
  termsIsPlaceholder,
  termsLastUpdated,
  termsTitle,
} from '../content/terms';
import { LegalScreen } from './LegalScreen';

export function TermsScreen() {
  return (
    <LegalScreen
      title={termsTitle}
      lastUpdated={termsLastUpdated}
      blocks={termsBlocks}
      isPlaceholder={termsIsPlaceholder}
      webPath="/terms"
      webEventName="legal_terms_open_web"
    />
  );
}
