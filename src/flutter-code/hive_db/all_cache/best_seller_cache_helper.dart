import 'package:hive/hive.dart';

import '../../model/best_sellers_model/best_sellers_model.dart';

class BestSellerCacheHelper {
  static const String boxName = 'best_sellers_cache';

  /// Save first page of best sellers
  Future<void> saveProducts(List<ProductItem> products) async {
    final box = Hive.box(boxName);
    await box.put('first_page', products.map((e) => e.toJson()).toList());
  }

  /// Get cached products
  List<ProductItem> getProducts() {
    final box = Hive.box(boxName);
    final cached = box.get('first_page');
    if (cached != null && cached is List) {
      return cached
          .map((e) => ProductItem.fromJson(Map<String, dynamic>.from(e)))
          .toList();
    }
    return [];
  }

  /// Clear cache
  Future<void> clearCache() async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}
