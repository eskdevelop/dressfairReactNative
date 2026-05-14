import 'dart:developer';
import 'dart:io';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetCustomerInfoApi {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Profile Info:
  Future<dynamic> getCustomerInfo({required String sessionToken}) async {
    try {
      dynamic response = await _apiServices.fetchGetResponse(
        AppUrl().customerInfoApi,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  // Future<dynamic> updateCustomerInfo({
  //   required String sessionToken,
  //   required Map<String, dynamic> data,
  // }) async
  // {
  //   try {
  //     log("Url Update Profile == ${AppUrl().customerUpdateInfoApi}");
  //     dynamic response = await _apiServices.sendPutRequest(
  //       AppUrl().customerUpdateInfoApi,
  //       data,
  //       sessionToken,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }
  Future<dynamic> updateCustomerInfo({
    required String sessionToken,
    required Map<String, String> fields,
    File? imageFile,
  }) async {
    try {
      log("Url Update Profile == ${AppUrl().customerUpdateInfoApi}");

      dynamic response = await _apiServices.sendMultipartPostRequest(
        AppUrl().customerUpdateInfoApi,
        fields,
        imageFile,
        sessionToken,
      );

      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
