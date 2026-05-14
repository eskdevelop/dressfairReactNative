import '../../../../util/widgets/routes/screens_library.dart';

class ShippingInfo extends StatelessWidget {
  const ShippingInfo({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _infoTile(
          icon: Icons.local_shipping,
          title: "fastShipping".tr,
          subtitle: "normallyDeliveredIn2Or3Days".tr,
        ),
        Divider(color: Colors.grey.shade300, thickness: 1),
        _infoTile(
          icon: Icons.local_fire_department,
          title: "freeShipping".tr,
          subtitle: "freeShippingOverShopping150AED".tr,
        ),
        Divider(color: Colors.grey.shade300, thickness: 1),
        _infoTile(
          icon: Icons.attach_money, // money icon
          title: "cashOnDelivery".tr,
          subtitle: "payWhenYouReceiveYourOrder".tr,
        ),
        Divider(color: Colors.grey.shade300, thickness: 1),
      ],
    );
  }

  Widget _infoTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.0.w),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primaryColor, size: 25.sp),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextWidget(
                  text: title,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryColor,
                ),
                SizedBox(height: 4.h),
                AppTextWidget(
                  text: subtitle,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.normal,
                  color: Colors.grey.shade700,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
