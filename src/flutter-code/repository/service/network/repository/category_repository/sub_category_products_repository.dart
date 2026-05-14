import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SubCategoryProductRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getSubCategoryProducts({
    required String sessionToken,
    int limit = 24,
    int simple = 1,
    required String cateSlug,
    int page = 1,
    String optionValue = '',
    String sizeValue = '',
    String attributeValue = '',
    String sort = '',
    String order = '',
  }) async {
    try {
      String url = "${AppUrl().productApi}/$cateSlug?page=$page";
      //     "${AppUrl.baseUrl}/rest_api.productsLp"
      //     "&limit=$limit"
      //     "&simple=$simple"
      //     "&cate_slug=$cateSlug"
      //     "&option_value=$optionValue"
      //     "&size_value=$sizeValue"
      //     "&attribute_value=$attributeValue"
      //     "&page=$page";

      if (sort.isNotEmpty) {
        url += "&sort=$sort";
      }
      if (order.isNotEmpty) {
        url += "&order=$order";
      }

      debugPrint("👉 More Describe PRODUCTS API: $url");

      // if (cateSlug.isEmpty) {
      //   url = "${AppUrl().productApi}?page=$page";
      // }

      log("Url In Product  ==$url");
      dynamic response = await _apiServices.fetchGetResponse(url, "");
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
