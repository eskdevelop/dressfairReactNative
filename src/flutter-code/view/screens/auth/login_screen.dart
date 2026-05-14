import 'package:dress_fair_ecommmerce/controller/auth_controller/google_button_login_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/privacy_buttons.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  LoginController loginController = Get.put(LoginController());
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: Obx(
        () => SingleChildScrollView(
          physics: BouncingScrollPhysics(),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              60.h.sh,
              crossIcon(),
              20.h.sh,
              topSection(),
              80.h.sh,
              Visibility(
                visible: loginController.isLoading.value,
                child: SizedBox(height: 80.h),
              ),
              loginController.isLoading.value
                  ? Center(
                      child: SpinKitFadingCircle(
                        color: AppColors.greyColor,
                        size: 45.sp,
                      ),
                    )
                  : SizedBox(),
              Visibility(
                visible: loginController.isLoading.value,
                child: SizedBox(height: 140.h),
              ),
              // Google sign-in temporarily disabled — re-enable when ready.
              // Visibility(
              //   visible: !loginController.isLoading.value,
              //   child: bottomButton(
              //     icon: AppImages.googleIcon,
              //     text: AppText.signInGoogle,
              //     onTap: () async {
              //       await loginController.handleSignIn();
              //     },
              //     isEmail: false,
              //   ),
              // ),
              // 15.h.sh,
              // bottomButton(
              //   icon: AppImages.facebookIcon,
              //   text: AppText.signInFacebook,
              //   onTap: () {
              //
              //   },
              //   isEmail: false,
              // ),
              Visibility(
                visible: !loginController.isLoading.value,
                child: bottomButton(
                  icon: AppImages.whatsappIcon,
                  text: AppText.signInWhatsapp,
                  onTap: () {
                    Get.toNamed(
                      loginWithWhatsapp,
                      arguments: {"isFromHome": false},
                    );
                  },
                  isEmail: false,
                ),
              ),
              15.h.sh,
              Visibility(
                visible: !loginController.isLoading.value,
                child: bottomButton(
                  icon: AppImages.emailIcon,
                  text: AppText.signInEmail,
                  isEmail: true,
                  onTap: () async {
                    // await loginController.handleSignIn();
                    Get.toNamed(loginWithEmail);
                  },
                ),
              ),
              SizedBox(height: MediaQuery.sizeOf(context).height * 0.21),
              Padding(
                padding: EdgeInsets.only(right: 10.0.w),
                child: PrivacyButtons(
                  onTermsTap: () {
                    Get.toNamed(legalTermsScreen);
                  },
                  onPrivacyTap: () {
                    Get.toNamed(privacyPolicy);
                  },
                ),
              ),
              // bottomText(() {}, () {}),
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

  ///top Cross Icon:
  Widget crossIcon() {
    return Padding(
      padding: EdgeInsets.only(left: 15.0.w, right: 15.w),
      child: GestureDetector(
        onTap: () {
          Get.back();
        },
        child: SvgPicture.asset(height: 20.h, AppImages.crossIcon),
      ),
    );
  }

  ///Bottom All Buttons:
  Widget bottomButton({
    required String icon,
    required String text,
    required VoidCallback onTap,
    required bool isEmail,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Center(
        child: Container(
          height: 50.h,
          width: 320.w,
          decoration: BoxDecoration(
            color: text == AppText.signInGoogle
                ? AppColors.primaryColor
                : Colors.transparent,
            borderRadius: BorderRadius.circular(35.r),
            border: Border.all(
              color: text == AppText.signInGoogle
                  ? Colors.transparent
                  : AppColors.blackColor.withOpacity(0.4),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(width: MediaQuery.sizeOf(context).width * 0.13),
              SvgPicture.asset(height: isEmail == true ? 16.h : 25.h, icon),
              12.w.sw,
              AppTextWidget(
                text: text,
                color: text == AppText.signInGoogle
                    ? Colors.white
                    : Colors.black.withOpacity(0.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
