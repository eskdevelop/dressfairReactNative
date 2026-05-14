import 'package:flutter/gestures.dart';

import '../routes/screens_library.dart';

void showPromotionSettingsBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ================= HEADER =================
            Padding(
              padding: EdgeInsets.only(left: 16.w, right: 16.w, top: 10.h),
              child: Row(
                children: [
                  Expanded(
                    child: AppTextWidget(
                      text: "Promotions",
                      textAlign: TextAlign.center,
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Icon(Icons.close, size: 22.sp),
                  ),
                ],
              ),
            ),
            SizedBox(height: 10.h),

            Divider(height: 1.h, thickness: 0.5),

            // ================= DESCRIPTION =================
            Padding(
              padding: EdgeInsets.only(
                left: 16.w,
                right: 16.w,
                top: 8.h,
                bottom: 8.h,
              ),
              child: AppTextWidget(
                text:
                    "Be the first to learn about promotions, daily deals, "
                    "and other exclusive savings.",
                fontSize: 12.sp,
                color: Colors.grey.shade700,
                fontWeight: FontWeight.w400,
              ),
            ),

            // ================= PUSH =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppTextWidget(
                    text: "Push",
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w500,
                  ),
                  AppTextWidget(
                    text: "Off",
                    fontSize: 13.sp,
                    color: Colors.grey,
                  ),
                ],
              ),
            ),

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
              child: RichText(
                text: TextSpan(
                  style: TextStyle(fontSize: 13.sp, color: Colors.grey[600]),
                  children: [
                    const TextSpan(
                      text:
                          "Push notifications are off. To enable this feature, ",
                    ),
                    TextSpan(
                      text: "turn on notifications >",
                      style: TextStyle(
                        color: AppColors.primaryColor,
                        fontWeight: FontWeight.w500,
                      ),
                      recognizer: TapGestureRecognizer()
                        ..onTap = () {
                          Get.back();
                        },
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 10.h),

            // ================= ILLUSTRATION PLACEHOLDER =================
            Center(
              child: Container(
                height: 100.h,
                width: 200.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Icon(
                  Icons.notifications_none,
                  size: 60.sp,
                  color: Colors.grey.shade300,
                ),
              ),
            ),

            SizedBox(height: 16.h),
            Divider(height: 1.h, thickness: 0.5),

            // ================= IN-APP =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppTextWidget(
                          text: "In-app notifications",
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          "Receive in-app notifications when you are using Dress Fair.",
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: false,
                    onChanged: (_) {},
                    activeColor: AppColors.primaryColor,
                    activeTrackColor: AppColors.primaryColor.withOpacity(0.35),

                    inactiveThumbColor: Colors.white,
                    inactiveTrackColor: Colors.grey.shade300,

                    trackOutlineColor: MaterialStateProperty.resolveWith(
                      (states) => Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),

            Divider(height: 1.h, thickness: 0.5),

            // ================= EMAIL =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppTextWidget(
                          text: "Email",
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          "amj***waz@gmail.com",

                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey[700],
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          "To opt out, turn off this button or follow the instructions in any email.",
                          style: TextStyle(
                            fontSize: 11.5.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: true,
                    onChanged: (_) {},
                    activeColor: AppColors.primaryColor,
                    activeTrackColor: AppColors.primaryColor.withOpacity(0.35),

                    inactiveThumbColor: Colors.white,
                    inactiveTrackColor: Colors.grey.shade300,

                    trackOutlineColor: MaterialStateProperty.resolveWith(
                      (states) => Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    },
  );
}
