class ProductDetailModel {
  final int productId;
  final int productGroupId;
  final String sku;
  final String currencyCode;
  final String name;
  final String nameAr;
  final String description;
  final String descriptionAr;
  final int availableQty;
  final String brand;
  final String gender;
  final String color;
  final String categoryName;
  final String dataPrice;

  /// PRICE (LIST OR MAP SAFE)
  final List<ProductPriceTier> prices;

  final List<ProductOptionNew> options;
  final List<ProductImageNew> images;
  final List<ProductColorModel> productColors;
  final List<RelatedProductNew> relatedProducts;

  ProductDetailModel({
    required this.productId,
    required this.productGroupId,
    required this.sku,
    required this.currencyCode,
    required this.name,
    required this.nameAr,
    required this.description,
    required this.descriptionAr,
    required this.availableQty,
    required this.brand,
    required this.gender,
    required this.color,
    required this.categoryName,
    required this.dataPrice,
    required this.prices,
    required this.options,
    required this.images,
    required this.productColors,
    required this.relatedProducts,
  });

  factory ProductDetailModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] is Map ? json['data'] : <String, dynamic>{};

    return ProductDetailModel(
      productId: _int(data['product_id']),
      productGroupId: _int(data['product_group_id']),
      sku: _str(data['product_sku']),
      currencyCode: _str(data['currency_code']),
      name: _str(data['name']),
      nameAr: _str(data['name_ar']),
      description: _str(data['description']),
      descriptionAr: _str(data['description_ar']),
      availableQty: _int(data['available_qty']),
      brand: _str(data['brand']),
      gender: _str(data['gender']),
      color: _str(data['color']),
      categoryName: _str(data['category_name']),
      dataPrice: _str(data['data_price']),

      prices: _parsePriceTiers(data['price']),
      options: _list(data['options'], ProductOptionNew.fromJson),
      images: _list(data['images'], ProductImageNew.fromJson),
      productColors: _list(data['product_colors'], ProductColorModel.fromJson),
      relatedProducts: _list(
        data['related_products'],
        RelatedProductNew.fromJson,
      ),
    );
  }

  bool get hasBundleFlag {
    if (prices.isEmpty) return false;
    return prices.any((tier) => tier.hasBundle);
  }

  ProductPriceTier? get activePrice {
    if (prices.isEmpty) return null;

    // Priority order
    return prices.firstWhere(
      (p) => p.hasOffer && p.offerPrice != null,
      orElse: () => prices.firstWhere(
        (p) => p.hasSale && p.salePrice != null,
        orElse: () => prices.firstWhere(
          (p) => p.hasBundle && p.bundlePrice != null,
          orElse: () => prices.first,
        ),
      ),
    );
  }

  num get displayPrice {
    return activePrice?.getDisplayPrice() ?? 0;
  }

  num? get cutPrice {
    return activePrice?.getCutPrice();
  }

  int get discountPercent {
    final cut = cutPrice;
    final dp = displayPrice;

    if (cut == null || cut == 0 || dp >= cut) return 0;
    return (((cut - dp) / cut) * 100).round();
  }

  num get discountAmount {
    if (cutPrice == null) return 0;
    return cutPrice! - displayPrice;
  }

  /// SAFE helpers
  ProductPriceTier? get primaryPrice => prices.isNotEmpty ? prices.first : null;
  ProductImageNew? get primaryImage => images.isNotEmpty ? images.first : null;
}

class ProductPriceTier {
  final int quantity;
  final double normalPrice;
  final double? salePrice;
  final double? offerPrice;
  final double? bundlePrice;
  final bool hasSale;
  final bool hasOffer;
  final bool hasBundle;
  final bool hasNormal;

  ProductPriceTier({
    required this.quantity,
    required this.normalPrice,
    this.salePrice,
    this.offerPrice,
    this.bundlePrice,
    required this.hasSale,
    required this.hasOffer,
    required this.hasBundle,
    required this.hasNormal,
  });

  /// ✅ THIS GOES HERE
  int get displayQuantity {
    if (quantity > 0) return quantity;
    if (hasNormal) return 1;
    return 1;
  }

  factory ProductPriceTier.fromJson(Map<String, dynamic> json) {
    double parseNum(dynamic value) {
      if (value == null) return 0.0;
      if (value is num) return value.toDouble();
      return double.tryParse(value.toString()) ?? 0.0;
    }

    final bool hasSale = json['has_sale'] == true;
    final bool hasOffer = json['has_offer'] == true;
    final bool hasBundle = json['has_bundle'] == true;
    final bool hasNormal = json['has_normal'] == true;

    double resolvedNormalPrice = 0.0;
    double? resolvedBundlePrice;

    // ✅ NORMAL PRICE
    if (json.containsKey('normal_price')) {
      resolvedNormalPrice = parseNum(json['normal_price']);
    } else if (hasNormal && json.containsKey('price')) {
      resolvedNormalPrice = parseNum(json['price']);
    }
    // ✅ BUNDLE PRICE ONLY WHEN hasBundle
    if (hasBundle && json.containsKey('price')) {
      resolvedBundlePrice = parseNum(json['price']);
    }

    return ProductPriceTier(
      quantity: _int(json['quantity']),
      normalPrice: resolvedNormalPrice,
      salePrice: hasSale ? parseNum(json['sale_price']) : null,
      offerPrice: hasOffer ? parseNum(json['offer_price']) : null,
      bundlePrice: resolvedBundlePrice,
      hasSale: hasSale,
      hasOffer: hasOffer,
      hasBundle: hasBundle,
      hasNormal: hasNormal,
    );
  }

