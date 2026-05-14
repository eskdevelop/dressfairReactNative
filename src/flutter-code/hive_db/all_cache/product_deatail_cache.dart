// import 'dart:convert';
//
// import 'package:dress_fair_ecommmerce/model/detail_category_model/detail_category_model.dart';
// import 'package:hive/hive.dart';
//
// class ProductDetailCacheHelper {
//   static const String boxName = 'product_detail_cache';
//   static const Duration cacheDuration = Duration(hours: 24);
//
//   static Future<void> init() async {
//     if (!Hive.isBoxOpen(boxName)) {
//       await Hive.openBox<String>(boxName); // ✅ stores JSON strings only
//     }
//   }
//
//   /// ✅ Save product detail with timestamp
//   static Future<void> saveProductDetail(
//     String slug,
//     ProductDetailModel product,
//   ) async {
//     final box = Hive.box<String>(boxName);
//
//     final cacheEntry = jsonEncode({
//       'timestamp': DateTime.now().toIso8601String(),
//       'data': product.toJson(), // ← serializable map
//     });
//
//     await box.put(slug, cacheEntry);
//   }
//
//   /// ✅ Load cached detail if not expired
//   static Future<ProductDetailModel?> getProductDetail(
//     String slug,
//     int productId,
//   ) async {
//     final box = Hive.box<String>(boxName);
//     final jsonString = box.get(slug);
//
//     if (jsonString == null) return null;
//
//     final cacheEntry = jsonDecode(jsonString);
//     final timestamp = DateTime.tryParse(cacheEntry['timestamp'] ?? '');
//     if (timestamp == null ||
//         DateTime.now().difference(timestamp) > cacheDuration) {
//       await box.delete(slug);
//       return null;
//     }
//
//     final data = cacheEntry['data'];
//     return ProductDetailModel.fromJson(data);
//   }
//
//   /// ✅ Optional: clear all old cache
//   static Future<void> clearExpiredCache() async {
//     final box = Hive.box<String>(boxName);
//     final now = DateTime.now();
//
//     final keysToDelete = <String>[];
//
//     for (final key in box.keys) {
//       final jsonString = box.get(key);
//       if (jsonString == null) continue;
//
//       final cacheEntry = jsonDecode(jsonString);
//       final timestamp = DateTime.tryParse(cacheEntry['timestamp'] ?? '');
//       if (timestamp == null || now.difference(timestamp) > cacheDuration) {
//         keysToDelete.add(key);
//       }
//     }
//
//     await box.deleteAll(keysToDelete);
//   }
// }
