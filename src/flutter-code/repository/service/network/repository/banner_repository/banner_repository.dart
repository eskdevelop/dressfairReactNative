import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class BannerRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getBanner({required String sessionToken}) async {
    try {
      dynamic response = await _apiServices.fetchGetResponse(
        AppUrl().bannerApi,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
