import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SessionRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  // Future<dynamic> getSession() async {
  //   try {
  //     log("Url For Session = ${AppUrl().session}");
  //     dynamic response = await _apiServices.setSession(AppUrl.session);
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  // Future<dynamic> getConfig({
  //   required String sessionToken,
  //   required String language,
  // }) async {
  //   try {
  //     dynamic response = await _apiServices.fetchGetResponse(
  //       AppUrl.config,
  //       sessionToken,
  //       language,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  ///Get Base Url:
  Future<dynamic> getBaseUrl({String? sessionToken, String? language}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl().,
    //     "",
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }

  /// Get Store setting :
  // Future<dynamic> getStoreSetting() async {
  //   try {
  //     log("Super Base Url = ${AppUrl.settingApi}");
  //     dynamic response = await _apiServices.getStoreSetting(AppUrl.settingApi);
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  Future<dynamic> getConfig({required String sessionToken}) async {
    try {
      log("Calling Setting APi ==${AppUrl().settingApi}");
      dynamic response = await _apiServices.fetchGetResponse(
        AppUrl().settingApi,
        "",
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
