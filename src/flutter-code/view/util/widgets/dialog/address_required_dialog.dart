import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../reuseable_buttons/unfill_button.dart';

void showAddAddressRequiredDialog(BuildContext context) {
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
                  color: Colors.green.withOpacity(0.1),
                ),
                child: Icon(
                  Icons.location_on_outlined,
                  size: 36.sp,
                  color: Colors.green,
                ),
              ),

              SizedBox(height: 16.h),

              // Title
              Text(
                "Address Required",
                style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.w600),
              ),

              SizedBox(height: 8.h),

              // Message
              Text(
                "Please add a delivery address to continue with your order.",
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

                  SizedBox(width: 12.w),

                  SizedBox(
                    width: 120.w,
                    height: 42.h,
                    child: UnFillButton(
                      width: 120.w,
                      height: 42.h,
                      containerColor: Colors.green,
                      onTap: () {
                        Get.back();
                        Get.toNamed(
                          addNewAddress,
                          arguments: {'id': "0", 'isEdit': false},
                        );
                      },
                      textStyle: TextStyle(color: AppColors.whiteColor),
                      borderRadius: 10.r,
                      text: 'Add Address',
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
