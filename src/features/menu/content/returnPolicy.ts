import type { LegalBlock } from './legalBlock';

// Native Return & Refund Policy. Mirrors the legally reviewed copy on
// dressfair.com/return-policy.
export const returnPolicyTitle = 'Return & Refund Policy';

export const returnPolicyLastUpdated = 'Last updated: 06 February 2026';

export const returnPolicyIsPlaceholder = false;

export const returnPolicyBlocks: LegalBlock[] = [
  { kind: 'h', text: 'Return Policy for Online Payment Sectors' },
  {
    kind: 'p',
    text:
      'Making payments online through PayPal, debit / credit card, or any other online platform is facilitated with an Online Payment Discount of 2% of the total ordered amount. However, if a return is requested, the payment will be reimbursed with deductions for any coupons or other discount offers applied by the customer at the time of order (i.e., the final total at the time of order).',
  },
  {
    kind: 'p',
    text:
      'Further, courier charges for returns will be applicable according to the return policy as follows:',
  },
  { kind: 'li', text: 'In case the product is not according to the description or picture showcased.' },
  { kind: 'li', text: 'In case the product is damaged naturally at the time of delivery.' },
  {
    kind: 'p',
    text:
      'If the return is requested due to dislike of the product or size change, the customer will be responsible for paying the return charges to the courier at the time of pickup.',
  },
  {
    kind: 'p',
    text:
      'All discount offers or coupons will be frozen on the total amount whether the order is accepted or a return is requested. The refundable amount will be calculated according to the amount paid at the time of order, after calculating each item separately.',
  },

  { kind: 'h', text: 'Important Notice' },
  {
    kind: 'li',
    text:
      'Customers requesting any return will be charged AED 15 per pickup, which will be deducted from your Login Wallet Account.',
  },
  {
    kind: 'li',
    text:
      'Returns are not accepted for items purchased during promotions or sales. Only items purchased at regular prices are eligible for return.',
  },

  { kind: 'h', text: 'Common Scenarios for Returns' },

  { kind: 'h', text: '1. If You Don’t Like the Product, Its Quality, or Have Changed Your Mind' },
  {
    kind: 'li',
    text:
      'You will need to pay shipping charges for both sides, even if the delivery was free.',
  },
  {
    kind: 'li',
    text:
      'If a promotional coupon code was applied, the discounted price will be refunded to your Login Wallet Account.',
  },
  {
    kind: 'li',
    text:
      'After deduction of shipping fees, the remaining order amount will be credited to your Login Wallet Account for future use once the returned items are received.',
  },
  {
    kind: 'li',
    text:
      'Home essential products packed by manufacturers after quality and damage checks cannot be returned if opened, installed, or dismantled, as they cannot be repacked.',
  },
  { kind: 'li', text: 'No cash refund policy applies.' },

  { kind: 'h', text: '2. Damaged Item, Wrong Item, or Missing Items' },
  {
    kind: 'li',
    text:
      'If you receive a damaged or incorrect item, or if any ordered item is missing, inform our Customer Service Helpline within 7 days.',
  },
  {
    kind: 'li',
    text:
      'We will arrange a courier to pick up the damaged or wrong item. Once received, our warehouse team will inspect it. After inspection, we will send a replacement item accordingly.',
  },
  { kind: 'li', text: 'The same process applies to missing items in your order.' },

  { kind: 'h', text: '3. Products / Orders Which Cannot Be Returned' },
  { kind: 'li', text: 'Orders missing their original packaging cannot be returned.' },
  {
    kind: 'li',
    text:
      'Lingerie, undergarments, swimwear, beachwear, or makeup items cannot be returned for hygienic reasons.',
  },
  {
    kind: 'li',
    text:
      'Used or reconditioned products, items with broken or removed tags, or dirty products will not be considered for return.',
  },

  { kind: 'p', text: 'Note: Original shipping charges are non-refundable.' },
];
