import 'package:dress_fair_ecommmerce/model/category_model/category_model.dart';
import 'package:hive/hive.dart';

class CategoryCacheHelper {
  final Box<CategoryModel> _box = Hive.box<CategoryModel>('categories');

  /// Save categories in bulk for performance
  Future<void> saveCategories(List<CategoryModel> categories) async {
    final Map<int, CategoryModel> map = {
      for (var category in categories) category.id: category,
    };
    await _box.clear();
    await _box.putAll(map); // faster than looping
  }

  List<CategoryModel> getCategories() => _box.values.toList();

  bool hasData() => _box.isNotEmpty;
}
