import 'package:dress_fair_ecommmerce/view/util/constant/app_colors/appcolors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

void showDressFairLeaveDialog(
  BuildContext context, {
  required VoidCallback? onContinue,
  required VoidCallback? onLeave,
}) {
  showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.black.withOpacity(0.5),
    builder: (context) {
      return Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16.r),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 24.h),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(height: 30.h),
                  Text(
                    "Enjoy these special offers after signing in! Are you sure you want to leave now?",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: Colors.black87,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: 20.h),

                  // Offer icons section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _offerItem(
                        icon: Icons.local_shipping_outlined,
                        title: "Free shipping",
                        subtitle: "On all orders",
                      ),
                      SizedBox(width: 24.w),
                      _offerItem(
                        icon: Icons.assignment_return_outlined,
                        title: "Free returns",
                        subtitle: "Up to 90 days",
                      ),
                    ],
                  ),

                  SizedBox(height: 24.h),

                  // Continue button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        //if (onContinue != null) onContinue();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                      ),
                      child: Text(
                        "Continue",
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 10.h),

                  // Leave button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        if (onLeave != null) onLeave();
                      },
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(
                          color: Colors.grey.shade400,
                          width: 1.w,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30.r),
                        ),
                        padding: EdgeInsets.symmetric(vertical: 12.h),
                      ),
                      child: Text(
                        "Leave",
                        style: TextStyle(
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              // Close button (top-right corner):
              Positioned(
                right: -10.w,
                top: -10.h,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(color: Colors.black26, blurRadius: 4.r),
                      ],
                    ),
                    padding: EdgeInsets.symmetric(
                      horizontal: 4.w,
                      vertical: 4.0.h,
                    ),
                    child: Icon(
                      Icons.close,
                      size: 20.sp,
                      color: Colors.black54,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}

// Helper widget for each offer item
Widget _offerItem({
  required IconData icon,
  required String title,
  required String subtitle,
}) {
  return Column(
    children: [
      Container(
        decoration: BoxDecoration(
          color: Colors.orange.shade50,
          shape: BoxShape.circle,
        ),
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
        child: Icon(icon, color: AppColors.primaryColor, size: 24.r),
      ),
      SizedBox(height: 8.h),
      Text(
        title,
        style: TextStyle(
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
      ),
      Text(
        subtitle,
        style: TextStyle(fontSize: 10.sp, color: Colors.black54),
      ),
    ],
  );
}
