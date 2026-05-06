import type { LegalBlock } from './legalBlock';

// Native Terms and Conditions copy. Mirrors the legally reviewed text on
// dressfair.com/terms. When the website copy changes, update the blocks
// below and bump `termsLastUpdated`.
export const termsTitle = 'Terms and Conditions';

export const termsLastUpdated = 'Last updated: 06 February 2026';

export const termsIsPlaceholder = false;

export const termsBlocks: LegalBlock[] = [
  {
    kind: 'p',
    text:
      'These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and http://dressfair.com/ ("we," "us" or "our"), concerning your access to and use of the http://dressfair.com/ website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site"). You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.',
  },
  {
    kind: 'p',
    text:
      'Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Terms of Use, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Terms of Use to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms of Use by your continued use of the Site after the date such revised Terms of Use are posted.',
  },
  {
    kind: 'p',
    text:
      'The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Site from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.',
  },
  {
    kind: 'p',
    text:
      'The Site is intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Site. If you are a minor, you must have your parent or guardian read and agree to these Terms of Use prior to you using the Site.',
  },

  { kind: 'h', text: 'Intellectual Property Rights' },
  {
    kind: 'p',
    text:
      'Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions. The Content and the Marks are provided on the Site "AS IS" for your information and personal use only. Except as expressly provided in these Terms of Use, no part of the Site and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.',
  },
  {
    kind: 'p',
    text:
      'Provided that you are eligible to use the Site, you are granted a limited license to access and use the Site and to download or print a copy of any portion of the Content to which you have properly gained access solely for your personal, non-commercial use. We reserve all rights not expressly granted to you in and to the Site, the Content and the Marks.',
  },

  { kind: 'h', text: 'User Representations' },
  {
    kind: 'p',
    text:
      'By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Use; (4) you are not under the age of 13; (5) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site; (6) you will not access the Site through automated or non-human means, whether through a bot, script or otherwise; (7) you will not use the Site for any illegal or unauthorized purpose; and (8) your use of the Site will not violate any applicable law or regulation.',
  },
  {
    kind: 'p',
    text:
      'If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Site (or any portion thereof).',
  },

  { kind: 'h', text: 'User Registration' },
  {
    kind: 'p',
    text:
      'You may be required to register with the Site. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.',
  },

  { kind: 'h', text: 'Products' },
  {
    kind: 'p',
    text:
      'We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products. All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.',
  },

  { kind: 'h', text: 'Purchases and Payment' },
  { kind: 'p', text: 'We accept the following forms of payment:' },
  { kind: 'li', text: 'Cash On Delivery' },
  {
    kind: 'p',
    text:
      'You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in U.S. dollars.',
  },
  {
    kind: 'p',
    text:
      'You agree to pay all charges at the prices then in effect for your purchases and any applicable shipping fees, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order. We reserve the right to correct any errors or mistakes in pricing, even if we have already requested or received payment.',
  },
  {
    kind: 'p',
    text:
      'We reserve the right to refuse any order placed through the Site. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the same customer account, the same payment method, and/or orders that use the same billing or shipping address. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.',
  },

  { kind: 'h', text: 'Return Policy' },
  {
    kind: 'p',
    text:
      'Please review our Return Policy posted on the Site prior to making any purchases.',
  },

  { kind: 'h', text: 'Guidelines for Reviews' },
  {
    kind: 'p',
    text: 'We may provide you areas on the Site to leave reviews or ratings. When posting a review, you must comply with the following criteria:',
  },
  {
    kind: 'li',
    text: 'You should have firsthand experience with the person/entity being reviewed.',
  },
  {
    kind: 'li',
    text: 'Your reviews should not contain offensive profanity, or abusive, racist, offensive, or hate language.',
  },
  {
    kind: 'li',
    text: 'Your reviews should not contain discriminatory references based on religion, race, gender, national origin, age, marital status, sexual orientation, or disability.',
  },
  { kind: 'li', text: 'Your reviews should not contain references to illegal activity.' },
  {
    kind: 'li',
    text: 'You should not be affiliated with competitors if posting negative reviews.',
  },
  { kind: 'li', text: 'You should not make any conclusions as to the legality of conduct.' },
  { kind: 'li', text: 'You may not post any false or misleading statements.' },
  {
    kind: 'li',
    text: 'You may not organize a campaign encouraging others to post reviews, whether positive or negative.',
  },
  {
    kind: 'p',
    text:
      'We may accept, reject, or remove reviews in our sole discretion. We have absolutely no obligation to screen reviews or to delete reviews, even if anyone considers reviews objectionable or inaccurate. Reviews are not endorsed by us, and do not necessarily represent our opinions or the views of any of our affiliates or partners. We do not assume liability for any review or for any claims, liabilities, or losses resulting from any review. By posting a review, you hereby grant to us a perpetual, non-exclusive, worldwide, royalty-free, fully-paid, assignable, and sublicensable right and license to reproduce, modify, translate, transmit by any means, display, perform, and/or distribute all content relating to reviews.',
  },

  { kind: 'h', text: 'Social Media' },
  {
    kind: 'p',
    text:
      'As part of the functionality of the Site, you may link your account with online accounts you have with third-party service providers (each such account, a "Third-Party Account") by either: (1) providing your Third-Party Account login information through the Site; or (2) allowing us to access your Third-Party Account, as is permitted under the applicable terms and conditions that govern your use of each Third-Party Account.',
  },
  {
    kind: 'p',
    text:
      'You represent and warrant that you are entitled to disclose your Third-Party Account login information to us and/or grant us access to your Third-Party Account, without breach by you of any of the terms and conditions that govern your use of the applicable Third-Party Account, and without obligating us to pay any fees or making us subject to any usage limitations imposed by the third-party service provider of the Third-Party Account.',
  },
  {
    kind: 'p',
    text:
      'By granting us access to any Third-Party Accounts, you understand that (1) we may access, make available, and store (if applicable) any content that you have provided to and stored in your Third-Party Account (the "Social Network Content") so that it is available on and through the Site via your account, including without limitation any friend lists and (2) we may submit to and receive from your Third-Party Account additional information to the extent you are notified when you link your account with the Third-Party Account.',
  },
  {
    kind: 'p',
    text:
      'Depending on the Third-Party Accounts you choose and subject to the privacy settings that you have set in such Third-Party Accounts, personally identifiable information that you post to your Third-Party Accounts may be available on and through your account on the Site. Please note that if a Third-Party Account or associated service becomes unavailable or our access to such Third-Party Account is terminated by the third-party service provider, then Social Network Content may no longer be available on and through the Site. You will have the ability to disable the connection between your account on the Site and your Third-Party Accounts at any time.',
  },
  {
    kind: 'p',
    text:
      'PLEASE NOTE THAT YOUR RELATIONSHIP WITH THE THIRD-PARTY SERVICE PROVIDERS ASSOCIATED WITH YOUR THIRD-PARTY ACCOUNTS IS GOVERNED SOLELY BY YOUR AGREEMENT(S) WITH SUCH THIRD-PARTY SERVICE PROVIDERS. We make no effort to review any Social Network Content for any purpose, including but not limited to, for accuracy, legality, or non-infringement, and we are not responsible for any Social Network Content.',
  },
  {
    kind: 'p',
    text:
      'You acknowledge and agree that we may access your email address book associated with a Third-Party Account and your contacts list stored on your mobile device or tablet computer solely for purposes of identifying and informing you of those contacts who have also registered to use the Site. You can deactivate the connection between the Site and your Third-Party Account by contacting us using the contact information below or through your account settings (if applicable). We will attempt to delete any information stored on our servers that was obtained through such Third-Party Account, except the username and profile picture that become associated with your account.',
  },

  { kind: 'h', text: 'Site Management' },
  {
    kind: 'p',
    text:
      'We reserve the right, but not the obligation, to: (1) monitor the Site for violations of these Terms of Use; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Terms of Use, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Site or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Site in a manner designed to protect our rights and property and to facilitate the proper functioning of the Site and the Marketplace Offerings.',
  },

  { kind: 'h', text: 'Disclaimer' },
  {
    kind: 'p',
    text:
      'THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
  },
  {
    kind: 'p',
    text:
      'WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE\'S CONTENT OR THE CONTENT OF ANY WEBSITES LINKED TO THIS SITE AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SITE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE.',
  },
  {
    kind: 'p',
    text:
      'WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SITE, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.',
  },

  { kind: 'h', text: 'User Data' },
  {
    kind: 'p',
    text:
      'We will maintain certain data that you transmit to the Site for the purpose of managing the performance of the Site, as well as data relating to your use of the Site. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Site. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.',
  },

  { kind: 'h', text: 'Electronic Communications, Transactions, and Signatures' },
  {
    kind: 'p',
    text:
      'Visiting the Site, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Site, satisfy any legal requirement that such communication be in writing.',
  },
  {
    kind: 'p',
    text:
      'YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SITE. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.',
  },

  { kind: 'h', text: 'Miscellaneous' },
  {
    kind: 'p',
    text:
      'These Terms of Use and any policies or operating rules posted by us on the Site or in respect to the Site constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Terms of Use shall not operate as a waiver of such right or provision. These Terms of Use operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control.',
  },
  {
    kind: 'p',
    text:
      'If any provision or part of a provision of these Terms of Use is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Terms of Use and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Terms of Use or use of the Site. You agree that these Terms of Use will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Terms of Use and the lack of signing by the parties hereto to execute these Terms of Use.',
  },

  { kind: 'h', text: 'Contact Us' },
  {
    kind: 'p',
    text:
      'In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: http://dressfair.com/  •  United Arab Emirates  •  Phone: (971) 565-6511  •  info@dressfair.com',
  },
];
