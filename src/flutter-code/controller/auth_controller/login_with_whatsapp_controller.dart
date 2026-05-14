import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/auth_repository/sign_in_repository/sigin_with_whatsapp_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../customer_profile/customer_profile_controller.dart';

class LoginWithWhatsappController {
  Rx<TextEditingController> whatsappController = TextEditingController().obs;
  SignInWithWhatsAppRepository apiRepository = SignInWithWhatsAppRepository();
  RxBool isLoading = false.obs;
  SessionController sessionController = Get.find<SessionController>();
  GetProfileController getProfileController = Get.find<GetProfileController>();

  ///Login with WhatsApp:
  Future<void> sigInWithWhatsapp(bool fromOtp) async {
    if (await InternetController.checkUserConnection()) {
      try {
        String fullPhone =
            '${sessionController.countryConfig.value?.mobileCode ?? ""}${whatsappController.value.text}';

        isLoading.value = true;
        var response = await apiRepository.signInWhatsappApi(
          sessionToken: sessionController.sessionToken.value,
          phone: fullPhone,
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess("verificationCodeSendSuccessfully".tr);
          if (!fromOtp) {
            Get.offNamed(otpScreen, arguments: {"phone": fullPhone});
          }
        } else {
          AppToast.showError(response?["error"]);
        }
        isLoading.value = false;
      } catch (e) {
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Verify OTP:
  Future<void> verifyOTP(
    String username,
    String otp,
    BuildContext context,
  ) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.verifyOTPApi(
          username: username,
          otp: otp,
        );
        log("Response  1== $response");

        if (response != null && response["success"] == true) {
          log("Response == $response");
          final customer = response['customer'] ?? {};
          sessionController.isUserLoginIn.value = true;
          await UserPreferences.setIsUserLogin(true);
          // 🔐 Token:
          sessionController.sessionToken.value =
              response['token']?.toString() ?? '';

          await UserPreferences.setSessionToken(
            sessionController.sessionToken.value,
          );
          // 👤 User ID
          sessionController.userId.value = customer['id']?.toString() ?? " 0";
          // 👤 Full Name
          final firstName = customer['firstname']?.toString() ?? '';
          final lastName = customer['lastname']?.toString() ?? '';
          sessionController.name.value = '$firstName $lastName'.trim();
          // 📧 Email:
          sessionController.email.value = customer['email']?.toString() ?? '';
          // 📱 Mobile (nullable-safe):
          sessionController.mobile.value = customer['mobile']?.toString() ?? '';
          AppToast.showSuccess("Login Successfully");
          await getProfileController.getCustomerProfile(false);
          Get.until((route) => route.settings.name == homeScreen);
        } else {
          AppToast.showError(
            response?["message"]?.toString() ?? "Login failed",
          );
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in Verify OTP ==${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  // /// For Fb,tiktok Tracking:
  // void trackLogin({required String userId}) {
  //   TikTokService().identifyUser(userId: userId);
  // }

  /// For Fb,tiktok Tracking:
  void identifyUser({
    required String userName,
    required String phoneNo,
    required email,
    required String userId,
  }) {
    TikTokService().handleIdentify(
      email: email,
      phoneNo: phoneNo,
      userName: userName,
      userID: userId,
    );
  }
}
