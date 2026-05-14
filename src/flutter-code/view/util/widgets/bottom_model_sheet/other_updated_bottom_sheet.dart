import 'package:flutter/gestures.dart';

import '../routes/screens_library.dart';

void showOrderUpdatesBottomSheet(BuildContext context) {
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
                      text: "Order updates",
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
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              child: AppTextWidget(
                text:
                    "Receive notifications about order confirmations and shipment updates.",
                fontSize: 12.sp,
                color: Colors.grey.shade700,
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

            // ================= IMAGE =================
            Center(
              child: Container(
                height: 120.h,
                width: 220.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Icon(
                  Icons.local_shipping_outlined,
                  size: 60.sp,
                  color: Colors.grey.shade300,
                ),
              ),
            ),

            SizedBox(height: 16.h),
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
                          "If you didn't receive the email, please check your promotions or spam folder. "
                          "To ensure that you can receive your items, it is not possible to opt out of receiving "
                          "important emails containing package pickup information.",
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
                    onChanged: (v) {},
                    activeColor: AppColors.primaryColor,
                    activeTrackColor: AppColors.primaryColor.withOpacity(0.35),
                    inactiveThumbColor: Colors.white,
                    inactiveTrackColor: Colors.grey.shade300,
                    trackOutlineColor: MaterialStateProperty.all(
                      Colors.transparent,
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
