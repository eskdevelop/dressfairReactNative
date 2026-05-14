import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_static_text/delivery_gurantee_static_text.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

Widget deliveryQuarantee({
  required IconData icon,
  required String title,
  required String subtitle,
  required BuildContext context,
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
        SizedBox(
          width: MediaQuery.sizeOf(context).width,
          child: SingleChildScrollView(
            child: Row(
              children: [
                AppTextWidget(
                  text: "2To4DaysDelivery".tr,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black.withOpacity(0.7),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                38.w.sw,
                SizedBox(
                  width: MediaQuery.sizeOf(context).width * 0.5,
                  //color: Colors.green,
                  child: AppTextWidget(
                    text: "20DaysNoDeliveryRefund".tr,
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w400,
                    color: Colors.black.withOpacity(0.7),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 4.h),

        SizedBox(
          // color: Colors.red,
          width: MediaQuery.sizeOf(context).width,
          child: SingleChildScrollView(
            child: Row(
              children: [
                AppTextWidget(
                  text: "returnDamagedItem".tr,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black.withOpacity(0.7),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                7.w.sw,
                AppTextWidget(
                  text: "10daysNoUpdateRefund".tr,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black.withOpacity(0.7),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
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
                overflow: TextOverflow.ellipsis,
                maxLines: 1,
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
