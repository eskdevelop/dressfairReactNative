import 'package:hive/hive.dart';

part 'category_model.g.dart';

@HiveType(typeId: 0)
class CategoryModel extends HiveObject {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String nameAr;

  @HiveField(3)
  final String? image;

  @HiveField(4)
  final String? slug;

  @HiveField(5)
  final List<SubCategoryModel> subCategories;

  @HiveField(6)
  final List<ProductModelNew> products;

  CategoryModel({
    required this.id,
    required this.name,
    required this.nameAr,
    this.image,
    this.slug,
    required this.subCategories,
    required this.products,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      image: json['image'],
      slug: json['slug'],
      subCategories: (json['sub_categories'] is List
          ? (json['sub_categories'] as List)
                .map(
                  (e) => e is Map<String, dynamic>
                      ? SubCategoryModel.fromJson(e)
                      : null,
                )
                .whereType<SubCategoryModel>()
                .toList()
          : []),
      products: (json['products'] is List
          ? (json['products'] as List)
                .map(
                  (e) => e is Map<String, dynamic>
                      ? ProductModelNew.fromJson(e)
                      : null,
                )
                .whereType<ProductModelNew>()
                .toList()
          : []),
    );
  }
}

@HiveType(typeId: 1)
class SubCategoryModel extends HiveObject {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final int groupMainCategoryId;

  @HiveField(2)
  final String name;

  @HiveField(3)
  final String nameAr;

  @HiveField(4)
  final String? image;

  @HiveField(5)
  final String? slug;

  SubCategoryModel({
    required this.id,
    required this.groupMainCategoryId,
    required this.name,
    required this.nameAr,
    this.image,
    this.slug,
  });
  factory SubCategoryModel.fromJson(Map<String, dynamic> json) {
    return SubCategoryModel(
      id: json['id'] ?? 0,
      groupMainCategoryId: json['group_main_category_id'] ?? 0,
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      image: json['image'],
      slug: json['slug'],
    );
  }
}

@HiveType(typeId: 2)
class ProductModelNew extends HiveObject {
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
  final ProductCategory? productCategory;

  @HiveField(6)
  final ProductPrice price;

  @HiveField(7)
  final List<ProductImage> images;

  ProductModelNew({
    required this.productId,
    required this.productSku,
    required this.currencyCode,
    required this.name,
    required this.nameAr,
    this.productCategory,
    required this.price,
    required this.images,
  });

  factory ProductModelNew.fromJson(Map<String, dynamic> json) {
    // price can be Map or List
    final dynamic priceJson = json['price'];
    Map<String, dynamic> resolvedPrice = {};

    if (priceJson is List && priceJson.isNotEmpty) {
      resolvedPrice = Map<String, dynamic>.from(priceJson.first);
    } else if (priceJson is Map<String, dynamic>) {
      resolvedPrice = Map<String, dynamic>.from(priceJson);
    }

    return ProductModelNew(
      productId: json['product_id'] ?? 0,
      productSku: json['product_sku'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      productCategory: json['product_category'] is Map<String, dynamic>
          ? ProductCategory.fromJson(json['product_category'])
          : null,
      price: ProductPrice.fromJson(resolvedPrice),
      images: (json['images'] as List? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(ProductImage.fromJson)
          .toList(),
    );
  }
}

@HiveType(typeId: 3)
class ProductCategory extends HiveObject {
  @HiveField(0)
  final String name;

  @HiveField(1)
  final String nameAr;

  ProductCategory({required this.name, required this.nameAr});
  factory ProductCategory.fromJson(Map<String, dynamic> json) {
    return ProductCategory(
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
    );
  }
}

@HiveType(typeId: 4)
class ProductPrice extends HiveObject {
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

  ProductPrice({
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
  factory ProductPrice.fromJson(Map<String, dynamic> json) {
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

    /// 🔹 NORMAL PRICE RESOLUTION
    if (json.containsKey('normal_price')) {
      resolvedNormalPrice = parseNum(json['normal_price']);
    }
    /// 🔹 SIMPLE PRICE CASE
    else if (hasNormal && json.containsKey('price')) {
      resolvedNormalPrice = parseNum(json['price']);
    }
    return ProductPrice(
      quantity: json['quantity'],
      normalPrice: resolvedNormalPrice,
      salePrice: hasSale ? parseNum(json['sale_price']) : null,
      offerPrice: hasOffer ? parseNum(json['offer_price']) : null,
      bundlePrice: hasBundle ? parseNum(json['price']) : null,
      hasSale: hasSale,
      hasOffer: hasOffer,
      hasBundle: hasBundle,
      hasNormal: hasNormal,
      // quantity: json['quantity'],
      // normalPrice: parseNum(json['normal_price']),
      // salePrice: json['sale_price'] != null
      //     ? parseNum(json['sale_price'])
      //     : null,
      // offerPrice: json['offer_price'] != null
      //     ? parseNum(json['offer_price'])
      //     : null,
      // bundlePrice: json['price'] != null ? parseNum(json['price']) : null,
      // hasSale: json['has_sale'] ?? false,
      // hasOffer: json['has_offer'] ?? false,
      // hasBundle: json['has_bundle'] ?? false,
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
    if (getDisplayPrice() != normalPrice) {
      return normalPrice;
    }
    return null;
  }
}

@HiveType(typeId: 5)
class ProductImage extends HiveObject {
  @HiveField(0)
  final String image;

  @HiveField(1)
  final int isMain;

  @HiveField(2)
  final int isArabicMain;

  ProductImage({
    required this.image,
    required this.isMain,
    required this.isArabicMain,
  });
  factory ProductImage.fromJson(Map<String, dynamic> json) {
    int parseFlag(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is bool) return value ? 1 : 0;
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    return ProductImage(
      image: json['image'] ?? '',
      isMain: parseFlag(json['isMain']),
      isArabicMain: parseFlag(json['isArabicMain']),
    );
  }
}
