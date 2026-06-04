import { InteractionManager } from 'react-native';

import { store } from '@app/store';
import { prefetchNewArrivalsPage1Query } from '@features/account/useNewArrivalsQuery';
import { prefetchCategoryTreeQuery } from '@features/categories/useCategoryTreeQuery';

let scheduled = false;

/** After Home WebView first paint, prefetch tab data so Cart/Category first visits skip spinners. */
export function scheduleHomeTabWarmPrefetch(): void {
  if (scheduled) return;
  scheduled = true;

  InteractionManager.runAfterInteractions(() => {
    const country = store.getState().app.country;
    void prefetchCategoryTreeQuery(country);
    void prefetchNewArrivalsPage1Query(country);
  });
}
