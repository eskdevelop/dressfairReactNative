import 'package:dress_fair_ecommmerce/model/related_category_model/related_category_model.dart';
import 'package:hive/hive.dart';

class RelatedProductCacheHelper {
  static const String boxName = 'related_product_cache';

  /// Save list of related products for a given category ID
  Future<void> saveRelatedProducts(
    int categoryId,
    List<RelatedCategoryModel> products,
  ) async {
    final box = Hive.box(boxName);
    await box.put(categoryId, products);
  }

  /// Get cached related products
  List<RelatedCategoryModel> getRelatedProducts(int categoryId) {
    final box = Hive.box(boxName);
    final cached = box.get(categoryId);
    if (cached != null && cached is List) {
      return cached.cast<RelatedCategoryModel>();
    }
    return [];
  }

  /// Remove cache for a single category
  Future<void> removeRelatedProducts(int categoryId) async {
    final box = Hive.box(boxName);
    await box.delete(categoryId);
  }

  /// Clear all cached related products
  Future<void> clearCache() async {
    final box = Hive.box(boxName);
    await box.clear();
  }
}
