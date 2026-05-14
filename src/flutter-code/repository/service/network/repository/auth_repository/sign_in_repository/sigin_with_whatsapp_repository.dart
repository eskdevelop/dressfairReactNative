import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SignInWithWhatsAppRepository {
  final BaseApiServices _apiServices = NetworkApiService();
  SessionController sessionController = Get.find<SessionController>();

  /// Sign In With whatsapp:
  Future<dynamic> signInWhatsappApi({
    required String phone,
    required String sessionToken,
  }) async {
    // Map<String, String> body = {"mobile_number": "923706956070"};
    Map<String, String> body = {"mobile_number": phone};
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().whatsappLoginApi,
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
  Future<dynamic> verifyOTPApi({
    required String username,
    required String otp,
  }) async {
    Map<String, String> body = {"otp": otp, "mobile_number": "923309189520"};
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().whatsappOtpLoginApi,
        body,
        "",

        // sessionController.sessionToken.value,
        // language,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
