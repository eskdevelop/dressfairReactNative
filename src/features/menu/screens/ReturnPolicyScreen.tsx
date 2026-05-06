import React from 'react';

import {
  returnPolicyBlocks,
  returnPolicyIsPlaceholder,
  returnPolicyLastUpdated,
  returnPolicyTitle,
} from '../content/returnPolicy';
import { LegalScreen } from './LegalScreen';

export function ReturnPolicyScreen() {
  return (
    <LegalScreen
      title={returnPolicyTitle}
      lastUpdated={returnPolicyLastUpdated}
      blocks={returnPolicyBlocks}
      isPlaceholder={returnPolicyIsPlaceholder}
      webPath="/return-policy"
      webEventName="legal_return_open_web"
    />
  );
}
