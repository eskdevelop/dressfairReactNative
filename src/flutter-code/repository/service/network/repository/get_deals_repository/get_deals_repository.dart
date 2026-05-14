import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetDealsRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getDeals({
    required String sessionToken,
    required String slug,
    int page = 1,
  }) async {
    try {
      String url = "${AppUrl().getDealsApi}/$slug?page=$page";
      //     "${AppUrl.baseUrl}/rest_api.productsLp"
      //     "&limit=$limit"
      //     "&simple=$simple"
      //     "&cate_slug=$cateSlug"
      //     "&option_value=$optionValue"
      //     "&size_value=$sizeValue"
      //     "&attribute_value=$attributeValue"
      //     "&page=$page";

      if (slug.isEmpty) {
        url = "${AppUrl().getDealsApi}?page=$page";
      }
      // debugPrint("👉 API URL: $url");
      log("Url In Deals  ==$url");

      dynamic response = await _apiServices.fetchGetResponse(url, sessionToken);
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
