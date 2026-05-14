import 'package:hive/hive.dart';

import '../../model/main_product_model/main_product_model.dart';

class ProductCacheHelper {
  static const productsBoxName = 'main_products';
  static const categoryBoxName = 'category_products';
  static const metaBoxName = 'cache_meta';

  Box<MainProductModel> get _productsBox =>
      Hive.box<MainProductModel>(productsBoxName);

  Box<List> get _categoryBox => Hive.box<List>(categoryBoxName);

  Box get _metaBox => Hive.box(metaBoxName);

  /// Save products for a category
  Future<void> saveCategoryProducts(
    String slug,
    List<MainProductModel> products,
  ) async {
    final ids = <int>[];

    for (final product in products) {
      ids.add(product.productId);
      await _productsBox.put(product.productId, product);
    }

    await _categoryBox.put(slug, ids);
    await _metaBox.put('products_last_sync', DateTime.now());
  }

  /// Load products for category
  List<MainProductModel> getCategoryProducts(String slug) {
    final ids = _categoryBox.get(slug);
    if (ids == null) return [];

    return ids
        .map((id) => _productsBox.get(id))
        .whereType<MainProductModel>()
        .toList();
  }

  bool isExpired({int hours = 6}) {
    final lastSync = _metaBox.get('products_last_sync');
    if (lastSync == null) return true;

    return DateTime.now().difference(lastSync).inHours > hours;
  }
}
