// Google Sign-In pulls AppCheckCore (Swift), which needs module maps on
// GoogleUtilities + RecaptchaInterop when linked as static libraries.
// Without this, `pod install` fails on EAS with exit code 1.
const { withPodfile } = require('@expo/config-plugins');

const MARKER = '# dressfair: google-signin modular headers';

module.exports = function withGoogleSignInModularHeaders(config) {
  return withPodfile(config, cfg => {
    if (cfg.modResults.contents.includes(MARKER)) {
      return cfg;
    }

    cfg.modResults.contents = cfg.modResults.contents.replace(
      /(platform :ios[^\n]*\n)/,
      `$1${MARKER}\nuse_modular_headers!\n`,
    );
    return cfg;
  });
};
