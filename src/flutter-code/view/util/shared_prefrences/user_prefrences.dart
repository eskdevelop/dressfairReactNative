import 'dart:convert';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/config_model/config_model.dart';
import 'package:dress_fair_ecommmerce/model/user_profile_model/user_profile_model.dart';
import 'package:dress_fair_ecommmerce/view/util/shared_prefrences/pref_keys.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserPreferences {
  static SharedPreferences? _preferences;

  static Future init() async {
    _preferences = await SharedPreferences.getInstance();
    SessionController sessionController = Get.put(SessionController());
    sessionController.sessionToken.value = getSessionToken() ?? "";
    sessionController.locationBaseCountry.value = getSelectedRegion() ?? "";

    sessionController.selectedCountry.value =
        getSelectedCountry() ?? "United Arab Emirate";
    sessionController.setBaseUrl(sessionController.selectedCountry.value);
    sessionController.isUserFirstTime.value = getIsUserFirstTime() ?? true;
    sessionController.isUserLoginIn.value = getIsUserLogin() ?? false;
    log("Session ID ==  ${sessionController.sessionToken.value}");
    log("IsUser Login == ${sessionController.isUserLoginIn.value}");

    /// Load saved Country Config (if available):
    final savedConfig = getCountryConfig();
    sessionController.loadSavedLanguage();
    if (savedConfig != null) {
      sessionController.countryConfig.value = savedConfig;
      log("Country Config ==${sessionController.countryConfig.value} ");
      log("Loaded Country Config from SharedPreferences ");
    } else {
      log(" No saved Country Config found, will fetch from API later");
    }
  }

  static Future setToken(String value) async =>
      await _preferences!.setString(PrefKeys.userToken, value);
  static Future setSessionToken(String value) async =>
      await _preferences!.setString(PrefKeys.session, value);
  static Future setSelectedRegion(String value) async =>
      await _preferences!.setString(PrefKeys.selectCountryRegion, value);
  static Future setIsUserLogin(bool value) async =>
      await _preferences!.setBool(PrefKeys.isUserLogin, value);
  static Future setIsUserFirstTime(bool value) async =>
      await _preferences!.setBool(PrefKeys.isUserFirstTime, value);

  /// Getters::
  static String? getToken() => _preferences!.getString(PrefKeys.userToken);

  ///Session::
  static String? getSessionToken() => _preferences!.getString(PrefKeys.session);

  /// Selected Region:
  static String? getSelectedRegion() =>
      _preferences!.getString(PrefKeys.selectCountryRegion);

  ///    =====   ///
  ///Set Selected Country:
  static Future setSelectedCountry(String country) async =>
      await _preferences!.setString(PrefKeys.selectedCountry, country);

  /// Get Selected Country:
  static String? getSelectedCountry() =>
      _preferences!.getString(PrefKeys.selectedCountry);

  static bool? getIsUserLogin() =>
      _preferences?.getBool(PrefKeys.isUserLogin) ?? false;
  static bool? getIsUserFirstTime() =>
      _preferences?.getBool(PrefKeys.isUserFirstTime) ?? true;

  ///
  /// Save Country Config

  static Future setCountryConfig(CountryConfigModel model) async {
    final jsonString = jsonEncode(model.toJson());
    await _preferences!.setString(PrefKeys.countryConfig, jsonString);
  }

  /// Get Country Config (returns null if not saved)
  static CountryConfigModel? getCountryConfig() {
    final jsonString = _preferences!.getString(PrefKeys.countryConfig);
    if (jsonString != null) {
      final Map<String, dynamic> jsonMap = jsonDecode(jsonString);
      return CountryConfigModel.fromJson(jsonMap);
    }
    return null;
  }

  /// Remove Country Config (optional)
  static Future<void> removeCountryConfig() async {
    await _preferences!.remove(PrefKeys.countryConfig);
  }

  // Clear :
  static Future<void> removeToken() => _preferences!.remove(PrefKeys.userToken);

  static Future<void> removeIsUserLogin() =>
      _preferences!.remove(PrefKeys.isUserLogin);

  static Future setLanguageCode(String code) async =>
      await _preferences!.setString(PrefKeys.selectedLanguageCode, code);

  static String? getLanguageCode() =>
      _preferences!.getString(PrefKeys.selectedLanguageCode);

  static Future setUserProfile(Profile profile) async {
    final jsonString = jsonEncode(profile.toJson());
    await _preferences!.setString(PrefKeys.userProfile, jsonString);
  }

  static String? getUserProfile() =>
      _preferences!.getString(PrefKeys.userProfile);

  static Future<void> removeUserProfile() =>
      _preferences!.remove(PrefKeys.userProfile);

  static Future<void> clearAll() async {
    //  AppToast.showInfo("Session Expired");
    final loginController = Get.find<SessionController>();
    await UserPreferences.removeToken();
    await UserPreferences.removeIsUserLogin();
    await UserPreferences.setIsUserFirstTime(true);
    loginController.sessionToken.value = "";
    loginController.isUserLoginIn.value = false;
    loginController.isUserFirstTime.value = true;

    // loginController.isUserFirstTime.value = true;
    // if (Get.isRegistered<AddToCartController>()) {
    //   log("Add To Cart Controller");
    //   Get.delete<AddToCartController>();
    // }
    // if (Get.isRegistered<AddressController>()) {
    //   log("Address Controller Removed");
    //   Get.delete<AddressController>();
    // }
    // if (Get.isRegistered<LoginWithWhatsappController>()) {
    //   log("OFD Fail Controller Removed");
    //   Get.delete<LoginWithWhatsappController>();
    // }
    // if (Get.isRegistered<CategoryController>()) {
    //   log("ReturnedShipmentController Controller Removed");
    //   Get.delete<CategoryController>();
    // }
    // if (Get.isRegistered<DeleteAddToCartController>()) {
    //   log("Delete Controller Removed");
    //   Get.delete<DeleteAddToCartController>();
    // }
    // if (Get.isRegistered<GetAddToCartController>()) {
    //   Get.delete<GetAddToCartController>();
    //   log("Get Add To Cart Controller Removed");
    // }
    // if (Get.isRegistered<ProductController>()) {
    //   log("PendingTaskController Controller Removed");
    //   Get.delete<ProductController>();
    // }

    Get.offNamed(loginInScreen, arguments: {"isFromHome": true});
  }
}
