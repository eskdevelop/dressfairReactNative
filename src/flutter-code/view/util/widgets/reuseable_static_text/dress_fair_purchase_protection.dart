import 'package:dress_fair_ecommmerce/view/util/constant/app_colors/appcolors.dart';
import 'package:dress_fair_ecommmerce/view/util/constant/app_styles/app_textstyle.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

class DressFairPurchaseProtectionScreen extends StatelessWidget {
  const DressFairPurchaseProtectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        centerTitle: true,
        title: AppTextWidget(
          text: "dressFairPurchaseProtection".tr,
          fontSize: 14.sp,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_new,
              size: 18.sp,
              color: Colors.black,
            ),
            onPressed: () => Get.back(),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🟢 Green Info Banner
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.shopping_bag_outlined,
                        color: Colors.green,
                        size: 20.sp,
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppTextWidget(
                              text:
                                  "shopConfidentlyDressFairPurchaseProtectionProgram"
                                      .tr,
                              fontSize: 13.5.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.green.shade800,
                            ),
                            SizedBox(height: 4.h),
                          ],
                        ),
                      ),
                    ],
                  ),
                  AppTextWidget(
                    text: "GetAFullRefund".tr,
                    fontSize: 11.5.sp,
                    color: Colors.green.shade900,
                    fontWeight: FontWeight.w400,
                    maxLines: 10,
                  ),
                ],
              ),
            ),

            SizedBox(height: 18.h),

            // 🟠 Section Title
            AppTextWidget(
              text: "dressFairPurchase".tr,
              fontSize: 13.5.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
            SizedBox(height: 6.h),
            AppTextWidget(
              text: "easilyGetHelp".tr,
              fontSize: 11.5.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w400,
            ),

            SizedBox(height: 20.h),

            AppTextWidget(
              text: "whatEligible".tr,
              fontSize: 13.5.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black,
            ),
            SizedBox(height: 6.h),
            AppTextWidget(
              text: "yourOrder".tr,
              fontSize: 11.5.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w400,
              maxLines: 10,
            ),
            SizedBox(height: 28.h),
            Center(
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.symmetric(
                      vertical: 10.h,
                      horizontal: 12.w,
                    ),
                    color: const Color(0xFFFFF4E6).withOpacity(0.5),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppTextWidget(
                          text: "WeveGot".tr,
                          fontSize: 13.5.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                        ),
                        SizedBox(height: 10.h),
                        _buildStep(
                          num: "1",
                          title: "fileAReturn".tr,
                          desc: "selectTheItem".tr,
                        ),
                        _buildStep(
                          num: "2",
                          title: "awaitingPickUp".tr,
                          desc: "pleasePrepareTheReturn".tr,
                        ),
                        _buildStep(
                          num: "3",
                          title: "getRefunded".tr,
                          desc: "ifYourOrderIsEligibleFor".tr,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStep({
    required String num,
    required String title,
    required String desc,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 14.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 20.w,
                width: 20.w,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.primaryColor,
                  shape: BoxShape.circle,
                ),
                child: AppTextWidget(
                  text: num,
                  fontSize: 12.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(width: 8.w),
              AppTextWidget(
                text: title,
                fontSize: 13.5.sp,
                fontWeight: FontWeight.w600,
                //color:Colors,

                //Colors.brown.shade800,
              ),
            ],
          ),
          SizedBox(height: 6.h),
          AppTextWidget(
            text: desc,
            fontSize: 11.5.sp,
            fontWeight: FontWeight.w400,
            color: Colors.black.withOpacity(0.5),
            maxLines: 10,
          ),
        ],
      ),
    );
  }
}
