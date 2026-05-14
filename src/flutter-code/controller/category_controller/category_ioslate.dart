import 'dart:convert';

import 'package:dress_fair_ecommmerce/model/category_model/category_model.dart';

/// Parses categories in a background isolate
List<CategoryModel> parseCategories(String responseBody) {
  final Map<String, dynamic> parsedJson = json.decode(responseBody);
  final dataList = parsedJson['data'] as List? ?? [];

  final List<CategoryModel> fetchedList = dataList
      .whereType<Map<String, dynamic>>()
      .map((item) => CategoryModel.fromJson(item))
      .toList();

  // Collect all subcategories
  List<SubCategoryModel> allSubCategories = [];
  for (var cat in fetchedList) {
    if (cat.subCategories.isNotEmpty) {
      allSubCategories.addAll(cat.subCategories);
    }
  }

  // Take first 10 products for "All" category
  List<ProductModelNew> first10Products = [];
  if (fetchedList.length > 1 && fetchedList[1].products.isNotEmpty) {
    final productsList = fetchedList[1].products;
    first10Products = productsList.length <= 10
        ? List<ProductModelNew>.from(productsList)
        : productsList.sublist(0, 10);
  }

  fetchedList.insert(
    0,
    CategoryModel(
      id: 0,
      name: 'All',
      nameAr: 'الكل',
      subCategories: allSubCategories,
      products: first10Products,
    ),
  );

  return fetchedList;
}
