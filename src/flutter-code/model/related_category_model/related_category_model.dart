import 'package:hive/hive.dart';

part 'related_category_model.g.dart';

@HiveType(typeId: 10)
class RelatedCategoryModel {
  @HiveField(0)
  final int id;

  @HiveField(1)
  final bool wishList;

  @HiveField(2)
  final int productId;

  @HiveField(3)
  final int categoryId;

  @HiveField(4)
  final String name;

  @HiveField(5)
  final String? manufacturer;

  @HiveField(6)
  final int percentOff;

  @HiveField(7)
  final String seoUrl;

  @HiveField(8)
  final String slug;

  @HiveField(9)
  final String model;

  @HiveField(10)
  final String image;

  @HiveField(11)
  final String mImage;

  @HiveField(12)
  final List<String> images;

  @HiveField(13)
  final String originalImage;

  @HiveField(14)
  final List<String> originalImages;

  @HiveField(15)
  final String priceExcludingTax;

  @HiveField(16)
  final String price;

  @HiveField(17)
  final double rating;

  @HiveField(18)
  final String details;

  @HiveField(19)
  final String description;

  @HiveField(20)
  final String special;

  @HiveField(21)
  final List<dynamic> options;

  @HiveField(22)
  final String metaTitle;

  @HiveField(23)
  final String metaDescription;

  @HiveField(24)
  final String metaKeyword;

  @HiveField(25)
  final int manufacturerId;

  @HiveField(26)
  final String weight;

  @HiveField(27)
  final dynamic reward;

  @HiveField(28)
  final String points;

  @HiveField(29)
  final int quantity;

  @HiveField(30)
  final List<dynamic> reviews;

  @HiveField(31)
  final int totalReviews;

  @HiveField(32)
  final List<dynamic> attributes;

  @HiveField(33)
  final int dealsFreeShipping;

  @HiveField(34)
  final List<dynamic> relatedCategory;

  @HiveField(35)
  final List<dynamic> productsSeries;

  @HiveField(36)
  final String currencyCode;

  RelatedCategoryModel({
    required this.id,
    required this.wishList,
    required this.productId,
    required this.categoryId,
    required this.name,
    this.manufacturer,
    required this.percentOff,
    required this.seoUrl,
    required this.slug,
    required this.model,
    required this.image,
    required this.mImage,
    required this.images,
    required this.originalImage,
    required this.originalImages,
    required this.priceExcludingTax,
    required this.price,
    required this.rating,
    required this.details,
    required this.description,
    required this.special,
    required this.options,
    required this.metaTitle,
    required this.metaDescription,
    required this.metaKeyword,
    required this.manufacturerId,
    required this.weight,
    this.reward,
    required this.points,
    required this.quantity,
    required this.reviews,
    required this.totalReviews,
    required this.attributes,
    required this.dealsFreeShipping,
    required this.relatedCategory,
    required this.productsSeries,
    required this.currencyCode,
  });

  factory RelatedCategoryModel.fromJson(Map<String, dynamic> json) {
    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is int) return value.toDouble();
      if (value is double) return value;
      if (value is String) return double.tryParse(value) ?? 0.0;
      return 0.0;
    }

    int parseInt(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is double) return value.round();
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }

    List<String> parseStringList(dynamic value) {
      if (value == null) return [];
      if (value is List) return value.map((e) => e.toString()).toList();
      return [];
    }

    List<dynamic> parseDynamicList(dynamic value) {
      if (value == null) return [];
      if (value is List) return value;
      return [];
    }

    return RelatedCategoryModel(
      id: parseInt(json['id']),
      wishList: json['wish_list'] ?? false,
      productId: parseInt(json['product_id']),
      categoryId: parseInt(json['category_id']),
      name: json['name'] ?? '',
      manufacturer: json['manufacturer'],
      percentOff: parseInt(json['percent_off']),
      seoUrl: json['seo_url'] ?? '',
      slug: json['slug'] ?? '',
      model: json['model'] ?? '',
      image: json['image'] ?? '',
      mImage: json['m_image'] ?? '',
      images: parseStringList(json['images']),
      originalImage: json['original_image'] ?? '',
      originalImages: parseStringList(json['original_images']),
      priceExcludingTax: json['price_excluding_tax']?.toString() ?? '0',
      price: json['price']?.toString() ?? '0',
      rating: parseDouble(json['rating']), // <-- safe parsing
      details: json['details'] ?? '',
      description: json['description'] ?? '',
      special: json['special'] ?? '',
      options: parseDynamicList(json['options']),
      metaTitle: json['meta_title'] ?? '',
      metaDescription: json['meta_description'] ?? '',
      metaKeyword: json['meta_keyword'] ?? '',
      manufacturerId: parseInt(json['manufacturer_id']),
      weight: json['weight']?.toString() ?? '0.00',
      reward: json['reward'],
      points: json['points']?.toString() ?? '0',
      quantity: parseInt(json['quantity']),
      reviews: parseDynamicList(json['reviews']),
      totalReviews: parseInt(json['totalReviews']), // <-- fixed typo
      attributes: parseDynamicList(json['attributes']), // <-- fixed typo
      dealsFreeShipping: parseInt(json['deals_free_shipping']),
      relatedCategory: parseDynamicList(json['related_category']),
      productsSeries: parseDynamicList(json['products_series']),
      currencyCode: json['currency_code'] ?? '',
    );
  }
}
