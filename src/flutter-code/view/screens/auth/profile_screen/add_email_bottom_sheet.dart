import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';

class UpdateEmailBottomSheet extends StatelessWidget {
  UpdateEmailBottomSheet({super.key});
  GetProfileController getProfileController = Get.put(GetProfileController());
  @override
  Widget build(BuildContext context) {
    return Padding(
      // For keyboard
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  Expanded(
                    child: Text(
                      "Enter a new email address",
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(Icons.close, size: 22.sp, color: Colors.black),
                  ),
                ],
              ),

              12.h.verticalSpace,

              // Description
              Text(
                "Please enter a new email address you would like to associate with your account below.",
                style: TextStyle(
                  fontSize: 12.sp,
                  color: Colors.grey[700],
                  height: 1.4,
                ),
              ),

              16.h.verticalSpace,

              // Input field
              Container(
                height: 50.h,
                padding: EdgeInsets.symmetric(horizontal: 12.w),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: TextField(
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(fontSize: 13.sp),
                  decoration: InputDecoration(
                    hintText: "Enter your email address",
                    hintStyle: TextStyle(
                      fontSize: 12.sp,
                      color: Colors.grey[400],
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),

              18.h.verticalSpace,

              /// Continue Button:
              Center(
                child: AppButton(
                  width: 150.w,
                  height: 45.h,
                  onTap: () async {
                    await getProfileController.updateCustomerProfile();
                  },
                  textStyle: TextStyle(color: Colors.white),
                  borderRadius: 50.r,
                  isLoading: getProfileController.isLoading,
                  text: "Continue",
                ),
              ),

              12.h.verticalSpace,
            ],
          ),
        ),
      ),
    );
  }
}
