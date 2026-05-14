import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class CategoryRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getCategory({required String sessionToken}) async {
    try {
      log("Calling Category APi ==${AppUrl().categoryApi}");
      dynamic response = await _apiServices.fetchGetResponse(
        AppUrl().categoryApi,
        "",
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
