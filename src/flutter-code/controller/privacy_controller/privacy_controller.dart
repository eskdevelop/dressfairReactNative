import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/privacy_Models/term_and_condition_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/privacy_repository/privacy_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class PrivacyController extends GetxController {
  // Loading states:
  RxBool isLoading = false.obs;

  // Repositories & Controllers:
  final PrivacyRepository apiRepository = PrivacyRepository();
  SessionController sessionController = Get.find<SessionController>();
  Rxn<TermsAndConditionModel> termAndCondition = Rxn<TermsAndConditionModel>();
  Rxn<TermsAndConditionModel> privacyPolicy = Rxn<TermsAndConditionModel>();
  Rxn<TermsAndConditionModel> refundAndPolicy = Rxn<TermsAndConditionModel>();
  Rxn<TermsAndConditionModel> aboutUs = Rxn<TermsAndConditionModel>();

  // ==================== GET Term And Condition ==================== //

  Future<void> getTermAndCondition() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.getTermAndCondition(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response != null && response["success"] == 1) {
        log("Data Ae Coming $response['title']");
        termAndCondition.value = TermsAndConditionModel.fromJson(
          response['data'],
        );
      } else {
        log("Error in get term And Condition:");
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  // ==================== GET Privacy And Policy ====================
  Future<void> getPrivacyAndPolicy() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.getPrivacyPolicy(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response != null && response["success"] == 1) {
        privacyPolicy.value = TermsAndConditionModel.fromJson(response['data']);
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  // ==================== GET Return And Refund Policy ====================
  Future<void> getRefundPolicy() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.getRefundPolicy(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response != null && response["success"] == 1) {
        refundAndPolicy.value = TermsAndConditionModel.fromJson(
          response['data'],
        );
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  // ==================== GET About US ====================
  Future<void> getAboutUs() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.getAboutUs(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response != null && response["success"] == 1) {
        aboutUs.value = TermsAndConditionModel.fromJson(response['data']);
      }
    } catch (e) {
      log("Error in get term And Condition: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }
}
