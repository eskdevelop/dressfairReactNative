import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

Widget shippingFee() {
  return Padding(
    padding: EdgeInsets.only(left: 10.0.w),
    child: Container(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextWidget(
            text: "shippingFree".tr,
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryColor,
          ),
          8.h.sh,
          AppTextWidget(
            text: "deliveryBusinessDays".tr,
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            color: Colors.black.withOpacity(0.8),
          ),
          3.h.sh,
          AppTextWidget(
            text: "getACreditForLateDelivery".tr,
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            color: Colors.black.withOpacity(0.6),
          ),
          3.h.sh,
          AppTextWidget(
            text: "courierCompany".tr,
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            color: Colors.black.withOpacity(0.6),
          ),
        ],
      ),
    ),
  );
}
