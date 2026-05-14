import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:app_tracking_transparency/app_tracking_transparency.dart';
import 'package:dress_fair_ecommmerce/model/config_model/config_model.dart';
import 'package:dress_fair_ecommmerce/model/language_model/language_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/session_repository/session_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

import '../../model/countriesModel/countries_model.dart';

class SessionController extends GetxController {
  RxString baseUrl = "https://9711694.ecomplug.com".obs;
  String baseUrlUAE = "https://9711694.ecomplug.com";
  String baseUrlOman = 'https://9681695.ecomplug.com';
  String baseUrlSaudiArabia = 'https://9661696.ecomplug.com';
  final ImagePicker _imagePicker = ImagePicker();

  Rx<File?> pickedProfileImage = Rx<File?>(null);

  Future<void> pickProfileImageFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );

      if (image != null) {
        pickedProfileImage.value = File(image.path);
        log("Profile image selected: ${image.path}");
      }
    } catch (e, s) {
      log("Image pick error: $e");
      log(s.toString());
    }
  }

  void setBaseUrl(String selectedCountry) {
    switch (selectedCountry) {
      case "United Arab Emirate":
        baseUrl.value = baseUrlUAE;
        log("Switch case For =${baseUrl.value}");
        break;
      case "Oman":
        baseUrl.value = baseUrlOman;
        log("Switch case For =${baseUrl.value}");
        break;
      case "Saudi Arabia":
        baseUrl.value = baseUrlSaudiArabia;
        log("Switch case For =${baseUrl.value}");
        break;
      default:
        baseUrl.value = baseUrlUAE;
    }
  }

  RxBool isLanguageLoading = false.obs;
  RxString sessionToken = "".obs;
  RxBool isLoading = false.obs;
  RxBool isUserFirstTime = true.obs;
  RxBool isUserLoginIn = false.obs;
  RxString name = "".obs;
  RxString userId = "".obs;
  RxString mobile = "".obs;
  RxString email = "".obs;
  RxString address = "".obs;
  RxList<LanguageModel> languages = <LanguageModel>[
    LanguageModel(name: 'English', code: 'en', isSelected: true),
    LanguageModel(name: 'العربية', code: 'ar', isSelected: false),
  ].obs;
  RxString selectedCountry = "United Arab Emirate".obs;
  RxString locationBaseCountry = "".obs;
  RxList<CountryModel> countries = <CountryModel>[
    CountryModel(name: 'United Arab Emirate', flag: '🇦🇪', id: '1'),
    CountryModel(name: 'Oman', flag: '🇴🇲', id: '2'),
    CountryModel(name: 'Saudi Arabia', flag: '🇸🇦', id: '3'),
    // CountryModel(name: 'Pakistan', flag: '🇵🇰', id: '4'),
  ].obs;
  final SessionRepository apiRepository = SessionRepository();
  Rxn<CountryConfigModel> countryConfig = Rxn<CountryConfigModel>();

  //     CountryConfigModel(
  //   countryMobileCode: '',
  //   countryMobileLength: '',
  //   currency: '',
  //   logo: '',
  //   flateShippingRate: '',
  //   freeShippingLimit: '',
  //   title: '',
  //   keyword: '',
  //   description: '',
  // ).obs;

  String get selectedLanguageCode {
    final selectedLang = languages.firstWhere((lang) => lang.isSelected);
    if (selectedLang.code == 'ar') {
      return 'ar';
    } else {
      return 'en-gb';
    }
  }

  void loadSavedLanguage() {
    String? savedCode = UserPreferences.getLanguageCode() ?? "en";
    for (var lang in languages) {
      lang.isSelected = lang.code == savedCode;
    }
    languages.refresh();
  }

  Locale get currentLocale {
    final selected = languages.firstWhere((lang) => lang.isSelected);
    return selected.code == 'ar'
        ? const Locale('ar', 'SA')
        : const Locale('en', 'US');
  }

  /// Update language selection (called from Language screen)
  Future<void> updateLanguage(LanguageModel selectedLang) async {
    for (var lang in languages) {
      lang.isSelected = false;
    }
    selectedLang.isSelected = true;
    languages.refresh();

    await UserPreferences.setLanguageCode(selectedLang.code);

    // 🔹 update GetX locale instantly
    Get.updateLocale(currentLocale);
  }

  Future<void> getSession() async {
    // if (await InternetController.checkUserConnection()) {
    //   var response;
    //   try {
    //     isLoading.value = true;
    //     response = await apiRepository.getSession();
    //     if (response != null && response["success"] == 1) {
    //       await UserPreferences.setSessionToken(response['data']['session']);
    //       sessionToken.value = response['data']['session'];
    //       log("Session Token -- =${sessionToken.value}");
    //       await UserPreferences.setIsUserFirstTime(false);
    //       isUserFirstTime.value = false;
    //     } else {
    //       log("Error Occurred In Get Session APi");
    //       log("Error Occurred In Get Session APi${response['error']}");
    //     }
    //     isLoading.value = false;
    //   } catch (e) {
    //     AppToast.showError(ErrorHandler.getErrorMessage(e));
    //     isLoading.value = false;
    //   }
    // } else {
    //   AppToast.showError("internetDisconnected".tr);
    // }
  }

  // ///get Country config:
  // Future<void> getConfig() async {
  //   if (await InternetController.checkUserConnection()) {
  //     var response;
  //     try {
  //       isLoading.value = true;
  //       response = await apiRepository.getConfig(
  //         sessionToken:sessionToken.value,
  //         language: selectedLanguageCode,
  //       );
  //       if (response != null && response["success"] == 1) {
  //         final model = CountryConfigModel.fromJson(response['data']);
  //         countryConfig.value = model;
  //         await UserPreferences.setCountryConfig(model);
  //       } else {
  //         AppToast.showError(response["error"]);
  //       }
  //       isLoading.value = false;
  //     } catch (e) {
  //       AppToast.showError(ErrorHandler.getErrorMessage(e));
  //       isLoading.value = false;
  //     }
  //   } else {
  //     AppToast.showError("internetDisconnected".tr);
  //   }
  // }

  ///get Country config:
  Future<void> getConfig() async {
    if (await InternetController.checkUserConnection()) {
      var response;
      try {
        isLoading.value = true;
        response = await apiRepository.getConfig(
          sessionToken: "",
          //sessionToken.value,

          //selectedLanguageCode,
        );
        if (response != null && response["success"] == true) {
          final model = CountryConfigModel.fromJson(response['data']);
          countryConfig.value = model;
          log("Config Model == $model");
          await UserPreferences.setCountryConfig(model);
        } else {
          log("error  in Config ==${response["error"]}");
          AppToast.showError(response["error"]);
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

  ///Get User Country Name Location:
  Future<void> fetchUserLocation() async {
    if (locationBaseCountry.isEmpty) {
      if (await InternetController.checkUserConnection()) {
        try {
          final res = await http.get(
            Uri.parse("https://ipwho.is/?fields=country_code"),
          );
          if (res.statusCode == 200) {
            final data = jsonDecode(res.body);
            final code = data["country_code"];
            if (code != null && code.toString().trim().isNotEmpty) {
              locationBaseCountry.value = code.toString().trim();
              await UserPreferences.setSelectedRegion(
                locationBaseCountry.value,
              );
              log("Selected Country == ${locationBaseCountry.value}");
            } else {
              log("IP-based lookup returned empty country_code");
            }
          } else {
            locationBaseCountry.value = "";
            log("IP API error: ${res.statusCode} - ${res.body}");
          }
        } catch (e, s) {
          log("IP lookup failed: $e");
          log(s.toString());
        }
      } else {
        AppToast.showError("internetDisconnected".tr);
      }
    }
  }

  ///Get Tenet Url:
  Future<void> getTenetUrl() async {
    if (await InternetController.checkUserConnection()) {
      var response;
      try {
        isLoading.value = true;
        response = await apiRepository.getBaseUrl(sessionToken: "");
        if (response != null && response["success"] == 1) {
          // ,,l
        } else {
          log("Error Occurred In Get Tenet Url APi");
          log("Error Occurred In Get Tenet Url APi${response['error']}");
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

  /// shipping Amount Methode:
  double getShippingCharge(double cartTotal) {
    final config = countryConfig.value;
    if (config == null) return 0.0;

    final double shippingAmount =
        double.tryParse(config.shippingAmount ?? '0') ?? 0.0;

    final double freeShippingLimit =
        double.tryParse(config.freeShippingLimit ?? '0') ?? 0.0;

    /// Free shipping condition
    if (cartTotal >= freeShippingLimit) {
      return 0.0;
    }

    return shippingAmount;
  }

  bool isFreeShipping(double cartTotal) {
    final config = countryConfig.value;
    if (config == null) return false;

    final double limit =
        double.tryParse(config.freeShippingLimit ?? '0') ?? 0.0;

    return cartTotal >= limit;
  }
}

class ATTHelper {
  static Future<void> requestTrackingPermission() async {
    try {
      // Show we're attempting ATT (visible in Apple review)
      if (kDebugMode) {
        print('=== ATT IMPLEMENTATION ACTIVE ===');
      }
      if (kDebugMode) {
        print('Platform: ${Platform.operatingSystem}');
      }
      if (Platform.isAndroid) {
        if (kDebugMode) {
          print('ATT: Skipping on Android - iOS will show dialog');
        }
        return;
      }
      // For simulator/Android, show mock message:
      if (!Platform.isIOS) {
        if (kDebugMode) {
          print('ATT: This would show dialog on real iOS device');
        }
        if (kDebugMode) {
          print('ATT: Apple Review will see the actual ATT popup');
        }
        return;
      }
      // Real iOS device flow:
      await Future.delayed(Duration(milliseconds: 1000));
      final status =
          await AppTrackingTransparency.requestTrackingAuthorization();
      if (kDebugMode) {
        print('ATT Status: $status');
      }
      if (kDebugMode) {
        print('ATT: Dialog shown successfully');
      }
    } on PlatformException catch (e) {
      if (kDebugMode) {
        print('ATT Error: $e');
      }
    }
  }
}