  /// Price shown on UI
  num getDisplayPrice() {
    if (hasOffer && offerPrice != null) return offerPrice!;
    if (hasSale && salePrice != null) return salePrice!;
    if (hasBundle && bundlePrice != null) return bundlePrice!;
    return normalPrice;
  }

  /// Cut/strikethrough price
  num? getCutPrice() {
    return getDisplayPrice() != normalPrice ? normalPrice : null;
  }
}

class ProductOptionNew {
  final int productOptionId;
  final String label;
  final int availableQty;

  ProductOptionNew({
    required this.productOptionId,
    required this.label,
    required this.availableQty,
  });

  factory ProductOptionNew.fromJson(Map<String, dynamic> json) {
    return ProductOptionNew(
      productOptionId: _int(json['product_option_id']),
      label: _str(json['option_label']),
      availableQty: _int(json['available_quantity']),
    );
  }
}

class ProductImageNew {
  final String image;
  final int isMain;
  final int isArabicMain;

  ProductImageNew({
    required this.image,
    this.isMain = 0,
    this.isArabicMain = 0,
  });

  factory ProductImageNew.fromJson(Map<String, dynamic> json) {
    int parseFlag(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is bool) return value ? 1 : 0;
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    return ProductImageNew(
      image: _str(json['image']),
      isMain: parseFlag(json['isMain']),
      isArabicMain: parseFlag(json['isArabicMain']),
    );
  }
}

class ProductColorModel {
  final String sku;
  final String color;
  final String image;

  ProductColorModel({
    required this.sku,
    required this.color,
    required this.image,
  });

  factory ProductColorModel.fromJson(Map<String, dynamic> json) {
    return ProductColorModel(
      sku: _str(json['sku']),
      color: _str(json['color']),
      image: _str(json['image']),
    );
  }
}

class RelatedProductNew {
  final int productId;

  final String productSku;

  final String currencyCode;

  final String name;

  final String nameAr;

  final RelatedProductCategory relatedProductCategory;

  final RelatedProductPrice relatedProductsPrice;

  final List<RelatedProductImage> relatedProductImages;

  RelatedProductNew({
    required this.productId,
    required this.productSku,
    required this.currencyCode,
    required this.name,
    required this.nameAr,
    required this.relatedProductCategory,
    required this.relatedProductsPrice,
    required this.relatedProductImages,
  });

  factory RelatedProductNew.fromJson(dynamic json) {
    // 🔴 FIX: price can be Map or List
    final dynamic priceJson = json['price'];
    Map<String, dynamic> resolvedPrice = {};

    if (priceJson is List && priceJson.isNotEmpty) {
      resolvedPrice = priceJson.first as Map<String, dynamic>;
    } else if (priceJson is Map<String, dynamic>) {
      resolvedPrice = priceJson;
    }

    return RelatedProductNew(
      productId: json['product_id'] ?? 0,
      productSku: json['product_sku'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      relatedProductCategory: RelatedProductCategory.fromJson(
        json['product_category'] ?? {},
      ),
      relatedProductsPrice: RelatedProductPrice.fromJson(resolvedPrice),
      relatedProductImages: (json['images'] as List? ?? [])
          .map((e) => RelatedProductImage.fromJson(e))
          .toList(),
    );
  }

  RelatedProductImage? get primaryImage =>
      relatedProductImages.isNotEmpty ? relatedProductImages.first : null;
}

/// ================== HELPERS ==================
List<ProductPriceTier> _parsePriceTiers(dynamic priceRaw) {
  if (priceRaw is List) {
    return priceRaw
        .whereType<Map>()
        .map((e) => ProductPriceTier.fromJson(Map<String, dynamic>.from(e)))
        .toList();
  }
  if (priceRaw is Map) {
    return [ProductPriceTier.fromJson(Map<String, dynamic>.from(priceRaw))];
  }
  return [];
}

String _str(dynamic v) => v == null ? '' : v.toString();

int _int(dynamic v) {
  if (v == null) return 0;
  if (v is int) return v;
  if (v is double) return v.toInt();
  return int.tryParse(v.toString()) ?? 0;
}

double _double(dynamic v) {
  if (v == null) return 0.0;
  if (v is double) return v;
  if (v is int) return v.toDouble();
  return double.tryParse(v.toString()) ?? 0.0;
}

List<T> _list<T>(dynamic v, T Function(Map<String, dynamic>) mapper) {
  if (v is List) {
    return v
        .whereType<Map>()
        .map((e) => mapper(Map<String, dynamic>.from(e)))
        .toList();
  }
  return [];
}

class RelatedProductCategory {
  final String name;
  final String nameAr;
  RelatedProductCategory({required this.name, required this.nameAr});

  factory RelatedProductCategory.fromJson(Map<String, dynamic> json) {
    return RelatedProductCategory(
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
    );
  }
}

class RelatedProductPrice {
  final int? quantity;

  final num normalPrice;

  final num? salePrice;

  final num? offerPrice;

  final num? bundlePrice;

  final bool hasSale;

  final bool hasOffer;

  final bool hasBundle;

  final bool hasNormal;

  RelatedProductPrice({
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

  factory RelatedProductPrice.fromJson(Map<String, dynamic> json) {
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

    return RelatedProductPrice(
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

class RelatedProductImage {
  final String image;

  final int isMain;

  final int isArabicMain;

  RelatedProductImage({
    required this.image,
    required this.isMain,
    required this.isArabicMain,
  });

  factory RelatedProductImage.fromJson(Map<String, dynamic> json) {
    int parseFlag(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is bool) return value ? 1 : 0;
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    return RelatedProductImage(
      image: json['image'] ?? '',
      isMain: parseFlag(json['isMain']),
      isArabicMain: parseFlag(json['isArabicMain']),
    );
  }
}
