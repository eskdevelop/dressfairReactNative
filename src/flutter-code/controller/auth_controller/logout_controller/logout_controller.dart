import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/auth_repository/logout_repository/logout_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class LogoutController extends GetxController {
  // Loading states:
  RxBool isLoading = false.obs;

  // Repositories & Controllers:
  final LogoutRepository apiRepository = LogoutRepository();
  SessionController sessionController = Get.find<SessionController>();

  ///Logout
  Future<void> logout() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.logout(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response["success"] == 1) {
        AppToast.showSuccess("Logout SuccessFully");
        sessionController.isUserLoginIn.value = false;
        trackLogout();
        UserPreferences.setIsUserLogin(false);
        Get.offAllNamed(homeScreen);
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  ///Delete Account
  Future<void> deleteAccount() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.delete(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response["success"] == 1) {
        AppToast.showSuccess("Logout SuccessFully");
        sessionController.isUserLoginIn.value = false;
        UserPreferences.setIsUserLogin(false);
        Get.offAllNamed(homeScreen);
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  // Logout :
  /// For Fb,tiktok Tracking:
  void trackLogout() {
    TikTokService.logout();
  }
}
