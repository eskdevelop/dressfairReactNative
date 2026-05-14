import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class NewArrivalRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// New Arrivals:
  Future<dynamic> getNewArrivals({
    required String sessionToken,
    required int page,
    required bool isPagination,
  }) async {
    try {
      String url = AppUrl().newArrivalApi;
      if (isPagination) {
        url =
            "${AppUrl().newArrivalApi}"
            "?page=$page";
      }
      dynamic response = await _apiServices.fetchGetResponse(url, sessionToken);
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
