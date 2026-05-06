// Native FAQ entries. The FAQ screen renders these as collapsible accordion
// rows, which is a more discoverable UX than a single long page and gives
// the user a meaningful interaction beyond "scroll".
export type FaqEntry = {
  id: string;
  question: string;
  // Each entry can be a single string or split into paragraphs for legibility.
  answer: string | string[];
};

export const faqEntries: FaqEntry[] = [
  {
    id: 'what-is-dressfair',
    question: 'What is DressFair?',
    answer:
      'DressFair is an online shopping site, facilitating the purchase of a wide range of fashion products at attractive prices and discounts, and with the best quality.',
  },
  {
    id: 'outside-uae',
    question: 'Can we purchase products from DressFair if we are living outside the UAE?',
    answer:
      'Yes. For that, you need to contact our customer care first to confirm whether our service is available in your area, and if so, what the rate of shipping is.',
  },
  {
    id: 'order-by-phone',
    question: 'Can we order by phone?',
    answer: [
      'Yes. You can call our Customer Care number: +971 56 565 1133.',
      'Customer Care timing: Saturday – Thursday, 11:00 AM – 10:00 PM (UAE time).',
    ],
  },
  {
    id: 'order-by-whatsapp',
    question: 'Can we order by WhatsApp?',
    answer:
      'Yes — send us a message on WhatsApp with the picture or product code of the item you want, along with your name, number and location, and we will process your order.',
  },
  {
    id: 'shipping-charges',
    question: 'What are the delivery / shipping charges?',
    answer: [
      'You can avail free shipping if your order value is AED 200 and above.',
      'A shipping charge of AED 15 applies to all orders under AED 200.',
      'Shipping charges to some non-serviceable areas are AED 30 irrespective of the order value.',
      'For more details, please contact Customer Services on +971 56 565 1133.',
    ],
  },
  {
    id: 'secure-server',
    question: 'Does DressFair use a secure server?',
    answer: [
      'Our website uses SSL (Secure Socket Layer) encryption so that your personal information cannot be read by any external entity as it passes over the internet. This keeps others from seeing your personal information by scrambling it so that only your web browser and the server of our website can decipher it.',
      'Note that we do NOT store your credit / debit card information for security reasons.',
    ],
  },
  {
    id: 'discount-voucher',
    question: 'What is a discount voucher and how can I use it?',
    answer:
      'A discount voucher is a certain percentage of waivers available on the total cost of a particular item or an order. A valid discount voucher code has to be entered on the last page of the checkout process in order to avail and claim the discount.',
  },
  {
    id: 'share-personal-info',
    question: 'Do you share my personal information?',
    answer: 'We only share your personal information with our authorized distributors.',
  },
  {
    id: 'promotional-offers',
    question: 'Promotional offers',
    answer: [
      'If you have subscribed with DressFair to receive regular newsletters, publications and special deal alerts, we will send you that information periodically.',
      'If you wish to not receive such information, please notify us by emailing unsubscribe@dressfair.com.',
    ],
  },
];
