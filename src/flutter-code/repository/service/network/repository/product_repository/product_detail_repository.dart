import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class ProductDetailRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  ///Get Product Detail:
  Future<dynamic> getProductsDetail({
    required String sessionToken,
    required String cateSlug,
  }) async {
    try {
      // final url = "${AppUrl.baseUrl}/rest_api.productsLp&slug=$cateSlug";
      // final url = "${AppUrl.baseUrl}/rest_api.productsLp&slug=$cateSlug";
      final url = "${AppUrl().productDetailsApi}/$cateSlug";

      debugPrint("👉 API URL In Detail Product API: $url");
      dynamic response = await _apiServices.fetchGetResponse(
        url,
        "",

        //  sessionToken,
        //language,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  ///Get Related Product:
  Future<dynamic> getRelatedProduct({
    required String sessionToken,
    required int category,
    required String page,
    required int simple,
  }) async {
    // try {
    //   final url =
    //       //  "https://backend.dressfair.com/index.php?route=extension/opencart/rest_api.productsLp&category=65&page=1&simple=1&limit=12";
    //       "${AppUrl().baseUrl}/rest_api.productsLp&category=$category&page=$page&simple=1&limit=24";
    //
    //   debugPrint("👉 API URL: $url");
    //   dynamic response = await _apiServices.fetchGetResponse(url, sessionToken);
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }
}
