import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetStoreBackendRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Store setting :
  Future<dynamic> getStoreSetting() async {
    try {
      log("Super Base Url = ${AppUrl().settingApi}");
      dynamic response = await _apiServices.getStoreSetting(
        AppUrl().settingApi,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
