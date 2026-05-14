import 'dart:developer';
import 'dart:io';

import 'package:dress_fair_ecommmerce/controller/customer_profile/customer_profile_controller.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/auth_repository/sign_in_repository/sign_in_repository.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

class LoginController extends GetxController {
  SessionController sessionController = Get.put(SessionController());
  GetProfileController getProfileController = Get.find<GetProfileController>();
  SignInRepository apiRepository = SignInRepository();
  RxBool isLoading = false.obs;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;
  bool _initialized = false;

  // Store ID token:
  RxString idToken = ''.obs;

  // Initialize GoogleSign In:
  Future<void> initialize() async {
    if (!_initialized) {
      await _googleSignIn.initialize(
        clientId: Platform.isIOS
            ? "647930267487-aqr730kosug0bcb4h97a1p5bsv6huot9.apps.googleusercontent.com"
            : null,
        serverClientId:
            // Platform.isIOS
            //     ? "647930267487-aqr730kosug0bcb4h97a1p5bsv6huot9.apps.googleusercontent.com"
            //     : "647930267487-h1n46imuvvf6krok0836estocmr6qbck.apps.googleusercontent.com",
            "647930267487-h1n46imuvvf6krok0836estocmr6qbck.apps.googleusercontent.com",
      );
      _initialized = true;
    }
  }

  // Sign in method:
  Future<void> handleSignIn() async {
    isLoading.value = true;
    await initialize();
    try {
      final account = await _googleSignIn.authenticate(scopeHint: ['email']);
      final auth = account.authentication;

      /// Update observable:
      idToken.value = auth.idToken ?? '';
      log("Token Of Google Login ==${idToken.value}");
      var response = await apiRepository.signInApi(token: idToken.value);
      if (response != null && response["success"] == true) {
        final customer = response['customer'] ?? {};
        sessionController.isUserLoginIn.value = true;
        await UserPreferences.setIsUserLogin(true);
        // 🔐 Token:
        sessionController.sessionToken.value =
            response['token']?.toString() ?? '';
        await UserPreferences.setSessionToken(
          sessionController.sessionToken.value,
        );

        sessionController.userId.value = customer['id']?.toString() ?? " 0";
        final firstName = customer['firstname']?.toString() ?? '';
        final lastName = customer['lastname']?.toString() ?? '';
        sessionController.name.value = '$firstName $lastName'.trim();
        sessionController.email.value = customer['email']?.toString() ?? '';
        sessionController.mobile.value = customer['mobile']?.toString() ?? '';
        AppToast.showSuccess("Login Successfully");
        await getProfileController.getCustomerProfile(false);
        Get.until((route) => route.settings.name == homeScreen);
      } else {
        AppToast.showError(response?["message"]?.toString() ?? "Login failed");
      }
      isLoading.value = false;
    } on GoogleSignInException catch (e) {
      if (kDebugMode) {
        print(
          'GoogleSignInException: code=${e.code.name}, description=${e.description}',
        );
      }
      isLoading.value = false;
    } catch (e) {
      print('Unexpected error during Google Sign-In: $e');
      isLoading.value = false;
    }
  }

  // Sign out:
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    idToken.value = '';
  }
}
