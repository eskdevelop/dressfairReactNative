import type { LegalBlock } from './legalBlock';

// Native Privacy Policy copy. Mirrors the legally reviewed text on
// dressfair.com/privacy. When the website copy changes, update the blocks
// below and bump `privacyLastUpdated`.
export const privacyTitle = 'Privacy Policy';

export const privacyLastUpdated = 'Last updated: 06 February 2026';

export const privacyIsPlaceholder = false;

export const privacyBlocks: LegalBlock[] = [
  { kind: 'h', text: 'Information We Collect' },
  { kind: 'p', text: 'We may collect the following information when you use our website:' },
  {
    kind: 'li',
    text:
      'Personal Information: name, email address, phone number, shipping address, and payment information.',
  },
  {
    kind: 'li',
    text:
      'Non-Personal Information: browser type, operating system, pages visited on the website, and browsing activity within the site.',
  },
  {
    kind: 'li',
    text:
      'Payment Information: credit / debit card details are collected only during a transaction; we do not store your card information on our servers for security reasons.',
  },

  { kind: 'h', text: 'How We Use Your Information' },
  { kind: 'p', text: 'Your personal information may be used for the following purposes:' },
  { kind: 'li', text: 'Processing orders, shipping, and delivery.' },
  { kind: 'li', text: 'Communicating with you regarding your orders or inquiries.' },
  {
    kind: 'li',
    text: 'Sending promotional offers, newsletters, and updates if you are subscribed.',
  },
  { kind: 'li', text: 'Improving the website experience and analyzing site usage.' },

  { kind: 'h', text: 'Sharing Your Information' },
  {
    kind: 'p',
    text:
      'We will not share your personal information with third parties except in the following cases:',
  },
  { kind: 'li', text: 'With authorized distributors to facilitate shipping and delivery.' },
  {
    kind: 'li',
    text: 'If required by law or requested by authorized governmental authorities.',
  },

  { kind: 'h', text: 'Data Protection' },
  {
    kind: 'p',
    text:
      'We implement standard security measures to protect your data, including SSL encryption for secure data transmission over the internet.',
  },
  {
    kind: 'p',
    text:
      'We do not store payment card information on our servers to minimize the risk of unauthorized access.',
  },

  { kind: 'h', text: 'Cookies' },
  {
    kind: 'p',
    text:
      'Our website may use cookies to enhance your user experience, such as remembering login details or site preferences.',
  },
  {
    kind: 'p',
    text:
      'You can disable cookies through your browser settings, but some website functions may be affected.',
  },

  { kind: 'h', text: 'User Rights' },
  { kind: 'p', text: 'You have the right to:' },
  { kind: 'li', text: 'Access, update, and correct your personal information.' },
  {
    kind: 'li',
    text: 'Request the deletion of your personal data, subject to legal obligations.',
  },
  {
    kind: 'li',
    text:
      'Unsubscribe from promotional emails at any time by emailing unsubscribe@dressfair.com.',
  },

  { kind: 'h', text: 'Push Notifications' },
  {
    kind: 'p',
    text:
      'With your permission, the DressFair mobile application sends push notifications via Apple Push Notification service (APNs) and Firebase Cloud Messaging (FCM). The notification token used to deliver these messages is stored on our servers but is not associated with any third-party advertising identifiers. You can disable notifications at any time from your device system settings.',
  },

  { kind: 'h', text: 'Data Stored On Your Device' },
  {
    kind: 'p',
    text:
      'When you use the DressFair mobile application, your notification history, recent searches, and login session token are stored locally on your device. You can clear notification history and recent searches at any time from inside the app, or by uninstalling the app.',
  },

  { kind: 'h', text: 'Changes to the Privacy Policy' },
  { kind: 'p', text: 'We may update this Privacy Policy from time to time.' },
  {
    kind: 'p',
    text:
      'All changes will be posted on this page with an updated "Last Modified" date. We recommend reviewing this page periodically to stay informed of any updates.',
  },

  { kind: 'h', text: 'Contact Us' },
  {
    kind: 'p',
    text:
      'For any questions regarding this Privacy Policy or your data, please contact us:',
  },
  { kind: 'li', text: 'Email: info@dressfair.com' },
  { kind: 'li', text: 'Phone: +971 56 565 1133' },
];
