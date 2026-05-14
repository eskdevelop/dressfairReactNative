import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class OrderSummaryWidget extends StatelessWidget {
  OrderSummaryWidget({super.key});
  AddToCartController getAddToCartController = Get.find<AddToCartController>();
  SessionController sessionController = Get.find<SessionController>();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: Obx(() {
        final selectedCount = getAddToCartController.cartItems
            .where((item) => item['isSelected'] == true)
            .length;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// Items Total:
            getAddToCartController.selectedTotalNormalPrice == 0 ||
                    getAddToCartController.selectedTotalNormalPrice == 0.0 ||
                    getAddToCartController.selectedTotalNormalPrice == 0.00 ||
                    getAddToCartController.selectedTotalNormalPrice ==
                        getAddToCartController.selectedTotalPrice
                ? SizedBox()
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "itemTotal".tr,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                      ),
                      AnimatedLineThrough(
                        color: Colors.grey.shade500,
                        duration: const Duration(milliseconds: 500),
                        isCrossed: true,
                        strokeWidth: 2,
                        child: AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode.toString()} "
                              "${getAddToCartController.selectedTotalNormalPrice.toString()}",
                          fontSize: 12.sp,
                          color: Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
            getAddToCartController.selectedTotalNormalPrice == 0 ||
                    getAddToCartController.selectedTotalNormalPrice == 0.0 ||
                    getAddToCartController.selectedTotalNormalPrice == 0.00 ||
                    getAddToCartController.selectedTotalNormalPrice ==
                        getAddToCartController.selectedTotalPrice
                ? SizedBox()
                : SizedBox(height: 10.h),

            ///Discount:
            getAddToCartController.selectedDiscount == 0 ||
                    getAddToCartController.selectedDiscount == 0.0 ||
                    getAddToCartController.selectedDiscount == 0.0
                ? SizedBox()
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "itemDiscount".tr,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                      ),
                      AppTextWidget(
                        text:
                            "-${sessionController.countryConfig.value?.currencyCode.toString()} "
                            "${getAddToCartController.selectedDiscount.toStringAsFixed(2)}",
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                        color: Colors.green,
                      ),
                    ],
                  ),
            getAddToCartController.selectedDiscount == 0 ||
                    getAddToCartController.selectedDiscount == 0.0 ||
                    getAddToCartController.selectedDiscount == 0.00
                ? SizedBox()
                : SizedBox(height: 10.h),

            /// Sub Total Amount:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text:
                      getAddToCartController.selectedTotalPrice == 0 ||
                          getAddToCartController.selectedTotalPrice == 0.0 ||
                          getAddToCartController.selectedTotalPrice == 0.00 ||
                          getAddToCartController.selectedTotalPrice ==
                              getAddToCartController.selectedTotalNormalPrice
                      ? "total".tr
                      : "subTotal".tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${getAddToCartController.selectedTotalPrice.toStringAsFixed(2)}",
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primaryColor,
                ),
              ],
            ),
            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 5.h),

            /// Shipping:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "shipping".tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                ),
                Obx(() {
                  double shipping = getAddToCartController.checkShipping(
                    getAddToCartController.selectedTotalPrice,
                  );
                  return (shipping == 0 || shipping == 0.0 || shipping == 0.00)
                      ? AppTextWidget(
                          text: "free".tr,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w400,
                          color: Colors.green,
                        )
                      : AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode.toString()} "
                              "${shipping.toString()}",
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        );
                }),
              ],
            ),
            SizedBox(height: 5.h),
            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 5.h),

            /// Total Amount with Shipping Charges With Tax:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "orderTotal".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${getAddToCartController.totalWithShippingCharges.toStringAsFixed(2)}",
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
              ],
            ),
          ],
        );
      }),
    );
  }
}
