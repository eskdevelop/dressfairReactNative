// Expo config plugin: disables Android's automatic translucent contrast scrim
// drawn behind the system navigation buttons (back / home / recents) in
// edge-to-edge mode. With this off, the bottom tab bar's white background
// (set via `paddingBottom: insets.bottom` in MainTabs) shows through cleanly.
//
// The /android folder is gitignored and regenerated on every prebuild, so we
// patch styles.xml here instead of editing it directly.
const { withAndroidStyles } = require('@expo/config-plugins');

const ITEM_NAME = 'android:enforceNavigationBarContrast';

module.exports = function withNoNavBarContrast(config) {
  return withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults?.resources?.style;
    if (!Array.isArray(styles)) return cfg;

    const appTheme = styles.find((s) => s?.$?.name === 'AppTheme');
    if (!appTheme) return cfg;

    if (!Array.isArray(appTheme.item)) {
      appTheme.item = [];
    }

    const existing = appTheme.item.find((i) => i?.$?.name === ITEM_NAME);
    if (existing) {
      existing._ = 'false';
    } else {
      appTheme.item.push({
        $: { name: ITEM_NAME, 'tools:targetApi': '29' },
        _: 'false',
      });
    }
    return cfg;
  });
};
