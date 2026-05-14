import 'dart:developer';

import 'package:dress_fair_ecommmerce/model/get_address_model/get_address_model.dart';
import 'package:dress_fair_ecommmerce/model/get_area_city/get_area_city.dart';
import 'package:dress_fair_ecommmerce/model/get_zone_model/get_zone_model.dart';

import '../../repository/service/network/repository/address_repository/address_repository.dart';
import '../../view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import '../customer_profile/customer_profile_controller.dart';
import '../home_controller/home_controller.dart';

class AddressController extends GetxController {
  RxBool isLoading = false.obs;
  RxBool isLoadingArea = false.obs;
  RxBool isLoadingButton = false.obs;
  RxBool isLoadingDefault = false.obs;
  final AddressRepository apiRepository = AddressRepository();
  SessionController sessionController = Get.find<SessionController>();
  GetProfileController getProfileController = Get.find<GetProfileController>();
  BottomNavController bottomNavController = Get.put(BottomNavController());
  RxList<CityModel> cities = <CityModel>[].obs;
  RxList<AreaModel> area = <AreaModel>[].obs;
  Rxn<CityModel> selectedCity = Rxn<CityModel>();
  Rxn<AreaModel> selectedArea = Rxn<AreaModel>();
  RxBool setAsDefault = false.obs;
  Rx<TextEditingController> nameController = TextEditingController().obs;
  Rx<TextEditingController> phoneController = TextEditingController().obs;

  Rx<TextEditingController> addressControllerField =
      TextEditingController().obs;
  RxList<AddressModel> allAddress = <AddressModel>[].obs;
  Rxn<AddressModel> defaultAddress = Rxn<AddressModel>();

  ///Edit Text Data:
  // Rx<TextEditingController> editNameController = TextEditingController().obs;
  // Rx<TextEditingController> editPhoneController = TextEditingController().obs;
  // Rx<TextEditingController> editAddressController = TextEditingController().obs;

