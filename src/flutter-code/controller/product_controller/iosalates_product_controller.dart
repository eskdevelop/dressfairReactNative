import 'dart:convert';

import '../../model/main_product_model/main_product_model.dart';

List<MainProductModel> parseProducts(String responseBody) {
  final Map<String, dynamic> parsedJson = jsonDecode(responseBody);
  final List<dynamic> dataList = parsedJson['data'] ?? [];
  return dataList
      .whereType<Map<String, dynamic>>()
      .map((e) => MainProductModel.fromJson(e))
      .toList();
}
