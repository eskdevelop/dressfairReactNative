import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SubmitOrderRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Confirm Order post request :
  Future<dynamic> confirmOrder({
    required String sessionToken,

    required Map<String, dynamic> body,
  }) async {
    try {
      // Map<String, int> body = {"is_ccavenue": 0};
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().placeOrderApi,
        body,
        sessionToken,

        ///  language,
      );
      // dynamic response = await _apiServices.sendPostWithoutBody(
      //   AppUrl.placeOrderApi,
      //   sessionToken,
      //   language,
      // );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Confirm Order Put request :
  Future<dynamic> confirmOrderPut({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.sendPutRequest(
    //     AppUrl().confirmOrder,
    //     null,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }

  /// Get Success orders :
  Future<dynamic> getSuccessOrders({
    required String sessionToken,
    required String orderId,
  }) async {
    try {
      String fullUrl = "${AppUrl().successOrderDetailsApi}/$orderId";
      dynamic response = await _apiServices.fetchGetResponse(
        fullUrl,
        sessionToken,

        //  language,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
