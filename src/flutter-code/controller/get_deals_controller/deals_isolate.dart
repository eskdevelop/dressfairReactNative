import 'dart:convert';

import 'package:dress_fair_ecommmerce/model/deals_model/deals_model.dart';

List<DealProductModel> parseDeals(String responseBody) {
  final Map<String, dynamic> parsedJson = jsonDecode(responseBody);
  final List<dynamic> dataList = parsedJson['data'] ?? [];
  return dataList
      .whereType<Map<String, dynamic>>()
      .map((e) => DealProductModel.fromJson(e))
      .toList();
}
