import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../repository/service/network/repository/auth_repository/sign_in_repository/registration_repository.dart';
import '../../view/screens/auth/login_with_email.dart';

class RegisterController extends GetxController {
  Rx<TextEditingController> firstNameController = TextEditingController().obs;
  Rx<TextEditingController> lastNameController = TextEditingController().obs;
  Rx<TextEditingController> emailController = TextEditingController().obs;

  Rx<TextEditingController> mobileController = TextEditingController().obs;
  Rx<TextEditingController> passwordController = TextEditingController().obs;
  RxBool isLoading = false.obs;
  SessionController sessionController = Get.find<SessionController>();

  RegistrationRepository apiRepository = RegistrationRepository();

  ///Login with WhatsApp:
  Future<void> registrationApi() async {
    if (await InternetController.checkUserConnection()) {
      try {
        String fullPhone =
            '${sessionController.countryConfig.value?.mobileCode ?? ""}${mobileController.value.text.toString()}';
        isLoading.value = true;
        var response = await apiRepository.registrationApi(
          firstName: firstNameController.value.text.toString(),
          lastName: lastNameController.value.text.toString(),
          email: emailController.value.text.toString(),
          mobile: fullPhone,
          password: passwordController.value.text.toString(),
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess("User Register Successfully");
          firstNameController.value.clear();
          lastNameController.value.clear();
          emailController.value.clear();
          mobileController.value.clear();
          passwordController.value.clear();
          Get.off(LoginWithEmail());
        } else {
          AppToast.showError(response["message"]);
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in Register APi");
        //   AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }
}
