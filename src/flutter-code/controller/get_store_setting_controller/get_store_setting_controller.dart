import 'dart:developer';

import 'package:dress_fair_ecommmerce/repository/service/network/repository/get_store_backend_repository/get_store_backend_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetStoreSettingController extends GetxController {
  GetStoreBackendRepository apiRepository = GetStoreBackendRepository();
  RxBool isLoading = false.obs;

  /// Get Store Setting:
  Future<void> getStoreSetting() async {
    if (await InternetController.checkUserConnection()) {
      var response;
      try {
        isLoading.value = true;
        response = await apiRepository.getStoreSetting();
        if (response != null && response["success"] == true) {
          ///

          ///
        } else {
          log("Error Occurred In Get Setting APi${response['error']}");
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
}
