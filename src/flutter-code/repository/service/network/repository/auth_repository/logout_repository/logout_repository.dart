import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class LogoutRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Term And Condition:
  Future<dynamic> logout({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.sendPostRequest(
    //     AppUrl().termAndCondition,
    //     {},
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
    return {};
  }

  /// Delete Account:
  Future<dynamic> delete({required String sessionToken}) async {
    //   try {
    //     dynamic response = await _apiServices.sendPostRequest(
    //       AppUrl.deleteAccount,
    //       {},
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
