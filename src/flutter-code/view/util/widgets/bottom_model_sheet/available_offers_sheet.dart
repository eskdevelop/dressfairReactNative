import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class OfferBottomSheet {
  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.8,
        child: const _OfferContent(),
      ),
    );
  }
}

class _OfferContent extends StatelessWidget {
  const _OfferContent();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 14.w,
          right: 14.w,
          top: 10.h,
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          children: [
            // Drag Handle
            Container(
              width: 36.w,
              height: 4.h,
              margin: EdgeInsets.only(bottom: 10.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade400,
                borderRadius: BorderRadius.circular(12.r),
              ),
            ),

            // Title Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: 'availableOffers'.tr,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
                IconButton(
                  icon: Icon(Icons.close, size: 20.sp),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            Divider(height: 1),

            // Body
            Expanded(
              child: ListView(
                padding: EdgeInsets.only(top: 8.h),
                children: [
                  _sectionTitle('deliveryGuarantee'.tr),

                  _offerCard(
                    icon: Icons.local_shipping_outlined,
                    title: 'reliableDelivery'.tr,
                    details: ['reliableLogistics'.tr],
                  ),

                  _sectionTitle('shoppingBenefits'.tr),

                  _offerCard(
                    icon: Icons.flash_on_outlined,
                    title: 'fastShipping'.tr,
                    details: ['normallyDeliveredIn2OR3Days'.tr],
                  ),

                  _offerCard(
                    icon: Icons.card_giftcard_outlined,
                    title: 'freeShipping'.tr,
                    details: ['freeShippingOverShopping150AED'.tr],
                  ),

                  _offerCard(
                    icon: Icons.payments_outlined,
                    title: 'cashOnDelivery'.tr,
                    details: ['payWhenYouReceiveYourOrder'.tr],
                  ),

                  _sectionTitle('safePayments'.tr),

                  _offerCard(
                    icon: Icons.verified_outlined,
                    title: 'fastAndSecure'.tr,
                    details: ['realTimeAndFastResponses'.tr],
                  ),

                  _sectionTitle('securePrivacy'.tr),

                  _offerCard(
                    icon: Icons.lock_outline,
                    title: 'youDataSafety'.tr,
                    details: ['theSecurityOfYourPersonalInformation'.tr],
                  ),

                  SizedBox(height: 20.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ------------------------
  // Section Title
  // ------------------------
  Widget _sectionTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(top: 10.h, bottom: 6.h),
      child: AppTextWidget(
        text: title,
        fontSize: 12.sp,
        fontWeight: FontWeight.w600,
        color: Colors.grey.shade800,
        maxLines: 1,
      ),
    );
  }

  // ------------------------
  // Offer Card
  // ------------------------
  Widget _offerCard({
    required IconData icon,
    required String title,
    required List<String> details,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18.sp, color: Colors.green),

          SizedBox(width: 10.w),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextWidget(
                  text: title,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  maxLines: 1,
                ),

                SizedBox(height: 4.h),

                ...details.map(
                  (e) => AppTextWidget(
                    text: e,
                    fontSize: 11.5,
                    fontWeight: FontWeight.w400,
                    color: Colors.grey.shade700,
                    maxLines: 30,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
