import '../../../controller/auth_controller/register_controller.dart';
import '../../../controller/session_controller/session_controller.dart';
import '../../util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import '../../util/widgets/reuseable_textfield/reuseable_textfield.dart';
import '../../util/widgets/routes/screens_library.dart';
import 'login_with_email.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  RegisterController registerController = Get.put(RegisterController());

  final _formKey = GlobalKey<FormState>();
  SessionController sessionController = Get.find<SessionController>();
  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      await registerController.registrationApi();
    } else {
      // invalid -> errors shown automatically
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: Colors.white,
      appBar: AppBar(
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        backgroundColor: Colors.white,
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
          physics: BouncingScrollPhysics(),
          child: Column(
            children: [
              topSection(),
              30.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller: registerController.firstNameController.value,
                  labelText: 'firstName'.tr,
                  hintText: 'firstName'.tr,
                  emptyErrorText: 'requiredFirstName'.tr,
                  keyboardType: TextInputType.name,
                ),
              ),
              15.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller: registerController.lastNameController.value,
                  labelText: 'lastName'.tr,
                  hintText: 'lastName'.tr,
                  emptyErrorText: 'requiredLastName'.tr,
                  keyboardType: TextInputType.name,
                ),
              ),
              15.h.sh,

              Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.0.w),
                child: Row(
                  children: [
                    // Country code box:
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
                          sessionController.countryConfig.value?.mobileCode ??
                              "971",
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                    // WhatsApp number input:
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(left: 5.w),
                        child: ValidatedTextField(
                          controller: registerController.mobileController.value,
                          labelText: 'mobileNo'.tr,
                          hintText: 'mobileNo'.tr,
                          emptyErrorText: 'requiredMobileNo'.tr,
                          keyboardType: TextInputType.phone,
                        ),
                      ),
                    ),

                    // Expanded(
                    //   child: TextField(
                    //     controller: registerController.mobileController.value,
                    //     keyboardType: TextInputType.phone,
                    //     maxLength: 15,
                    //
                    //     // sessionController
                    //     //     .countryConfig
                    //     //     .value
                    //     //     ?.mobileLength ??
                    //     // 10,
                    //     decoration: InputDecoration(
                    //       hintText: "Enter WhatsApp Number",
                    //       counterText: '',
                    //       contentPadding: EdgeInsets.symmetric(
                    //         horizontal: 12.w,
                    //         vertical: 10.h,
                    //       ),
                    //       hintStyle: TextStyle(
                    //         color: Colors.black.withOpacity(0.3),
                    //         fontSize: 14.sp,
                    //       ),
                    //       border: OutlineInputBorder(
                    //         borderRadius: BorderRadius.circular(6.r),
                    //         borderSide: BorderSide(
                    //           color: Colors.black.withOpacity(0.6),
                    //           width: 1.w,
                    //         ),
                    //       ),
                    //       focusedBorder: OutlineInputBorder(
                    //         borderRadius: BorderRadius.circular(6.r),
                    //         borderSide: BorderSide(
                    //           color: AppColors.primaryColor,
                    //           width: 1.w,
                    //         ),
                    //       ),
                    //     ),
                    //     inputFormatters: [
                    //       FilteringTextInputFormatter
                    //           .digitsOnly, // only numbers
                    //     ],
                    //   ),
                    // ),
                  ],
                ),
              ),
              15.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller: registerController.emailController.value,
                  labelText: 'email'.tr,
                  hintText: 'email'.tr,
                  emptyErrorText: 'requiredEmail'.tr,
                  keyboardType: TextInputType.emailAddress,
                ),
              ),

              15.h.sh,
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 18.0.w),
                child: ValidatedTextField(
                  controller: registerController.passwordController.value,
                  labelText: 'password'.tr,
                  hintText: 'password'.tr,
                  emptyErrorText: 'requiredPassword'.tr,
                  keyboardType: TextInputType.visiblePassword,
                ),
              ),
              35.h.sh,
              AppButton(
                width: 330.w,
                height: 50.h,
                onTap: () {
                  _submit();
                },
                textStyle: TextStyle(color: AppColors.whiteColor),
                borderRadius: 50.r,
                isLoading: registerController.isLoading,
                text: AppText.continues,
              ),

              SizedBox(height: 15.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Center(
                    child: AppTextWidget(
                      text: "alreadyHaveAnAccount".tr,
                      //AppText.troubleSigningIn,
                      fontSize: 10.sp,
                      color: AppColors.blackColor.withOpacity(0.3),
                    ),
                  ),
                  SizedBox(width: 3.w),
                  GestureDetector(
                    onTap: () {
                      registerController.firstNameController.value.clear();
                      registerController.lastNameController.value.clear();
                      registerController.mobileController.value.clear();
                      registerController.emailController.value.clear();
                      registerController.passwordController.value.clear();

                      Get.off(LoginWithEmail());
                    },
                    child: AppTextWidget(
                      text: "login".tr,
                      fontSize: 11.sp,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ],
              ),
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
}
