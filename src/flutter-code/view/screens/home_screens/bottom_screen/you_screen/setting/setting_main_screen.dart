import 'package:dress_fair_ecommmerce/controller/auth_controller/logout_controller/logout_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/payment_method/payment_merthod.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/main_legal_policy_screen.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../controller/refresh_all_api_controller/refresh_all_api_controller.dart';
import '../../../../../../controller/simple_method/simple_methode.dart';
import 'about_us/about_us_main_screen.dart';
import 'language_selection/language_selection.dart';

class SettingsScreen extends StatelessWidget {
  SettingsScreen({super.key});

  final controller = Get.put(LogoutController());
  final sessionController = Get.put(SessionController());
  final refreshAllApiController = Get.put(RefreshAllApiController());

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      builder: (context, child) {
        return Obx(
          () => Scaffold(
            appBar: AppBar(
              centerTitle: true,
              elevation: 0,
              backgroundColor: Colors.white,
              iconTheme: const IconThemeData(color: Colors.black),
              title: AppTextWidget(
                text: 'settings'.tr,
                fontWeight: FontWeight.bold,
                color: Colors.black,
                fontSize: 15.sp,
              ),
              leadingWidth: 40.w,
              leading: Padding(
                padding: EdgeInsets.only(right: 8.0.w),
                child: GestureDetector(
                  onTap: () {
                    Get.back();
                  },
                  child: Padding(
                    padding: EdgeInsets.only(left: 10.0.w),
                    child: SvgPicture.asset(
                      AppImages.backArrow,
                      color: Colors.black,
                    ),
                  ),
                ),
              ),
            ),
            backgroundColor: Colors.white,
            body: Stack(
              children: [
                // Main Content
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Top protection info:
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14.w),
                      child: AppTextWidget(
                        text: 'yourAccountIsProtected'.tr,
                        fontSize: 15.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                    SizedBox(height: 3.h),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 14.w),
                      child: AppTextWidget(
                        text: 'dressFairProtectsYourPersonal'.tr,
                        fontSize: 12.sp,
                        color: Colors.black54,
                      ),
                    ),
                    SizedBox(height: 6.h),

                    Padding(
                      padding: EdgeInsets.only(
                        left: 12.0.w,
                        right: 12.w,
                        top: 4.h,
                        bottom: 4.h,
                      ),
                      child: SizedBox(
                        width: MediaQuery.sizeOf(context).width,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            /// First :
                            GestureDetector(
                              onTap: () {
                                Get.toNamed(accountSetting);
                              },
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 0.48,
                                padding: EdgeInsets.only(
                                  top: 6.w,
                                  bottom: 6.h,
                                  left: 4.h,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(2.r),
                                  border: Border.all(
                                    color: Colors.grey,
                                    width: 0.4.w,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        SizedBox(width: 4.w),
                                        SvgPicture.asset(
                                          height: 16.h,
                                          AppImages.accountSecurity,
                                          color: Colors.green,
                                        ),
                                        SizedBox(width: 6.w),
                                        AppTextWidget(
                                          text: "accountSecurity".tr,
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.green,
                                        ),
                                      ],
                                    ),

                                    Padding(
                                      padding: EdgeInsets.only(right: 4.0.w),
                                      child: Icon(
                                        size: 16.sp,
                                        Icons.keyboard_arrow_right,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            /// Second :
                            GestureDetector(
                              onTap: () {
                                Get.toNamed(privacyPolicy);
                              },
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 0.42,
                                padding: EdgeInsets.only(
                                  top: 6.w,
                                  bottom: 6.h,
                                  left: 4.h,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(2.r),
                                  border: Border.all(
                                    color: Colors.grey,
                                    width: 0.4.w,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        SizedBox(width: 4.w),
                                        SvgPicture.asset(
                                          height: 16.h,
                                          AppImages.lockPrivacy,
                                          color: Colors.green,
                                        ),
                                        SizedBox(width: 6.w),
                                        AppTextWidget(
                                          text: "privacy".tr,
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.green,
                                        ),
                                      ],
                                    ),
                                    Padding(
                                      padding: EdgeInsets.only(right: 4.0.w),
                                      child: Icon(
                                        size: 16.sp,
                                        Icons.keyboard_arrow_right,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Padding(
                      padding: EdgeInsets.only(
                        left: 12.0.w,
                        right: 12.w,
                        top: 4.h,
                        bottom: 4.h,
                      ),
                      child: SizedBox(
                        width: MediaQuery.sizeOf(context).width,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            /// First :
                            GestureDetector(
                              onTap: () {
                                Get.toNamed(safetyCenter);
                              },
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 0.48,
                                padding: EdgeInsets.only(
                                  top: 6.w,
                                  bottom: 6.h,
                                  left: 4.h,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(2.r),
                                  border: Border.all(
                                    color: Colors.grey,
                                    width: 0.4.w,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        SizedBox(width: 4.w),
                                        SvgPicture.asset(
                                          height: 16.h,
                                          AppImages.safetyCenter,
                                          color: Colors.green,
                                        ),
                                        SizedBox(width: 6.w),
                                        AppTextWidget(
                                          text: "safetyCenter".tr,
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.green,
                                        ),
                                      ],
                                    ),
                                    Padding(
                                      padding: EdgeInsets.only(right: 4.0.w),
                                      child: Icon(
                                        size: 16.sp,
                                        Icons.keyboard_arrow_right,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            /// Second
                            GestureDetector(
                              onTap: () {
                                Get.toNamed(permissionScreen);
                              },
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 0.42,
                                padding: EdgeInsets.only(
                                  top: 6.w,
                                  bottom: 6.h,
                                  left: 4.h,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(2.r),
                                  border: Border.all(
                                    color: Colors.grey,
                                    width: 0.4.w,
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        SizedBox(width: 4.w),
                                        SvgPicture.asset(
                                          height: 16.h,
                                          AppImages.permission,
                                          color: Colors.green,
                                        ),
                                        SizedBox(width: 6.w),
                                        AppTextWidget(
                                          text: "permission".tr,
                                          fontSize: 12.sp,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.green,
                                        ),
                                      ],
                                    ),

                                    Padding(
                                      padding: EdgeInsets.only(right: 4.0.w),
                                      child: Icon(
                                        size: 16.sp,
                                        Icons.keyboard_arrow_right,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 12.h),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 0.0.w),
                      child: Container(
                        height: 2.h,
                        width: MediaQuery.sizeOf(context).width,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(5.r),
                          color: Colors.black.withOpacity(0.1),
                        ),
                      ),
                    ),

                    // Settings List
                    Expanded(
                      child: ListView(
                        children: [
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 12.w),
                            child: countryDropdown(sessionController),
                          ),
                          SizedBox(height: 2.h),
                          Divider(height: 1.h, color: Colors.grey[300]),
                          _listTile(
                            title: "yourPaymentMethods".tr,
                            onTap: () {
                              Get.to(PaymentInformationScreen());
                            },
                          ),
                          _listTile(
                            title: 'language'.tr,
                            trailing:
                                sessionController.languages
                                    .firstWhereOrNull((lang) => lang.isSelected)
                                    ?.name ??
                                'english'.tr,
                            onTap: () {
                              Get.to(LanguageSelectionScreen());
                            },
                          ),
                          _listTile(
                            title: 'currency'.tr,
                            trailing:
                                sessionController
                                    .countryConfig
                                    .value
                                    ?.currencyCode ??
                                "",
                            onTap: () {},
                          ),
                          _listTile(
                            title: "aboutThisApp".tr,
                            onTap: () {
                              Get.to(AboutUsMainScreen());
                            },
                          ),
                          _listTile(
                            title: "legalTermsAndPolicies".tr,
                            onTap: () {
                              Get.to(LegalTermsScreen());
                            },
                          ),
                          _listTile(
                            title: 'shareThisApp'.tr,
                            onTap: () {
                              SimpleMethode().shareApp();
                            },
                          ),
                          _listTile(
                            title: 'deleteAccount'.tr,
                            onTap: () async {
                              await UserPreferences.clearAll();
                              AppToast.showSuccess(
                                "Delete Account Successfully",
                              );
                              //  await controller.deleteAccount();
                            },
                          ),
                          _listTile(
                            title: 'signOut'.tr,
                            onTap: () async {
                              await UserPreferences.clearAll();
                              AppToast.showSuccess("SignOut Successfully");
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                // Overlay Loader
                if (controller.isLoading.value ||
                    refreshAllApiController.isLoading.value)
                  AppOverlayLoader(message: "updatingStorePleaseWait".tr),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _listTile({
    required String title,
    String? trailing,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 14.w),
      child: Column(
        children: [
          ListTile(
            title: AppTextWidget(
              text: title,
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            trailing: trailing != null
                ? Text(
                    trailing,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: Colors.black.withOpacity(0.6),
                      fontWeight: FontWeight.w400,
                    ),
                  )
                : Icon(Icons.arrow_forward_ios, size: 16.sp),
            onTap: onTap,
            contentPadding: EdgeInsets.symmetric(horizontal: 0.w),
          ),
          Divider(height: 1.h, color: Colors.grey[300]),
        ],
      ),
    );
  }

  Widget countryDropdown(SessionController sessionController) {
    return Obx(
      () => DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: sessionController.selectedCountry.value.isEmpty
              ? null
              : sessionController.selectedCountry.value,
          isExpanded: true,
          icon: Icon(
            Icons.arrow_forward_ios,
            size: 14.sp,
            color: Colors.grey[600],
          ),
          hint: Text(
            "selectCountry".tr,
            style: TextStyle(
              fontSize: 13.sp,
              color: Colors.black.withOpacity(0.6),
            ),
          ),
          style: TextStyle(
            fontSize: 13.sp,
            color: Colors.black,
            fontWeight: FontWeight.w500,
          ),
          dropdownColor: Colors.white,
          items: sessionController.countries.map((country) {
            return DropdownMenuItem<String>(
              value: country.name,
              child: Row(
                children: [
                  Text(country.flag, style: TextStyle(fontSize: 17.sp)),
                  SizedBox(width: 6.w),
                  Text(country.name),
                ],
              ),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) {
              refreshAllApiController.refreshAllData(value);
            }
          },
        ),
      ),
    );
  }
}

// Overlay Loader Widget:
class AppOverlayLoader extends StatelessWidget {
  final String message;

  const AppOverlayLoader({
    super.key,
    this.message = "Updating store please wait ...",
  });

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: Container(
        color: Colors.black.withOpacity(0.25),
        child: Center(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 14.w),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 20.h),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6.r),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 20.r,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SpinKitFadingCircle(
                    color: AppColors.primaryColor,
                    size: 42.sp,
                  ),
                  SizedBox(height: 14.h),
                  Text(
                    message,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
