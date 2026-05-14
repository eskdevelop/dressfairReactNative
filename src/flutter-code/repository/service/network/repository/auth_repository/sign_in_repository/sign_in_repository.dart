import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SignInRepository {
  final BaseApiServices _apiServices = NetworkApiService();
  SessionController sessionController = Get.find<SessionController>();
  //  SignIn
  Future<dynamic> signInApi({required String token}) async {
    Map<String, String> body = {"token": token};
    try {
      log(" Token 123 == $token");

      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().googleLoginApi,
        body,
        "",
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
