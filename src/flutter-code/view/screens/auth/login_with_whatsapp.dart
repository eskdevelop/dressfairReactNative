import 'package:dress_fair_ecommmerce/controller/auth_controller/login_with_whatsapp_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/privacy_buttons.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../util/widgets/dialog/confirm_dialog.dart';

class LoginWithWhatsapp extends StatefulWidget {
  bool isFromHome;
  LoginWithWhatsapp({super.key, required this.isFromHome});

  @override
  State<LoginWithWhatsapp> createState() => _LoginWithWhatsappState();
}

class _LoginWithWhatsappState extends State<LoginWithWhatsapp> {
  SessionController sessionController = Get.put(SessionController());
  LoginWithWhatsappController loginWithWhatsappController = Get.put(
    LoginWithWhatsappController(),
  );
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      loginWithWhatsappController.whatsappController.value.clear();
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        actions: [
          GestureDetector(
            onTap: () {
              showDressFairLeaveDialog(
                context,
                onContinue: () {
                  Get.back();
                },
                onLeave: () {
                  if (widget.isFromHome) {
                    Get.back();
                    Get.back();
                  } else {
                    Get.offNamed(homeScreen);
                  }
                },
              );
            },
            child: SizedBox(
              width: 70.w,
              child: Padding(
                padding: EdgeInsets.only(right: 10.0.w),
                child: SvgPicture.asset(
                  color: Colors.black.withOpacity(0.8),
                  height: 17.h,
                  AppImages.crossIcon,
                ),
              ),
            ),
          ),
        ],
        // leading: GestureDetector(
        //   onTap: () {
        //     Get.back();
        //   },
        //   child: Icon(
        //     Icons.arrow_back_ios_new,
        //     color: Colors.black.withOpacity(0.6),
        //   ),
        // ),
      ),

      body: Obx(
        () => SingleChildScrollView(
          child: Column(
            children: [
              topSection(),
              40.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.0.w),
                child: Row(
                  children: [
                    // Country code box
                    Container(
                      height: 47.h,
                      width: 50.w,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: Colors.black.withOpacity(0.6),
                          width: 1.w,
                        ),
                        borderRadius: BorderRadius.circular(6.r),
                      ),
                      child: Center(
                        child: Text(
                          "971",

                          // sessionController.countryConfig.value?.mobileCode ??//     "",
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),

                    SizedBox(width: 10.w), // spacing
                    // WhatsApp number input
                    Expanded(
                      child: TextField(
                        controller: loginWithWhatsappController
                            .whatsappController
                            .value,
                        keyboardType: TextInputType.phone,
                        maxLength: 15,

                        // sessionController
                        //     .countryConfig
                        //     .value
                        //     ?.mobileLength ??
                        // 10,
                        decoration: InputDecoration(
                          hintText: "Enter WhatsApp Number",
                          counterText: '',
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 12.w,
                            vertical: 10.h,
                          ),
                          hintStyle: TextStyle(
                            color: Colors.black.withOpacity(0.3),
                            fontSize: 14.sp,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6.r),
                            borderSide: BorderSide(
                              color: Colors.black.withOpacity(0.6),
                              width: 1.w,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(6.r),
                            borderSide: BorderSide(
                              color: AppColors.primaryColor,
                              width: 1.w,
                            ),
                          ),
                        ),
                        inputFormatters: [
                          FilteringTextInputFormatter
                              .digitsOnly, // only numbers
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              40.h.sh,
              AppButton(
                width: 330.w,
                height: 50.h,
                onTap: () async {
                  await loginWithWhatsappController.sigInWithWhatsapp(false);
                },
                textStyle: TextStyle(color: AppColors.whiteColor),
                borderRadius: 50.r,
                isLoading: loginWithWhatsappController.isLoading,
                text: AppText.continues,
              ),
              SizedBox(height: MediaQuery.sizeOf(context).height * 0.333),
              PrivacyButtons(
                onTermsTap: () {
                  Get.toNamed(legalTermsScreen);
                },
                onPrivacyTap: () {
                  Get.toNamed(privacyPolicy);
                },
              ),
              // PrivacyButtons(
              //   onTermsTap:(){
              //     Get.toNamed(legalTermsScreen);
              //   },
              //   onPrivacyTap:() {
              //     Get.toNamed(privacyPolicy);
              //   },
              // ),
            ],
          ),
        ),
      ),
    );
  }

  ///top Static Section:
  Widget topSection() {
    return Column(
      children: [
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            10.h.sh,
            Align(
              alignment: Alignment.center,
              child: AppTextWidget(
                text: AppText.appName,
                color: AppColors.primaryColor,
                fontWeight: FontWeight.w500,
                fontSize: 16.sp,
              ),
            ),
            Center(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SvgPicture.asset(
                    color: AppColors.greenColor,
                    height: 12.h,
                    AppImages.lockIcon,
                  ),
                  5.w.sw,
                  AppTextWidget(
                    text: AppText.safeguard,
                    color: AppColors.greenColor,
                    fontWeight: FontWeight.normal,
                    fontSize: 10.sp,
                  ),
                ],
              ),
            ),
          ],
        ),

        60.h.sh,
        Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Column(
                children: [
                  Container(
                    height: 45.h,
                    width: 45.w,
                    decoration: BoxDecoration(
                      color: AppColors.blackColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: SvgPicture.asset(
                        height: 17.h,
                        AppImages.busIcon,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                  5.h.sh,
                  AppTextWidget(
                    text: AppText.freeShipping,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.w600,
                    fontSize: 12.sp,
                  ),
                  AppTextWidget(
                    text: AppText.onAllOrders,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.normal,
                    fontSize: 10.sp,
                  ),
                ],
              ),
              50.w.sw,
              Column(
                children: [
                  Container(
                    height: 45.h,
                    width: 45.w,
                    decoration: BoxDecoration(
                      color: AppColors.blackColor.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: SvgPicture.asset(
                        height: 17.h,
                        AppImages.returnIcon,
                        color: AppColors.blackColor,
                      ),
                    ),
                  ),
                  5.h.sh,
                  AppTextWidget(
                    text: AppText.freeReturns,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.w600,
                    fontSize: 12.sp,
                  ),
                  AppTextWidget(
                    text: AppText.upTo90Days,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.normal,
                    fontSize: 10.sp,
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
