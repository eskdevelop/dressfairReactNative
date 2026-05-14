import 'package:hive/hive.dart';

import '../../model/best_sellers_model/best_sellers_model.dart';

class NewArrivalsCacheHelper {
  static const String boxName = 'new_arrivals_cache';

  Future<void> saveProducts(List<ProductItem> products) async {
    final box = Hive.box(boxName);
    await box.put('first_page', products.map((e) => e.toJson()).toList());
  }

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

  Future<void> clearCache() async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}
