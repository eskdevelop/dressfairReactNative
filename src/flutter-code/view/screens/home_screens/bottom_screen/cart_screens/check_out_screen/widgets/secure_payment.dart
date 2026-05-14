//Secure Payment :
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_static_text/delivery_gurantee_static_text.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

Widget securePayment({
  required IconData icon,
  required String title,
  required String subtitle,
}) {
  return Padding(
    padding: EdgeInsets.symmetric(horizontal: 10.0.w),
    child: Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: AppColors.primaryColor, size: 20.sp),
            SizedBox(width: 6.w),
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
                ],
              ),
            ),
          ],
        ),
        SizedBox(height: 8.h),
        AppTextWidget(
          text: subtitle,
          fontSize: 11.sp,
          fontWeight: FontWeight.w400,
          maxLines: 9,
          color: Colors.black.withOpacity(0.7),
        ),
        7.h.sh,
        GestureDetector(
          onTap: () {
            Get.to(DeliveryGuaranteeScreen());
          },
          child: Row(
            children: [
              AppTextWidget(
                text: "learnMore".tr,
                fontSize: 11.sp,
                fontWeight: FontWeight.normal,
                color: Colors.black.withOpacity(0.5),
              ),
              5.w.sw,
              Icon(
                Icons.arrow_forward_ios,
                size: 12.sp,
                color: Colors.black.withOpacity(0.5),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}
