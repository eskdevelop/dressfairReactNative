import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/customer_profile/customer_profile_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../repository/service/network/repository/auth_repository/sign_in_repository/registration_repository.dart';
import '../session_controller/session_controller.dart';

class LoginWithEmailController {
  RxBool isLoading = false.obs;
  Rx<TextEditingController> loginEmailController = TextEditingController().obs;
  Rx<TextEditingController> loginPassController = TextEditingController().obs;
  SessionController sessionController = Get.find<SessionController>();
  RegistrationRepository apiRepository = RegistrationRepository();
  GetProfileController getProfileController = Get.put(GetProfileController());

  ///Login with Email Password:
  Future<void> loginWithEmailPasswordApi(BuildContext context) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.loginWithEmailPasswordApi(
          email: loginEmailController.value.text.toString(),
          password: loginPassController.value.text.toString(),
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess("Please Check your Verification Code on Email");
          sessionController.sessionToken.value =
              response['token']?.toString() ?? '';

          Get.toNamed(
            emailOtpVerification,
            arguments: {
              'email': loginEmailController.value.text.toString() ?? "",
            },
          );
        } else {
          AppToast.showError(response["message"]);
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in Login With Email Password APi ${e.toString()}");
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  ///Verify OTP screen:
  Future<void> verifyEmailOTP(
    String email,
    String otp,
    BuildContext context,
  ) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.verifyEmailOTPApi(
          email: email,
          otp: otp,
        );
        log("Response  1== $response");
        if (response != null && response["success"] == true) {
          log("Response == $response");
          final customer = response['customer'] ?? {};
          sessionController.isUserLoginIn.value = true;
          await UserPreferences.setIsUserLogin(true);

          /// 🔐 Token:
          sessionController.sessionToken.value =
              response['token']?.toString() ?? '';
          await UserPreferences.setSessionToken(
            sessionController.sessionToken.value,
          );

          AppToast.showSuccess("Login Successfully");
          await getProfileController.getCustomerProfile(false);
          Get.until((route) => route.settings.name == homeScreen);
          // Get.toNamed(profileScreenMain);
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
}
