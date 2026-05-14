import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetProfileRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Profile Info:
  Future<dynamic> getProfileInfo({required String sessionToken}) async {
    //   try {
    //     dynamic response = await _apiServices.fetchGetResponse(
    //       AppUrl.customerProfile,
    //       sessionToken,
    //     );
    //     return response;
    //   } catch (e) {
    //     debugPrint(e.toString());
    //     return {};
    //   }
    // }
    return {};
  }
}
