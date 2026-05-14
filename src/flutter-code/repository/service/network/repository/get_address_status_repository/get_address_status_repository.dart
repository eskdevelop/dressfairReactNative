import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetOrderStatusRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Address:
  Future<dynamic> getOrderStatus({required String sessionToken}) async {
    try {
      dynamic response = await _apiServices.fetchGetResponse(
        AppUrl().orderHistoryApi,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Get Order By ID:
  // Future<dynamic> getOrderByID({
  //   required String sessionToken,
  //   required String id,
  // }) async {
  //   try {
  //     String fullAddress = "${AppUrl().getOrdersStatus}&id=$id";
  //     dynamic response = await _apiServices.fetchGetResponse(
  //       fullAddress,
  //       sessionToken,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }
}
