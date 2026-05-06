// Contact details surfaced on the native Contact Us screen. Phone numbers
// are stored as both a `display` string (formatted for humans) and a `dial`
// string (E.164 compatible, suitable for `tel:` / `https://wa.me/` deep
// links). Keeping the two in sync here means the screen can never render a
// number that fails to dial.
export type ContactChannel = {
  label: string;
  display: string;
  // Pre-formatted target for Linking.openURL — for example `tel:+971...`,
  // `mailto:...`, or `https://wa.me/971...`.
  url: string;
};

export const contactHeadline = 'We will be happy to contact you and answer your questions.';

export const contactChannels: ContactChannel[] = [
  {
    label: 'Call us',
    display: '+971 56 565 1133',
    url: 'tel:+971565651133',
  },
  {
    label: 'Email us',
    display: 'info@dressfair.com',
    url: 'mailto:info@dressfair.com?subject=DressFair%20app%20support',
  },
  {
    label: 'WhatsApp',
    display: '+971 56 563 4477',
    url: 'https://wa.me/971565634477',
  },
];

export const contactHours = {
  title: 'Customer service hours',
  // Hours sourced from the FAQ page: Saturday – Thursday, 11:00 AM – 10:00 PM.
  detail: 'Saturday – Thursday  •  11:00 AM – 10:00 PM (UAE time)',
};

export const contactCompany = {
  name: 'DressFair.ae',
  location: 'Dubai, United Arab Emirates',
};
