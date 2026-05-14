import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class RegistrationRepository {
  final BaseApiServices _apiServices = NetworkApiService();
  SessionController sessionController = Get.find<SessionController>();

  /// Sign In With whatsapp:
  Future<dynamic> registrationApi({
    required String firstName,
    required String lastName,
    required String email,
    required String mobile,
    required String password,
  }) async {
    Map<String, String> body = {
      "first_name": firstName,
      "last_name": lastName,
      "email": email,
      "mobile": mobile,
      "password": password,
    };
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().registrationApi,
        body,
        "",
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Sign In With Login:
  Future<dynamic> loginWithEmailPasswordApi({
    required String email,
    required String password,
  }) async {
    Map<String, String> body = {"email": email, "password": password};
    log("Base Url of Email Login == ${AppUrl().loginWithEmailApi}");
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().loginWithEmailApi,
        body,
        "",
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Verify OTP:
  Future<dynamic> verifyEmailOTPApi({
    required String email,
    required String otp,
  }) async {
    Map<String, String> body = {"otp": otp, "email": email};
    try {
      log("Base Url of Email Verify == ${AppUrl().loginWithEmailApi}");
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().verifyEmailOtp,
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
