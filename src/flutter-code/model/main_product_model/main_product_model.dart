import 'package:hive/hive.dart';

part 'main_product_model.g.dart';

@HiveType(typeId: 20)
class MainProductModel {
  @HiveField(0)
  final int productId;

  @HiveField(1)
  final String productSku;

  @HiveField(2)
  final String currencyCode;

  @HiveField(3)
  final String name;

  @HiveField(4)
  final String nameAr;

  @HiveField(5)
  final MainProductCategory productCategory;

  @HiveField(6)
  final MainProductPrice price;

  @HiveField(7)
  final List<MainProductImage> images;

  MainProductModel({
    required this.productId,
    required this.productSku,
    required this.currencyCode,
    required this.name,
    required this.nameAr,
    required this.productCategory,
    required this.price,
    required this.images,
  });

  factory MainProductModel.fromJson(dynamic json) {
    /// 🔴 FIX: price can be Map or List
    final dynamic priceJson = json['price'];
    Map<String, dynamic> resolvedPrice = {};

    if (priceJson is List && priceJson.isNotEmpty) {
      resolvedPrice = priceJson.first as Map<String, dynamic>;
    } else if (priceJson is Map<String, dynamic>) {
      resolvedPrice = priceJson;
    }

    return MainProductModel(
      productId: json['product_id'] ?? 0,
      productSku: json['product_sku'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      productCategory: MainProductCategory.fromJson(
        json['product_category'] ?? {},
      ),
      price: MainProductPrice.fromJson(resolvedPrice),
      images: (json['images'] as List? ?? [])
          .map((e) => MainProductImage.fromJson(e))
          .toList(),
    );
  }
}

@HiveType(typeId: 21)
class MainProductCategory {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final String nameAr;

  MainProductCategory({required this.name, required this.nameAr});

  factory MainProductCategory.fromJson(Map<String, dynamic> json) {
    return MainProductCategory(
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
    );
  }
}

@HiveType(typeId: 22)
class MainProductPrice {
  @HiveField(0)
  final int? quantity;

  @HiveField(1)
  final num normalPrice;

  @HiveField(2)
  final num? salePrice;

  @HiveField(3)
  final num? offerPrice;

  @HiveField(4)
  final num? bundlePrice;

  @HiveField(5)
  final bool hasSale;

  @HiveField(6)
  final bool hasOffer;

  @HiveField(7)
  final bool hasBundle;

  @HiveField(8)
  final bool hasNormal;

  MainProductPrice({
    this.quantity,
    required this.normalPrice,
    this.salePrice,
    this.offerPrice,
    this.bundlePrice,
    this.hasSale = false,
    this.hasOffer = false,
    this.hasBundle = false,
    this.hasNormal = false,
  });

  factory MainProductPrice.fromJson(Map<String, dynamic> json) {
    num parseNum(dynamic value) {
      if (value == null) return 0;
      if (value is num) return value;
      return num.tryParse(value.toString()) ?? 0;
    }

    final bool hasSale = json['has_sale'] == true;
    final bool hasOffer = json['has_offer'] == true;
    final bool hasBundle = json['has_bundle'] == true;
    final bool hasNormal = json['has_normal'] == true;

    num resolvedNormalPrice = 0;

    // 🔹 NORMAL PRICE RESOLUTION
    if (json.containsKey('normal_price')) {
      resolvedNormalPrice = parseNum(json['normal_price']);
    }
    // 🔹 SIMPLE PRICE CASE
    else if (hasNormal && json.containsKey('price')) {
      resolvedNormalPrice = parseNum(json['price']);
    }

    return MainProductPrice(
      quantity: json['quantity'],
      normalPrice: resolvedNormalPrice,
      salePrice: hasSale ? parseNum(json['sale_price']) : null,
      offerPrice: hasOffer ? parseNum(json['offer_price']) : null,
      bundlePrice: hasBundle ? parseNum(json['price']) : null,
      hasSale: hasSale,
      hasOffer: hasOffer,
      hasBundle: hasBundle,
      hasNormal: hasNormal,
    );
  }

  num getDisplayPrice() {
    if (hasOffer && offerPrice != null) return offerPrice!;
    if (hasSale && salePrice != null) return salePrice!;
    if (hasBundle && bundlePrice != null) return bundlePrice!;
    return normalPrice;
  }

  /// Cut/strikethrough price
  num? getCutPrice() {
    if (getDisplayPrice() != normalPrice) {
      return normalPrice;
    }
    return null;
  }
}

@HiveType(typeId: 23)
class MainProductImage {
  @HiveField(0)
  final String image;

  @HiveField(1)
  final int isMain;

  @HiveField(2)
  final int isArabicMain;

  MainProductImage({
    required this.image,
    required this.isMain,
    required this.isArabicMain,
  });

  factory MainProductImage.fromJson(Map<String, dynamic> json) {
    int parseFlag(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is bool) return value ? 1 : 0;
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    return MainProductImage(
      image: json['image'] ?? '',
      isMain: parseFlag(json['isMain']),
      isArabicMain: parseFlag(json['isArabicMain']),
    );
  }
}
