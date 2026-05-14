import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetAddToCartRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Add To Cart:
  // Future<dynamic> getAddToCart({required String sessionToken}) async {
  //   try {
  //     dynamic response = await _apiServices.fetchGetResponse(
  //       AppUrl().addToCart,
  //       sessionToken,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  /// Get Best Seller :
  // Future<dynamic> getBestSeller({
  //   required String sessionToken,
  //   required int page,
  // }) async {
  //   try {
  //     dynamic response = await _apiServices.fetchGetResponse(
  //       AppUrl.getBestSeller,
  //       sessionToken,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  /// Get Great Day :
  // Future<dynamic> getGreatDay({
  //   required String sessionToken,
  //   required int page,
  // }) async {
  //   try {
  //     final url =
  //         "${AppUrl.getGreatDay}"
  //         "&page=$page";
  //     dynamic response = await _apiServices.fetchGetResponse(url, sessionToken);
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  /// New Arrivals:
  // Future<dynamic> getNewArrivals({
  //   required String sessionToken,
  //   required int page,
  // }) async {
  //   try {
  //     final url =
  //         "${AppUrl().newArrivals}"
  //         "&page=$page";
  //     dynamic response = await _apiServices.fetchGetResponse(url, sessionToken);
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }
}
