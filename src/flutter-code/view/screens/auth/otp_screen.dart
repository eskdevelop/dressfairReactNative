import 'package:dress_fair_ecommmerce/controller/auth_controller/login_with_whatsapp_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:pin_code_fields/pin_code_fields.dart';

class OtpScreen extends StatefulWidget {
  final String phone; // e.g. "971374636423"

  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  LoginWithWhatsappController loginWithWhatsappController = Get.put(
    LoginWithWhatsappController(),
  );
  String otp = "";
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      appBar: AppBar(
        surfaceTintColor: Colors.white,
        foregroundColor: Colors.white,
        backgroundColor: Colors.white,
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: const Icon(Icons.arrow_back_ios_new, color: Colors.black),
        ),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.0.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // topSection(),
              SizedBox(height: 50.h),
              Text(
                "enterTheVerificationCode".tr,
                style: TextStyle(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: TextStyle(color: Colors.black, fontSize: 14.sp),
                  children: [
                    TextSpan(text: "${"aVerificationCodeIsSentTo".tr}\n\n "),

                    TextSpan(
                      text: widget.phone,
                      style: TextStyle(
                        color: AppColors.primaryColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 18.sp,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: 50.h),

              /// OTP Boxes:
              PinCodeTextField(
                appContext: context,
                length: 5,
                autoFocus: true,
                keyboardType: TextInputType.number,
                onChanged: (value) {
                  setState(() {
                    otp = value;
                  });
                },
                pinTheme: PinTheme(
                  shape: PinCodeFieldShape.box,
                  borderRadius: BorderRadius.circular(8.r),
                  fieldHeight: 60.h,
                  fieldWidth: 50.w,
                  activeFillColor: Colors.white,
                  selectedFillColor: Colors.white,
                  inactiveFillColor: Colors.white,
                  activeColor: Colors.black,
                  selectedColor: AppColors.primaryColor,
                  inactiveColor: Colors.grey,
                  borderWidth: 1,
                ),
                cursorColor: Colors.black,
              ),

              SizedBox(height: MediaQuery.sizeOf(context).height * 0.38),
              AppButton(
                width: 300.w,
                height: 50.h,
                onTap: () async {
                  await loginWithWhatsappController.verifyOTP(
                    widget.phone,
                    otp,
                    context,
                  );
                },
                textStyle: TextStyle(color: Colors.white),
                borderRadius: 50.r,
                isLoading: loginWithWhatsappController.isLoading,
                text: AppText.verify,
              ),
              15.h.sh,
              SizedBox(
                width: MediaQuery.sizeOf(context).width,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    AppTextWidget(
                      text: "Did you Received any Code?",
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                      color: Colors.grey,
                    ),
                    5.w.sw,
                    GestureDetector(
                      onTap: () async {
                        await loginWithWhatsappController.sigInWithWhatsapp(
                          true,
                        );
                      },
                      child: AppTextWidget(
                        text: "Resend New Code",
                        color: AppColors.primaryColor,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              20.h.sh,

              // PrivacyButtons(
              //   onTermsTap: () {
              //     Get.toNamed(legalTermsScreen);
              //   },
              //   onPrivacyTap: () {
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
            0.h.sh,
            Align(
              alignment: Alignment.center,
              child: AppTextWidget(
                text: "appName".tr,
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
                    text: "safeguard".tr,
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
                    text: "freeShipping".tr,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.w600,
                  ),
                  AppTextWidget(
                    text: "onAllOrders".tr,
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
                    text: "freeReturns".tr,
                    color: Colors.black.withOpacity(0.7),
                    fontWeight: FontWeight.w600,
                  ),
                  AppTextWidget(
                    text: "upTo90Days".tr,
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
