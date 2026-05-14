import 'package:dress_fair_ecommmerce/model/banner_model/banner_model.dart';
import 'package:dress_fair_ecommmerce/model/category_model/category_model.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../model/main_product_model/main_product_model.dart';

class HiveDBAllData {
  static bool _initialized = false;

  /// Safely opens a typed Hive box. If the on-disk data is incompatible with
  /// the current adapter schema (e.g. a field type changed), the box is
  /// deleted and recreated so the app can recover instead of crashing.
  static Future<Box<T>> _safeOpenBox<T>(String name) async {
    try {
      return await Hive.openBox<T>(name);
    } catch (e, st) {
      debugPrint('Hive box "$name" is corrupt or schema-incompatible: $e');
      debugPrint('$st');
      try {
        if (Hive.isBoxOpen(name)) {
          await Hive.box<T>(name).close();
        }
      } catch (_) {}
      await Hive.deleteBoxFromDisk(name);
      return Hive.openBox<T>(name);
    }
  }

  /// Same as [_safeOpenBox] but for untyped boxes.
  static Future<Box> _safeOpenUntypedBox(String name) async {
    try {
      return await Hive.openBox(name);
    } catch (e, st) {
      debugPrint('Hive box "$name" is corrupt or schema-incompatible: $e');
      debugPrint('$st');
      try {
        if (Hive.isBoxOpen(name)) {
          await Hive.box(name).close();
        }
      } catch (_) {}
      await Hive.deleteBoxFromDisk(name);
      return Hive.openBox(name);
    }
  }

  /// Initialize Hive & register adapters safely
  static Future<void> initHive() async {
    if (_initialized) return;

    // Initialize Hive for Flutter
    await Hive.initFlutter();

    // ===== OLD MODELS =====
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(CategoryModelAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(SubCategoryModelAdapter());
    }
    if (!Hive.isAdapterRegistered(2)) {
      Hive.registerAdapter(ProductModelNewAdapter());
    }
    if (!Hive.isAdapterRegistered(3)) {
      Hive.registerAdapter(ProductCategoryAdapter());
    }
    if (!Hive.isAdapterRegistered(4)) {
      Hive.registerAdapter(ProductPriceAdapter());
    }
    if (!Hive.isAdapterRegistered(5)) {
      Hive.registerAdapter(ProductImageAdapter());
    }

    // ===== NEW MAIN PRODUCT MODELS =====
    if (!Hive.isAdapterRegistered(20)) {
      Hive.registerAdapter(MainProductModelAdapter());
    }
    if (!Hive.isAdapterRegistered(21)) {
      Hive.registerAdapter(MainProductCategoryAdapter());
    }
    if (!Hive.isAdapterRegistered(22)) {
      Hive.registerAdapter(MainProductPriceAdapter());
    }
    if (!Hive.isAdapterRegistered(23)) {
      Hive.registerAdapter(MainProductImageAdapter());
    }

    // In initHive()
    if (!Hive.isAdapterRegistered(30)) {
      Hive.registerAdapter(BannerModelAdapter());
    }

    if (!Hive.isBoxOpen('banners')) {
      await _safeOpenBox<BannerModel>('banners');
    }

    // ===== OPEN BOXES =====
    if (!Hive.isBoxOpen('categories')) {
      await _safeOpenBox<CategoryModel>('categories');
    }

    if (!Hive.isBoxOpen('cart_cache')) {
      await _safeOpenUntypedBox('cart_cache');
    }

    // OLD products box
    if (!Hive.isBoxOpen('products')) {
      await _safeOpenBox<ProductModelNew>('products');
    }

    // NEW main products box
    if (!Hive.isBoxOpen('main_products')) {
      await _safeOpenBox<MainProductModel>('main_products');
    }

    if (!Hive.isBoxOpen('category_products')) {
      await _safeOpenBox<List>('category_products');
    }

    if (!Hive.isBoxOpen('cache_meta')) {
      await _safeOpenUntypedBox('cache_meta');
    }

    _initialized = true;
  }
}
