# Store Listing Copy

Concrete, ready-to-paste copy for both stores. Adjust tone if marketing wants
more flourish, but the lengths and structure already pass Play / App Store
review constraints (Play short ≤ 80 chars, App Store subtitle ≤ 30 chars,
keywords ≤ 100 chars total comma-separated).

## Common

- App name: **DressFair**
- Tagline / Subtitle (≤ 30 chars): **Modest fashion, delivered.**
- Support email: support@dressfair.com
- Support URL: https://www.dressfair.com/contact
- Marketing URL: https://www.dressfair.com
- Privacy policy URL: https://www.dressfair.com/privacy
- Account deletion URL: https://www.dressfair.com/account/delete
- Contact phone (optional): +971 _XX_ _XXX_ _XXXX_

## Long description (Play full description / App Store description)

```
DressFair brings the latest modest fashion for women across the GCC straight
to your phone. Browse abayas, dresses, hijabs, accessories and seasonal
collections, save favourites, place orders, and track delivery — all in one
place.

Why shop with DressFair?
• Curated edits of modest, on-trend pieces from leading designers.
• Secure checkout with multiple regional payment options.
• Cash on delivery available across the UAE, Oman and Saudi Arabia.
• Order tracking and instant push updates from cart to doorstep.
• Wishlist your favourites and pick up where you left off across devices.
• Friendly customer support in English and Arabic.

DressFair ships from regional warehouses for fast delivery and easy returns.
Your account, orders and payment information are protected with bank-grade
encryption — we never share your data with third parties for advertising.

Got a question? Tap Help & Support inside the app, or write to us at
support@dressfair.com. We reply within one business day.
```

## Android (Google Play)

| Field | Value |
| ----- | ----- |
| Default language | English (United States) |
| Short description (≤ 80 chars) | `Modest fashion shopping for women across the GCC.` (50 chars — fits.) |
| Full description | (paste the long description above) |
| App category | **Shopping** |
| Tags | Fashion, Shopping, Online Store |
| Content rating answers | All "No" — Shopping app, no UGC, no violence, no gambling, no profanity, no sexual content, no drugs, no location sharing |
| Target audience | **18+** only |
| Ads declaration | **No** |
| Data safety | See `docs/play-console-internal-checklist.md` matrix |
| Phone screenshots (2–8) | designer |
| Tablet screenshots | optional, skip for v1 |
| App icon (512×512) | designer |
| Feature graphic (1024×500) | designer |

## iOS (App Store Connect)

| Field | Value |
| ----- | ----- |
| Bundle ID | `com.dressfair.dressfairrnhybrid` |
| SKU | `dressfair-rn-hybrid` |
| Primary category | **Shopping** |
| Secondary category | Lifestyle (optional) |
| Subtitle (≤ 30 chars) | **Modest fashion, delivered.** |
| Promotional text (≤ 170 chars) | New season collections, faster checkout and instant order updates — DressFair brings modest fashion straight to you. |
| Keywords (≤ 100 chars, comma-separated) | `abaya,modest,fashion,hijab,dress,shopping,women,UAE,Saudi,Oman` (~70 chars) |
| Description | (paste the long description above) |
| App privacy answers | Same matrix as Play Data Safety; tag every "Yes" with **Linked to user** |
| Export compliance | Already declared in `app.json` (`ITSAppUsesNonExemptEncryption: false`) — answer **No** when asked |
| Age rating | 4+ (no objectionable content) |
| App review notes | "Hybrid commerce app. Login lives at /login on the storefront. Reviewer can sign in with the credentials in App Review Information." |
| App review test account | reviewer email + password |
| App review contact | name, phone (with country code), email |
| Screenshots — iPhone 6.7" | designer |
| Screenshots — iPhone 6.5" | designer |
| Screenshots — iPad | not required (`supportsTablet: false` in `app.json`) |

## Release checklist sign-off

- [ ] Android internal track tested
- [ ] TestFlight internal tested
- [ ] Crash-free smoke tests completed (real device, see `scripts/smoke-checklist.json`)
- [ ] Privacy policy and terms verified live
- [ ] Account deletion URL verified live
- [ ] Version 1.0.0 / Android versionCode 6 / iOS buildNumber confirmed
