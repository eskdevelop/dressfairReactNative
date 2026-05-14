// class CountryConfigModel {
//   final String countryMobileCode;
//   final String countryMobileLength;
//   final String currency;
//   final String logo;
//   final String flateShippingRate;
//   final String freeShippingLimit;
//   final String title;
//   final String keyword;
//   final String description;
//
//   CountryConfigModel({
//     required this.countryMobileCode,
//     required this.countryMobileLength,
//     required this.currency,
//     required this.logo,
//     required this.flateShippingRate,
//     required this.freeShippingLimit,
//     required this.title,
//     required this.keyword,
//     required this.description,
//   });
//
//   factory CountryConfigModel.fromJson(Map<String, dynamic> json) {
//     return CountryConfigModel(
//       countryMobileCode: json['country_mobile_code'] ?? '',
//       countryMobileLength: json['country_mobile_length'] ?? '',
//       currency: json['currency'] ?? '',
//       logo: json['logo'] ?? '',
//       flateShippingRate: json['flate_shipping_rate'] ?? '',
//       freeShippingLimit: json['free_shipping_limit'] ?? '',
//       title: json['title'] ?? '',
//       keyword: json['keyword'] ?? '',
//       description: json['description'] ?? '',
//     );
//   }
//
//   Map<String, dynamic> toJson() {
//     return {
//       "country_mobile_code": countryMobileCode,
//       "country_mobile_length": countryMobileLength,
//       "currency": currency,
//       "logo": logo,
//       "flate_shipping_rate": flateShippingRate,
//       "free_shipping_limit": freeShippingLimit,
//       "title": title,
//       "keyword": keyword,
//       "description": description,
//     };
//   }
// }

/// Country Config:
library;

class CountryConfigModel {
  final String storeName;
  final int countryId;
  final String country;
  final String baseUrl;
  final bool isSubStore;
  final String isoCode2;
  final String mobileCode;
  final int mobileLength;
  final String currencyTitle;
  final String currencyCode;
  final String facebookPixel;
  final String tiktokPixel;
  final String? snapchatPixel;
  final String? googleTag;
  final String storeEmail;
  final String storeMobile;
  final String storeWhatsapp;
  final String storeOpenFrom;
  final String storeOpenTo;
  final String storeOpeningTime;
  final String storeClosingTime;
  final String specialNotice;
  final SocialLinks socialLinks;
  final List<dynamic> allowedCountries;
  final String storeLogo;
  final String storeFavicon;
  final String shippingAmount;
  final String freeShippingLimit;
  final String frontEndTheme;
  final String metaTitle;
  final String metaDescription;
  final String metaKeywords;
  final String arabicMetaTitle;
  final String arabicMetaDescription;
  final String arabicMetaKeywords;

  CountryConfigModel({
    required this.storeName,
    required this.countryId,
    required this.country,
    required this.baseUrl,
    required this.isSubStore,
    required this.isoCode2,
    required this.mobileCode,
    required this.mobileLength,
    required this.currencyTitle,
    required this.currencyCode,
    required this.facebookPixel,
    required this.tiktokPixel,
    this.snapchatPixel,
    this.googleTag,
    required this.storeEmail,
    required this.storeMobile,
    required this.storeWhatsapp,
    required this.storeOpenFrom,
    required this.storeOpenTo,
    required this.storeOpeningTime,
    required this.storeClosingTime,
    required this.specialNotice,
    required this.socialLinks,
    required this.allowedCountries,
    required this.storeLogo,
    required this.storeFavicon,
    required this.shippingAmount,
    required this.freeShippingLimit,
    required this.frontEndTheme,
    required this.metaTitle,
    required this.metaDescription,
    required this.metaKeywords,
    required this.arabicMetaTitle,
    required this.arabicMetaDescription,
    required this.arabicMetaKeywords,
  });

