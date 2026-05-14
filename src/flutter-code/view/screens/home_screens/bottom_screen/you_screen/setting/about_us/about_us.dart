import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class AboutUsScreen extends StatelessWidget {
  const AboutUsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: AppTextWidget(
          text: "aboutUs".tr,
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        centerTitle: true,

        elevation: 0,
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.black, size: 22.sp),
            onPressed: () => Get.back(),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🟠 Section 1
            Center(
              child: AppTextWidget(
                text: "whatIsDressFair".tr,
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryColor,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "dressFairIsAnEcommerce".tr,

              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
              maxLines: 10,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 2
            Center(
              child: AppTextWidget(
                text: "whatDoesDressFairMean".tr,
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "dressFairShop".tr,
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
              maxLines: 10,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 3
            Center(
              child: AppTextWidget(
                text: "whereAreTheProductsSold".tr,
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "theProductsFromSellers".tr,
              fontSize: 12.sp,
              maxLines: 10,
              fontWeight: FontWeight.w400,

              color: Colors.black.withOpacity(0.8),
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 4
            Center(
              child: AppTextWidget(
                text: "dressFairsstrengths".tr,
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "dressFairIsBringing".tr,
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              maxLines: 10,

              color: Colors.black.withOpacity(0.8),
            ),
            SizedBox(height: 8.h),
            // 🟢 Bullet points
            AppTextWidget(
              text: "abilityToOffer".tr,
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,

              color: Colors.black,
            ),
            AppTextWidget(
              text: "experienceInCollaborating".tr,
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,

              color: Colors.black,
            ),
            AppTextWidget(
              text: "CommitmentToAffordable".tr,
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,

              color: Colors.black,
            ),
            SizedBox(height: 20.h),
          ],
        ),
      ),
    );
  }
}
