import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/legal_term_and_policy/privacy_policy.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class DeliveryGuaranteeScreen extends StatelessWidget {
  const DeliveryGuaranteeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        title: AppTextWidget(
          text: "deliveryGuarantee".tr,
          fontWeight: FontWeight.w500,
          color: AppColors.blackColor,
          fontSize: 16.sp,
        ),
        leadingWidth: 38.w,
        leading: GestureDetector(
          onTap: () {
            Get.back();
          },
          child: Container(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.0.w, vertical: 8.0.h),
              child: SvgPicture.asset(
                height: 8.h,
                width: 8.w,
                AppImages.backArrow,
              ),
            ),
          ),
        ),
      ),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ✅ Shop confidently section
            _sectionTitle(
              icon: Icons.verified,
              title: "shopConfidentlyWithDeliveryGuarantee".tr,
            ),
            SizedBox(height: 6.h),
            _normalText("shopConfidentlyWithDeliveryGuarantee".tr),

            SizedBox(height: 14.h),

            // ✅ Credit for delay section
            _subSectionTitle(icon: Icons.check, title: "creditForDelay".tr),
            SizedBox(height: 6.h),
            _normalText("ifYourOrderIsNot".tr),
            SizedBox(height: 4.h),
            _bulletText("creditForStandardShipping".tr),
            SizedBox(height: 6.h),
            _normalText("theCreditWillBe".tr),
            _linkText("forMoreExceptions".tr, context),

            SizedBox(height: 16.h),

            // ✅ Return if item damaged
            _subSectionTitle(
              icon: Icons.check,
              title: "returnIfItemDamaged".tr,
            ),
            SizedBox(height: 6.h),
            _normalText("ifYouReceiveYourPackageAnd".tr),

            SizedBox(height: 16.h),

            // ✅ Refund for no update
            _subSectionTitle(icon: Icons.check, title: "refundForNoUpdate".tr),
            SizedBox(height: 6.h),
            _normalText("ifThere".tr),
            _bulletText("daysWithoutUpdates".tr),
            _bulletText("daysWithoutUpdatesc".tr),
            _normalText("ifYouReceiveThe".tr),
            _linkText("forMoreExceptionsAnd".tr, context),

            SizedBox(height: 16.h),

            // ✅ Refund for no delivery
            _subSectionTitle(
              icon: Icons.check,
              title: "refundForNoDelivery".tr,
            ),
            SizedBox(height: 6.h),
            _normalText("ifYourPackage".tr),
            _bulletText("30DaysFor".tr),
            _bulletText("45DaysFor".tr),
            _normalText("ifYouReceiveThePackageAfter".tr),
            _linkText("forMoreExceptionsAndDetails".tr, context),

            SizedBox(height: 18.h),

            _noteText("theseDetailsAreSpecific".tr),
          ],
        ),
      ),
    );
  }

  // ----------------- WIDGET HELPERS -----------------

  Widget _sectionTitle({required IconData icon, required String title}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.green, size: 18.sp),
        SizedBox(width: 6.w),
        Expanded(
          child: AppTextWidget(
            text: title,
            fontSize: 15.sp,
            fontWeight: FontWeight.w600,
            color: Colors.green,
          ),
        ),
      ],
    );
  }

  Widget _subSectionTitle({required IconData icon, required String title}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: Colors.green, size: 18.sp),
        SizedBox(width: 6.w),
        Expanded(
          child: AppTextWidget(
            text: title,
            fontSize: 13.sp,
            fontWeight: FontWeight.w600,
            color: Colors.green,
          ),
        ),
      ],
    );
  }

  Widget _normalText(String text) {
    return AppTextWidget(
      text: text,
      fontSize: 11.5.sp,
      color: Colors.black87,
      fontWeight: FontWeight.w400,
    );
  }

  Widget _bulletText(String text) {
    return Padding(
      padding: EdgeInsets.only(left: 10.w, top: 4.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "• ",
            style: TextStyle(fontSize: 14.sp, color: Colors.black87),
          ),
          Expanded(
            child: AppTextWidget(
              text: text,
              fontSize: 11.5.sp,
              color: Colors.black87,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _linkText(String text, BuildContext context) {
    return GestureDetector(
      onTap: () {
        Get.off(PrivacyPolicy());
      },
      child: Row(
        children: [
          SizedBox(
            width: MediaQuery.sizeOf(context).width * 0.92,
            // color: Colors.red,
            child: Padding(
              padding: EdgeInsets.only(top: 6.h),
              child: AppTextWidget(
                text: "$text ›",
                fontSize: 11.5.sp,
                color: AppColors.primaryColor,
                fontWeight: FontWeight.w400,
                maxLines: 8,
                softWrap: true,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _noteText(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(Icons.info_outline, color: Colors.grey, size: 16.sp),
        SizedBox(width: 6.w),
        Expanded(
          child: AppTextWidget(
            text: text,
            fontSize: 12.sp,
            color: Colors.black54,
          ),
        ),
      ],
    );
  }
}
