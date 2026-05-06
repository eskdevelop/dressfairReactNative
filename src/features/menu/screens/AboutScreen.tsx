import React from 'react';

import {
  aboutBlocks,
  aboutIsPlaceholder,
  aboutLastUpdated,
  aboutTitle,
} from '../content/about';
import { LegalScreen } from './LegalScreen';

export function AboutScreen() {
  return (
    <LegalScreen
      title={aboutTitle}
      lastUpdated={aboutLastUpdated}
      blocks={aboutBlocks}
      isPlaceholder={aboutIsPlaceholder}
      webPath="/about-us"
      webEventName="legal_about_open_web"
    />
  );
}
