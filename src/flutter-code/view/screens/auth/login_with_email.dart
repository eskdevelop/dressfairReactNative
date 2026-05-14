import 'package:dress_fair_ecommmerce/controller/auth_controller/login_with_email_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/registration_screen.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_textfield/reuseable_textfield.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:flutter/gestures.dart';

class LoginWithEmail extends StatefulWidget {
  const LoginWithEmail({super.key});
  @override
  State<LoginWithEmail> createState() => _LoginWithEmailState();
}

class _LoginWithEmailState extends State<LoginWithEmail> {
  LoginWithEmailController loginWithEmailController = Get.put(
    LoginWithEmailController(),
  );
  final _formKey = GlobalKey<FormState>();
  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      await loginWithEmailController.loginWithEmailPasswordApi(context);
    } else {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back_ios_new,
              color: Colors.black.withOpacity(0.6),
            ),
          ),
        ),
      ),

      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            children: [
              topSection(),
              40.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller:
                      loginWithEmailController.loginEmailController.value,
                  labelText: 'email'.tr,
                  hintText: 'pleaseEnterYourEmail'.tr,
                  emptyErrorText: "requiredEmail".tr,
                ),
              ),
              15.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller:
                      loginWithEmailController.loginPassController.value,
                  labelText: 'password'.tr,
                  hintText: 'pleaseEnterYourPassword'.tr,
                  emptyErrorText: "requiredPassword".tr,
                ),
              ),
              40.h.sh,
              AppButton(
                width: 330.w,
                height: 50.h,
                onTap: () {
                  _submit();
                },
                textStyle: TextStyle(color: AppColors.whiteColor),
                borderRadius: 50.r,
                isLoading: loginWithEmailController.isLoading,
                text: AppText.continues,
              ),
              bottomText(() {}, () {}),
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
            20.h.sh,
            Align(
              alignment: Alignment.center,
              child: AppTextWidget(
                text: AppText.appName,
                color: AppColors.primaryColor,
                fontWeight: FontWeight.w600,
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

        40.h.sh,
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

  ///Bottom Text:
  Widget bottomText(
    final VoidCallback? onTermsTap,
    final VoidCallback? onPrivacyTap,
  ) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        14.h.sh,
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Center(
              child: AppTextWidget(
                text: "dontHaveAnAccount".tr,
                fontSize: 10.sp,
                color: AppColors.blackColor.withOpacity(0.3),
              ),
            ),
            SizedBox(width: 3.w),
            GestureDetector(
              onTap: () {
                loginWithEmailController.loginEmailController.value.clear();
                loginWithEmailController.loginPassController.value.clear();
                Get.off(RegistrationScreen());
              },
              child: AppTextWidget(
                text: "register".tr,
                fontSize: 11.sp,
                color: AppColors.primaryColor,
              ),
            ),
          ],
        ),

        20.h.sh,
        SizedBox(height: MediaQuery.sizeOf(context).height * 0.25),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w400,
              color: AppColors.blackColor.withOpacity(0.5),
            ),
            children: [
              TextSpan(text: "${AppText.privacyText} "),
              TextSpan(
                text: " ${AppText.hyperLinkPrivacyText} ",
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
                recognizer: TapGestureRecognizer()..onTap = onTermsTap,
              ),
              TextSpan(text: " ${AppText.and} "),
              TextSpan(
                text: AppText.hyperLinkPrivacyText1,
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
                recognizer: TapGestureRecognizer()..onTap = onPrivacyTap,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