  /// Get Province:
  Future<void> getCities() async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.getCities(
          sessionToken: "",

          //sessionController.sessionToken.value,
          countryId: sessionController.countryConfig.value?.countryId ?? "",
          //   sessionController.selectedLanguageCode,
        );
        if (response != null && response["success"] == true) {
          final List<dynamic> data = response["data"];
          cities.value = data.map((e) => CityModel.fromJson(e)).toList();
          // 👇 Reset selections when new data comes
          selectedCity.value = null;
          selectedArea.value = null;
        } else {
          AppToast.showError(
            (response?["error"] as List?)?.isNotEmpty == true
                ? response["error"][0]
                : "Something went wrong",
          );
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in Get Categories = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Get City Area:
  Future<void> getAreas({required String id}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingArea.value = true;
        var response = await apiRepository.getArea(
          sessionToken: sessionController.sessionToken.value,
          id: id,
        );
        if (response != null && response["success"] == true) {
          final List<dynamic> data = response["data"];
          area.value = data.map((e) => AreaModel.fromJson(e)).toList();
          selectedArea.value = null;
        } else {
          log("Error in Get Areas 1 ==${response?["error"]}");
          // AppToast.showError(
          //   (response?["error"] as List?)?.isNotEmpty == true
          //       ? response["error"][0]
          //       : "Something went wrong",
          // );
        }
        isLoadingArea.value = false;
      } catch (e) {
        log("Error in Get Areas = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingArea.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  // /// Get User Address:
  // Future<void> getAddress(BuildContext context) async {
  //   if (await InternetController.checkUserConnection()) {
  //     try {
  //       isLoading.value = true;
  //       var response = await apiRepository.getAddress(
  //         sessionToken: sessionController.sessionToken.value,
  //       );
  //       if (response != null && response["success"] == 1) {
  //         if (response['data'] != null && response['data'] is List) {
  //           // Parse JSON list
  //           List<AddressModel> addressList = (response['data'] as List)
  //               .map((e) => AddressModel.fromJson(e))
  //               .toList();
  //           // Sort so default address (isDefault == "1") comes first:
  //           addressList.sort((a, b) {
  //             if (a.isDefault == "1" && b.isDefault != "1") return -1;
  //             if (a.isDefault != "1" && b.isDefault == "1") return 1;
  //             return 0;
  //           });
  //
  //           // Assign to reactive variables:
  //           allAddress.value = addressList;
  //           defaultAddress.value = addressList.firstWhere(
  //             (address) => address.isDefault == "1",
  //             orElse: () => AddressModel(
  //               addressId: "",
  //               firstname: "",
  //               lastname: "",
  //               company: "",
  //               address1: "",
  //               address2: "",
  //               city: "",
  //               postcode: "",
  //               zoneId: "",
  //               zone: "",
  //               zoneCode: "",
  //               countryId: "",
  //               country: "",
  //               isoCode2: "",
  //               isoCode3: "",
  //               addressFormat: "",
  //               customField: null,
  //               isDefault: "0",
  //             ),
  //           );
  //         } else {
  //           allAddress.clear();
  //         }
  //       } else {
  //         if (response != null &&
  //             response["error"] is List &&
  //             response["error"].isNotEmpty &&
  //             response["error"][0] == 'User is not logged') {
  //           UserPreferences.setIsUserLogin(false);
  //           sessionController.isUserLoginIn.value = false;
  //
  //           showDialog(
  //             context: context,
  //             barrierDismissible: false, // Prevent closing by clicking outside
  //             builder: (context) => const SessionExpiredDialog(),
  //           );
  //
  //           // Get.toNamed(loginInScreen);
  //           return;
  //         }
  //
  //         log(
  //           (response?["error"] as List?)?.isNotEmpty == true
  //               ? response["error"][0]
  //               : "Something went wrong",
  //         );
  //
  //         // AppToast.showError(
  //         //   (response?["error"] as List?)?.isNotEmpty == true
  //         //       ? response["error"][0]
  //         //       : "Something went wrong",
  //         // );
  //       }
  //     } catch (e) {
  //       log("Error in Get Address = ${e.toString()}");
  //       AppToast.showError(ErrorHandler.getErrorMessage(e));
  //     } finally {
  //       isLoading.value = false;
  //     }
  //   } else {
  //     AppToast.showError("internetDisconnected".tr);
  //   }
  // }

  /// Save Address:
  Future<void> saveAddress(BuildContext context) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingButton.value = true;
        var response = await apiRepository.saveAddress(
          sessionToken: sessionController.sessionToken.value,
          data: {
            "mobile": "94539845934",
            "firstname": nameController.value.text.trim().toString(),
            "lastname": "",
            "address": addressControllerField.value.text.toString(),
            "state_province_id": selectedCity.value?.id ?? "",
            "city_area_id": selectedArea.value?.id ?? "",
          },
        );
        if (response != null && response["success"] == true) {
          getProfileController.updateDefaultFlag();
          AppToast.showSuccess(response['message']);
          nameController.value.clear();
          addressControllerField.value.clear();
          phoneController.value.clear();
          await getProfileController.getCustomerProfile(false);
          Get.back();
          bottomNavController.changeTab(2);
        } else {
          log("Error == ${response?["error"]}");
        }
        isLoadingButton.value = false;
      } catch (e) {
        log("Error in Get Areas = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingButton.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Update Address:
  Future<void> updateAddress(BuildContext context, String addressId) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingButton.value = true;
        var response = await apiRepository.updateAddress(
          sessionToken: sessionController.sessionToken.value,
          data: {
            "customer_address_id": addressId,
            "address": addressControllerField.value.text.toString(),
            "state_province_id": selectedCity.value?.id ?? "",
            "city_area_id": selectedArea.value?.id ?? "",
          },
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess(response['message']);
          nameController.value.clear();
          addressControllerField.value.clear();
          phoneController.value.clear();
          await getProfileController.getCustomerProfile(false);
          Get.back();
        } else {
          log("Error == ${response?["error"]}");
          // AppToast.showError(
          //   (response?["error"] as List?)?.isNotEmpty == true
          //       ? response["error"][0]
          //       : "Something went wrong",
          // );
        }
        isLoadingButton.value = false;
      } catch (e) {
        log("Error in Get Areas = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingButton.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Make Default Address:
  Future<void> makeDefaultAddress({
    required String id,
    required BuildContext context,
  }) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingDefault.value = true;
        var response = await apiRepository.makeDefaultAddress(
          sessionToken: sessionController.sessionToken.value,
          id: id,
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess(response['message']);
          await getProfileController.getCustomerProfile(true);
          getProfileController.refresh();
          //    allAddress.refresh();
          // bottomNavController.changeTab(3);
        } else {
          log("Error in set Default Address");
          // AppToast.showError(
          //   (response?["error"] as List?)?.isNotEmpty == true
          //       ? response["error"][0]
          //       : "Something went wrong",
          // );
        }
        isLoadingDefault.value = false;
      } catch (e) {
        log("Error in Default Set Address = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingDefault.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Delete Address:
  Future<void> deleteAddress({
    required String id,
    required BuildContext context,
  }) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingDefault.value = true;
        var response = await apiRepository.deleteAddress(
          sessionToken: sessionController.sessionToken.value,
          id: id,
        );
        if (response != null && response["success"] == true) {
          // await getAddress(context);
          //  allAddress.refresh();
          await getProfileController.getCustomerProfile(true);
          getProfileController.refresh();
          AppToast.showSuccess(response['message']);
          //  bottomNavController.changeTab(3);
        } else {
          log("Error in Get Address ** ");
        }
        isLoadingDefault.value = false;
      } catch (e) {
        log("Error in Get Areas = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingDefault.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  // void updateDefaultFlag() {
  //   hasDefault.value = allAddress.any((a) => a.isDefault == "1");
  // }
}
