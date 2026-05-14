// Expo config plugin: true edge-to-edge status bar on Android — transparent bar +
// disable the OS contrast scrim that paints a solid light strip behind icons.
//
// Without `enforceStatusBarContrast=false`, Android 10+ draws a protective
// background behind status icons even when statusBarColor is "transparent".
//
// Regenerated native projects pick this up via `expo prebuild` / `expo run:android`.
const { withAndroidStyles } = require('@expo/config-plugins');

/** @type {Array<[string, string, Record<string, string> | undefined]>} */
const ITEMS = [
  ['android:statusBarColor', '@android:color/transparent', undefined],
  ['android:windowDrawsSystemBarBackgrounds', 'true', undefined],
  ['android:enforceStatusBarContrast', 'false', { 'tools:targetApi': '29' }],
];

module.exports = function withAndroidStatusBarEdge(config) {
  return withAndroidStyles(config, cfg => {
    const styles = cfg.modResults?.resources?.style;
    if (!Array.isArray(styles)) return cfg;

    const appTheme = styles.find(s => s?.$?.name === 'AppTheme');
    if (!appTheme) return cfg;

    if (!Array.isArray(appTheme.item)) {
      appTheme.item = [];
    }

    for (const [name, value, extraAttrs] of ITEMS) {
      const existing = appTheme.item.find(i => i?.$?.name === name);
      if (existing) {
        existing._ = value;
        continue;
      }
      appTheme.item.push({
        $: extraAttrs ? { name, ...extraAttrs } : { name },
        _: value,
      });
    }
    return cfg;
  });
};
