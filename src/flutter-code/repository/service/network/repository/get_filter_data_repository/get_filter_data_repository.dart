import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetFilterDataRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Filtered Data :
  Future<dynamic> getFilteredData({
    required String sessionToken,
    required int categoryId,
  }) async {
    // try {
    //   String fullUrl = "${AppUrl.filterData}&category_id=$categoryId";
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     fullUrl,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
    return {};
  }
}
