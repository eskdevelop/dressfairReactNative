import 'package:hive/hive.dart';

class CartCacheHelper {
  static const String boxName = 'cart_cache';
  static const String cartKey = 'cart_items';

  /// Ensure the box is open:
  Future<Box> _getBox() async {
    if (!Hive.isBoxOpen(boxName)) {
      return await Hive.openBox(boxName);
    }
    return Hive.box(boxName);
  }

  /// Get all cart items:
  Future<List<Map<String, dynamic>>> getCartItems() async {
    final box = await _getBox();
    final cached = box.get(cartKey);

    if (cached != null && cached is List) {
      return cached.map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return [];
  }

  /// Save full cart list
  Future<void> saveCartItems(List<Map<String, dynamic>> items) async {
    final box = await _getBox();
    await box.put(cartKey, items);
  }

  /// Add or update item with price list
  Future<void> addOrUpdateItem({
    required int productId,
    required String name,
    required String image,
    required double price,
    required int quantity,
    required String size,
    required String color,
    required String sku,
    required int optionId,
    required List<Map<String, dynamic>> priceList,
  }) async {
    final items = await getCartItems();

    final index = items.indexWhere(
      (e) =>
          e['productId'] == productId &&
          e['size'] == size &&
          e['color'] == color,
    );

    if (index != -1) {
      // Update quantity of existing item
      items[index]['quantity'] = (items[index]['quantity'] as int) + quantity;
    } else {
      // Add new item with price list
      items.add({
        'productId': productId,
        'name': name,
        'image': image,
        'price': price,
        'quantity': quantity,
        'size': size,
        'color': color,
        'sku': sku,
        'optionId': optionId,
        'priceList': priceList,
      });
    }

    await saveCartItems(items);
  }

  /// Update quantity for existing item
  Future<void> updateQuantity({
    required int productId,
    required String size,
    required String color,
    required int newQuantity,
  }) async {
    final items = await getCartItems();

    final index = items.indexWhere(
      (e) =>
          e['productId'] == productId &&
          e['size'] == size &&
          e['color'] == color,
    );

    if (index != -1) {
      items[index]['quantity'] = newQuantity;
      await saveCartItems(items);
    }
  }

  /// Delete single cart item
  Future<void> deleteItem({
    required int productId,
    required String size,
    required String color,
  }) async {
    final items = await getCartItems();

    items.removeWhere(
      (e) =>
          e['productId'] == productId &&
          e['size'] == size &&
          e['color'] == color,
    );

    await saveCartItems(items);
  }

  /// Clear cart
  Future<void> clearCart() async {
    final box = await _getBox();
    await box.clear();
  }

  /// Get item count - FIXED
  Future<int> getItemCount() async {
    final items = await getCartItems();

    // Explicitly type the fold operation
    int total = 0;
    for (var item in items) {
      total += (item['quantity'] as int? ?? 0);
    }
    return total;

    // OR using fold with explicit types:
    // return items.fold<int>(0, (sum, e) => sum + (e['quantity'] as int? ?? 0));
  }

  /// Get total price - FIXED
  Future<double> getTotalPrice() async {
    final items = await getCartItems();

    // Explicitly type the fold operation
    double total = 0.0;
    for (var item in items) {
      final price = (item['price'] as num? ?? 0.0).toDouble();
      final quantity = (item['quantity'] as int? ?? 1);
      total += price * quantity;
    }
    return total;

    // OR using fold with explicit types:
    // return items.fold<double>(0.0, (sum, e) {
    //   final price = (e['price'] as num? ?? 0.0).toDouble();
    //   final quantity = (e['quantity'] as int? ?? 1);
    //   return sum + (price * quantity);
    // });
  }
}
