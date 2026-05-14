import 'dart:ui';

import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class SessionExpiredDialog extends StatelessWidget {
  const SessionExpiredDialog({super.key});

  @override
  Widget build(BuildContext context) {
    // 1. Wrap with BackdropFilter for the blurry background effect
    return BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24.r),
        ),
        backgroundColor: Colors.white,
        elevation: 10,
        insetPadding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 32.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 2. The Gradient Icon (Clock + Lock)
              _buildGradientIcon(),
              SizedBox(height: 24.h),

              // 3. Title:
              AppTextWidget(
                text: "Session Expired",
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1F2937),
              ),
              SizedBox(height: 12.h),
              // 4. Description Text
              AppTextWidget(
                text:
                    "For your security, you have been logged out due to inactivity. Please log in again to continue.",
                textAlign: TextAlign.center,
                fontSize: 15.sp,
                color: Color(0xFF6B7280),
              ),
              SizedBox(height: 32.h),
              // 5. Gradient "Log In Again" Button:
              _buildGradientButton(
                text: "Log In Again",
                onPressed: () {
                  Navigator.of(context).pop();
                  Get.toNamed(loginInScreen);
                },
              ),
              SizedBox(height: 12.h),
              _buildSecondaryButton(
                text: "Cancel",
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Helper widget to build the Custom Gradient Icon
  Widget _buildGradientIcon() {
    return ShaderMask(
      shaderCallback: (Rect bounds) {
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xffE56B2A),
            Color(0xffFF9559),
            //   Color(0xFF60A5FA), // Light Blue
            // Color(0xFF8B5CF6), // Purple
          ],
        ).createShader(bounds);
      },
      child: Stack(
        alignment: Alignment.bottomRight,
        children: [
          Icon(
            Icons.access_time_filled_rounded,
            size: 64.sp,
            color: Colors.white,
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 2.h),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.lock_rounded,
              size: 24.sp,
              color: Colors.white, // Will be gradient
            ),
          ),
        ],
      ),
    );
  }

  // Helper for the Gradient Button
  Widget _buildGradientButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return Container(
      width: double.infinity,
      height: 50.h,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.r),
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            Color(0xffE56B2A),
            Color(0xffFF9559),
            //  Color(0xFF4F46E5), // Indigo
            //Color(0xFF9333EA), // Purple
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor.withOpacity(0.3),
            blurRadius: 12.r,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16.r),
          child: Center(
            child: AppTextWidget(
              text: text,
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  // Helper for the Cancel Button
  Widget _buildSecondaryButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 50.h,
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          backgroundColor: const Color(0xFFF3F4F6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.r),
          ),
          elevation: 0,
        ),
        child: AppTextWidget(
          text: text,
          color: Color(0xFF6B7280),
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