  factory CountryConfigModel.fromJson(Map<String, dynamic> json) {
    return CountryConfigModel(
      storeName: json['store_name'] ?? '',
      countryId: json['country_id'] ?? 0,
      country: json['country'] ?? '',
      baseUrl: json['base_url'] ?? '',
      isSubStore: json['is_sub_store'] ?? false,
      isoCode2: json['iso_code_2'] ?? '',
      mobileCode: json['mobile_code'] ?? '',
      mobileLength: json['mobile_length'] ?? 0,
      currencyTitle: json['currency_title'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      facebookPixel: json['facebook_pixel'] ?? '',
      tiktokPixel: json['tiktok_pixel'] ?? '',
      snapchatPixel: json['snapchat_pixel'],
      googleTag: json['google_tag'],
      storeEmail: json['store_email'] ?? '',
      storeMobile: json['store_mobile'] ?? '',
      storeWhatsapp: json['store_whatsapp'] ?? '',
      storeOpenFrom: json['store_open_from'] ?? '',
      storeOpenTo: json['store_open_to'] ?? '',
      storeOpeningTime: json['store_opening_time'] ?? '',
      storeClosingTime: json['store_closing_time'] ?? '',
      specialNotice: json['special_notice'] ?? '',
      socialLinks: SocialLinks.fromJson(json['social_links'] ?? {}),
      allowedCountries: json['allowed_countries'] ?? [],
      storeLogo: json['store_logo'] ?? '',
      storeFavicon: json['store_favicon'] ?? '',
      shippingAmount: json['shipping_amount'] ?? '',
      freeShippingLimit: json['free_shipping_limit'] ?? '',
      frontEndTheme: json['front_end_theme'] ?? '',
      metaTitle: json['meta_title'] ?? '',
      metaDescription: json['meta_description'] ?? '',
      metaKeywords: json['meta_keywords'] ?? '',
      arabicMetaTitle: json['arabic_meta_title'] ?? '',
      arabicMetaDescription: json['arabic_meta_description'] ?? '',
      arabicMetaKeywords: json['arabic_meta_keywords'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'store_name': storeName,
      'country_id': countryId,
      'country': country,
      'base_url': baseUrl,
      'is_sub_store': isSubStore,
      'iso_code_2': isoCode2,
      'mobile_code': mobileCode,
      'mobile_length': mobileLength,
      'currency_title': currencyTitle,
      'currency_code': currencyCode,
      'facebook_pixel': facebookPixel,
      'tiktok_pixel': tiktokPixel,
      'snapchat_pixel': snapchatPixel,
      'google_tag': googleTag,
      'store_email': storeEmail,
      'store_mobile': storeMobile,
      'store_whatsapp': storeWhatsapp,
      'store_open_from': storeOpenFrom,
      'store_open_to': storeOpenTo,
      'store_opening_time': storeOpeningTime,
      'store_closing_time': storeClosingTime,
      'special_notice': specialNotice,
      'social_links': socialLinks.toJson(),
      'allowed_countries': allowedCountries,
      'store_logo': storeLogo,
      'store_favicon': storeFavicon,
      'shipping_amount': shippingAmount,
      'free_shipping_limit': freeShippingLimit,
      'front_end_theme': frontEndTheme,
      'meta_title': metaTitle,
      'meta_description': metaDescription,
      'meta_keywords': metaKeywords,
      'arabic_meta_title': arabicMetaTitle,
      'arabic_meta_description': arabicMetaDescription,
      'arabic_meta_keywords': arabicMetaKeywords,
    };
  }
}

class SocialLinks {
  final String tiktok;
  final String facebook;
  final String? snapchat;
  final String instagram;

  SocialLinks({
    required this.tiktok,
    required this.facebook,
    this.snapchat,
    required this.instagram,
  });
  Map<String, dynamic> toJson() {
    return {
      'tiktok': tiktok,
      'facebook': facebook,
      'snapchat': snapchat,
      'instagram': instagram,
    };
  }

  factory SocialLinks.fromJson(Map<String, dynamic> json) {
    return SocialLinks(
      tiktok: json['tiktok'] ?? '',
      facebook: json['facebook'] ?? '',
      snapchat: json['snapchat'],
      instagram: json['instagram'] ?? '',
    );
  }
}
