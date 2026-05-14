import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/legal_term_and_policy/refund_policy.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/legal_term_and_policy/term_and_condition.dart';
import 'package:dress_fair_ecommmerce/view/util/constant/app_images.dart';
import 'package:dress_fair_ecommmerce/view/util/constant/app_styles/app_textstyle.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';

import 'legal_term_and_policy/about_us.dart';
import 'legal_term_and_policy/privacy_policy.dart';

class LegalTermsScreen extends StatelessWidget {
  const LegalTermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      "privacyPolicy".tr,
      "termsOfConditions".tr,
      "returnAndRefundPolicy".tr,
      "aboutUs".tr,
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        title: AppTextWidget(
          text: "legalTermsAndPolicies".tr,
          fontWeight: FontWeight.bold,
          color: Colors.black,
          fontSize: 15.sp,
        ),
        leadingWidth: 44.w,
        leading: Padding(
          padding: EdgeInsets.only(right: 4.0.w),
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Container(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 8.0.w,
                  vertical: 8.0.h,
                ),
                child: SvgPicture.asset(
                  height: 10.h,
                  width: 10.w,
                  AppImages.backArrow,
                ),
              ),
            ),
          ),
        ),
      ),

      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(6.r),
          ),
          child: ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) =>
                Divider(height: 1.h, color: Colors.grey.shade300),
            itemBuilder: (context, index) {
              return InkWell(
                onTap: () {
                  if (index == 0) {
                    Get.to(PrivacyPolicy());
                  } else if (index == 1) {
                    Get.to(TermAndCondition());
                  } else if (index == 2) {
                    Get.to(RefundPolicy());
                  } else if (index == 3) {
                    Get.to(AboutUs());
                  } else {}
                  // navigate to respective policy screen:
                },
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    vertical: 14.h,
                    horizontal: 4.w,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: items[index],
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.black,
                      ),
                      Icon(
                        Icons.arrow_forward_ios_rounded,
                        size: 16.sp,
                        color: Colors.black54,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
