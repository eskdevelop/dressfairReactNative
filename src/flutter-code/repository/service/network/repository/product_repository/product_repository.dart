import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class ProductRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getProducts({
    required String sessionToken,
    int limit = 24,
    int simple = 1,
    required String cateSlug,
    int page = 1,
    String optionValue = '',
    String sizeValue = '',
    String attributeValue = '',
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

      if (cateSlug.isEmpty) {
        url = "${AppUrl().productApi}?page=$page";
      }

      // debugPrint("👉 API URL: $url");
      log("Url In Product  ==$url");
      dynamic response = await _apiServices.fetchGetResponse(
        url,
        "",

        // sessionToken,
        //  language,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
