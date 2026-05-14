import 'package:hive/hive.dart';

part 'best_sellers_model.g.dart';

@HiveType(typeId: 15)
class ProductItem extends HiveObject {
  @HiveField(0)
  final String productId;

  @HiveField(1)
  final String sku;

  @HiveField(2)
  final String model;

  @HiveField(3)
  final String name;

  @HiveField(4)
  final String price;

  @HiveField(5)
  final String special;

  @HiveField(6)
  final int percentOff;

  @HiveField(7)
  final String image;

  @HiveField(8)
  final String mImage;

  @HiveField(9)
  final String quantity;

  @HiveField(10)
  final String currencyCode;

  @HiveField(11)
  final double rating; // ⭐ Added field
  @HiveField(12)
  final int totalReviews; // ⭐ New field

  ProductItem({
    required this.productId,
    required this.sku,
    required this.model,
    required this.name,
    required this.price,
    required this.special,
    required this.percentOff,
    required this.image,
    required this.mImage,
    required this.quantity,
    required this.currencyCode,
    required this.rating,
    required this.totalReviews,
  });

  factory ProductItem.fromJson(Map<String, dynamic> json) {
    return ProductItem(
      productId: json['product_id'] ?? '',
      sku: json['sku'] ?? '',
      model: json['model'] ?? '',
      name: json['name'] ?? '',
      price: json['price'] ?? '',
      special: json['special'] ?? '',
      percentOff: json['percent_off'] is int
          ? json['percent_off']
          : int.tryParse(json['percent_off'].toString()) ?? 0,
      image: json['image'] ?? '',
      mImage: json['m_image'] ?? '',
      quantity: json['quantity'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      rating: _parseDouble(json['rating']),
      totalReviews: json['total_reviews'] != null
          ? int.tryParse(json['total_reviews'].toString()) ?? 0
          : 0, // default 0 if missing
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'sku': sku,
      'model': model,
      'name': name,
      'price': price,
      'special': special,
      'percent_off': percentOff,
      'image': image,
      'm_image': mImage,
      'quantity': quantity,
      'currency_code': currencyCode,
      'rating': rating,
      'total_reviews': totalReviews,
    };
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  /// Optional: Limit list to max 24 items for caching:
  static List<ProductItem> trimList(
    List<ProductItem> list, [
    int maxItems = 24,
  ]) {
    if (list.length <= maxItems) return list;
    return list.sublist(0, maxItems);
  }
}
