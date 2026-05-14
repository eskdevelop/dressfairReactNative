import 'package:hive/hive.dart';

import '../../model/banner_model/banner_model.dart';

class BannerCacheHelper {
  static const bannersBoxName = 'banners';
  static const metaBoxName = 'cache_meta';

  Box<BannerModel> get _bannersBox => Hive.box<BannerModel>(bannersBoxName);
  Box get _metaBox => Hive.box(metaBoxName);

  /// Save banners in bulk
  Future<void> saveBanners(List<BannerModel> banners) async {
    // Save each banner by its index (or any unique identifier if available)
    for (int i = 0; i < banners.length; i++) {
      await _bannersBox.put(i, banners[i]);
    }

    // Save timestamp for cache expiration
    await _metaBox.put('banners_last_sync', DateTime.now());
  }

  /// Get all cached banners
  List<BannerModel> getBanners() => _bannersBox.values.toList();

  /// Check if cache is expired
  bool isExpired({int hours = 6}) {
    final lastSync = _metaBox.get('banners_last_sync');
    if (lastSync == null) return true;
    return DateTime.now().difference(lastSync).inHours > hours;
  }

  /// Clear all banners
  Future<void> clearCache() async {
    await _bannersBox.clear();
    await _metaBox.delete('banners_last_sync');
  }
}
