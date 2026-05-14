import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../reuseable_buttons/unfill_button.dart';

void showCompleteProfileRequiredDialog(BuildContext context) {
  showDialog(
    context: context,
    barrierDismissible: true,
    builder: (context) {
      return Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        insetPadding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon
              Container(
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 14.h),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.orange.withOpacity(0.1),
                ),
                child: Icon(
                  Icons.person_outline,
                  size: 36.sp,
                  color: AppColors.primaryColor,
                ),
              ),

              SizedBox(height: 16.h),

              /// Title
              Text(
                "Complete Your Profile",
                style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600),
              ),

              SizedBox(height: 8.h),

              /// Message:
              Text(
                "Please complete your profile details to continue with your order.",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14.sp, color: Colors.black54),
              ),

              SizedBox(height: 24.h),

              // Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SizedBox(
                    width: 120.w,
                    height: 42.h,
                    child: AppButton(
                      width: 120.w,
                      height: 42.h,
                      onTap: () {
                        Get.back();
                      },
                      textStyle: TextStyle(color: Colors.white),
                      borderRadius: 10.r,
                      isLoading: false.obs,
                      text: "Cancel",
                    ),
                  ),
                  SizedBox(width: 10.w),
                  SizedBox(
                    width: 140.w,
                    height: 42.h,
                    child: UnFillButton(
                      width: 140.w,
                      height: 42.h,
                      containerColor: Colors.green,
                      onTap: () {
                        Get.back();
                        Get.toNamed(allInOneProfileUpdate);
                      },
                      textStyle: TextStyle(color: AppColors.whiteColor),
                      borderRadius: 10.r,
                      text: 'Complete Now',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
}
