import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AddToCartRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Add To Cart:
  Future<dynamic> addToCart({
    required String sessionToken,
    required Map<String, dynamic> body,
  }) async {
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().addToCartAnalyticsApi,
        body,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
