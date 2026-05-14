import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../model/customer_profile_model/customer_profile_model.dart';
import '../../repository/service/network/repository/custumer_profile_repository/custoer_profile_info_repository.dart';

class GetProfileController extends GetxController {
  final GetCustomerInfoApi apiRepository = GetCustomerInfoApi();
  // Loading states:
  RxBool isLoading = false.obs;
  Rxn<CustomerProfileModel> customerProfile = Rxn<CustomerProfileModel>();

  final sessionController = Get.find<SessionController>();
  RxBool hasDefault = false.obs;
  Rxn<Address> hasDefaultAddress = Rxn<Address>();
  Rx<TextEditingController> firstNameController = TextEditingController().obs;
  Rx<TextEditingController> lastNameController = TextEditingController().obs;
  Rx<TextEditingController> emailController = TextEditingController().obs;
  Rx<TextEditingController> mobileNoController = TextEditingController().obs;
  Rx<TextEditingController> addressController = TextEditingController().obs;

  void updateDefaultFlag() {
    final addresses = customerProfile.value?.addresses ?? [];
    // Check if any default exists
    hasDefault.value = addresses.any((a) => a.isDefault == 1);

    // Find the default address (nullable)
    Address? defaultAddr;
    for (var a in addresses) {
      if (a.isDefault == 1) {
        defaultAddr = a;
        break;
      }
    }

    // Save to Rxn:
    hasDefaultAddress.value = defaultAddr;
    hasDefault.refresh();
    hasDefaultAddress.refresh();
  }

  // ==================== GET PROFILE ====================   //

  Future<void> getCustomerProfile(bool isDefault) async {
    log("In Profile Information API");

    /// Internet check:
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    log("IsUser Login d  ===${sessionController.isUserLoginIn.value}");

    // Login check
    if (!sessionController.isUserLoginIn.value) return;

    try {
      if (!isDefault) {
        isLoading.value = true;
      }

      final response = await apiRepository.getCustomerInfo(
        sessionToken: sessionController.sessionToken.value,
      );

      if (response == null) {
        AppToast.showError("Something went wrong");
        return;
      }

      // ❌ API failed:
      if (response['success'] != true) {
        AppToast.showError(response['message'] ?? "Something went wrong");
        return;
      }
      // ✅ API success:
      final data = response['data'];
      if (data is Map<String, dynamic>) {
        customerProfile.value = CustomerProfileModel.fromJson(data);
        updateDefaultFlag();
        customerProfile.value?.addresses.sort((a, b) {
          if (a.isDefault == 1 && b.isDefault != 1) return -1;
          if (a.isDefault != 1 && b.isDefault == 1) return 1;
          return 0;
        });
      } else {
        AppToast.showError("Error : Invalid profile data");
      }
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      log("Error : Error in getCustomerProfile: $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  ///Update Customer profile:
  // Future<void> updateCustomerProfile() async {
  //   log("In Profile Information API");
  //
  //   /// Internet check:
  //   if (!await InternetController.checkUserConnection()) {
  //     AppToast.showError("internetDisconnected".tr);
  //     return;
  //   }
  //   log("IsUser Login d  ===${sessionController.isUserLoginIn.value}");
  //
  //   /// Login check:
  //   if (!sessionController.isUserLoginIn.value) return;
  //
  //   try {
  //     isLoading.value = true;
  //
  //     Map<String, dynamic> data = {
  //       "first_name": firstNameController.value.text.toString(),
  //       "last_name": lastNameController.value.text.toString(),
  //       "email": emailController.value.text.toString(),
  //       "mobile": mobileNoController.value.text.toString(),
  //     };
  //     final response = await apiRepository.updateCustomerInfo(
  //       sessionToken: sessionController.sessionToken.value,
  //       data: data,
  //     );
  //
  //     if (response['success'] != true) {
  //       AppToast.showError(response['message'] ?? "somethingWentWrong".tr);
  //       return;
  //     }
  //     await getCustomerProfile(false);
  //     AppToast.showSuccess("profileUpdatedSuccessfully".tr);
  //     Get.until((route) => route.settings.name == homeScreen);
  //     isLoading.value = false;
  //   } catch (e) {
  //     isLoading.value = false;
  //     log("Error : Error in getCustomerProfile: $e");
  //     AppToast.showError(ErrorHandler.getErrorMessage(e));
  //   } finally {
  //     isLoading.value = false;
  //   }
  // }

  Future<void> updateCustomerProfile() async {
    log("In Profile Information API");

    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }

    if (!sessionController.isUserLoginIn.value) return;

    try {
      isLoading.value = true;

      Map<String, String> fields = {
        "first_name": firstNameController.value.text.trim(),
        "last_name": lastNameController.value.text.trim(),
        "email": emailController.value.text.trim(),
        "mobile": mobileNoController.value.text.trim(),
      };

      final response = await apiRepository.updateCustomerInfo(
        sessionToken: sessionController.sessionToken.value,
        fields: fields,
        imageFile: sessionController.pickedProfileImage.value,
      );

      if (response['success'] != true) {
        AppToast.showError(response['message'] ?? "somethingWentWrong".tr);
        return;
      }

      await getCustomerProfile(false);
      AppToast.showSuccess("profileUpdatedSuccessfully".tr);
      Get.until((route) => route.settings.name == homeScreen);
    } catch (e) {
      log("Error : $e");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }
}
