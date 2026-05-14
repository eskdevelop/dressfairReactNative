import 'package:hive/hive.dart';

class RecentSearchHelper {
  static const _boxName = 'recent_searches';

  Future<Box<String>> _openBox() async {
    return await Hive.openBox<String>(_boxName);
  }

  Future<void> addSearch(String query) async {
    final box = await _openBox();
    final existingKey = box.keys.firstWhere(
      (key) => box.get(key) == query,
      orElse: () => null,
    );
    if (existingKey != null) {
      await box.delete(existingKey);
    }
    await box.add(query);
    if (box.length > 3) {
      await box.deleteAt(0);
    }
  }

  Future<List<String>> getSearches() async {
    final box = await _openBox();
    return box.values.toList().reversed.toList();
  }

  Future<void> removeSearch(String query) async {
    final box = await _openBox();
    final key = box.keys.firstWhere(
      (key) => box.get(key) == query,
      orElse: () => null,
    );
    if (key != null) {
      await box.delete(key);
    }
  }

  Future<void> clearSearches() async {
    final box = await _openBox();
    await box.clear();
  }
}
