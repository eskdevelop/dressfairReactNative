import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class FeatureCategoryRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getFeatureCategory({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl().getFeaturedCategory,
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
