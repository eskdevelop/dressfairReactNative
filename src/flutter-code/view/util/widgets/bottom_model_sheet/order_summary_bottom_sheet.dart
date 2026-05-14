import 'package:dress_fair_ecommmerce/controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/simple_method/simple_methode.dart';

class PriceDetailsCartBottomSheet extends StatelessWidget {
  PriceDetailsCartBottomSheet({super.key});
  final AddToCartController addToCartController = Get.find();
  final SessionController sessionController = Get.find();
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 16.w, right: 16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 15.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                AppTextWidget(
                  text: "priceDetails".tr,
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                ),
                SizedBox(width: MediaQuery.sizeOf(context).width * 0.3),
                Padding(
                  padding: EdgeInsets.only(bottom: 10.0.h),
                  child: GestureDetector(
                    onTap: () {
                      Get.back();
                    },
                    child: SvgPicture.asset(height: 16.sp, AppImages.crossIcon),
                  ),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Icon(size: 15.sp, Icons.check, color: Colors.green),
                SizedBox(width: 3.w),
                AppTextWidget(
                  text: "dressFairPurchaseProtection".tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.green,
                ),
              ],
            ),
            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 4.h),

            // Cart title with item count:
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Obx(() {
                  final selectedItems = addToCartController.cartItems
                      .where((item) => item['isSelected'] == true)
                      .toList();
                  return AppTextWidget(
                    text: "Cart (${selectedItems.length})",
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                  );
                }),
                SizedBox(width: 6.w),
                Row(
                  children: [
                    Icon(
                      Icons.error_outline,
                      color: AppColors.primaryColor,
                      size: 14.sp,
                    ),
                    SizedBox(width: 2.w),
                    AppTextWidget(
                      text: "almostSoldOut".tr,
                      fontSize: 10.sp,
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ],
                ),
              ],
            ),

            cardItem(context),

            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 10.h),

            /// Items Total:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "itemPrice".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w400,
                ),

                ///Normal Price :
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${addToCartController.selectedTotalNormalPrice.toStringAsFixed(2)}",
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
              ],
            ),

            SizedBox(height: 10.h),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "shippingCharges".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w400,
                ),
                Obx(() {
                  double shipping = addToCartController.checkShipping(
                    addToCartController.selectedTotalPrice,
                  );
                  return (shipping == 0 || shipping == 0.0 || shipping == 0.0)
                      ? AppTextWidget(
                          text: "free".tr,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w400,
                          color: Colors.green,
                        )
                      : AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode.toString()} "
                              "$shipping",
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        );
                }),
              ],
            ),

            (addToCartController.selectedDiscount == 0 ||
                    addToCartController.selectedDiscount == 0.0 ||
                    addToCartController.selectedDiscount == 0.00 ||
                    addToCartController.selectedDiscount ==
                        addToCartController.selectedTotalNormalPrice)
                ? SizedBox()
                : SizedBox(height: 10.h),

            ///Discount:
            (addToCartController.selectedDiscount == 0 ||
                    addToCartController.selectedDiscount == 0.0 ||
                    addToCartController.selectedDiscount == 0.00 ||
                    addToCartController.selectedDiscount ==
                        addToCartController.selectedTotalNormalPrice)
                ? SizedBox(height: 0)
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "itemDiscount".tr,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w400,
                      ),
                      AppTextWidget(
                        text:
                            "${sessionController.countryConfig.value?.currencyCode.toString()} "
                            "${addToCartController.selectedDiscount.toStringAsFixed(2)}",
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w400,
                        color: Colors.green,
                      ),
                    ],
                  ),

            SizedBox(height: 5.h),
            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 5.h),

            /// Total Amount:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "total".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                ),
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${addToCartController.totalWithShippingCharges.toStringAsFixed(2)}",
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primaryColor,
                ),
              ],
            ),

            SizedBox(height: 5.h),
            Text(
              "pleaseRefer".tr,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
                fontStyle: FontStyle.italic,
              ),
            ),

            SizedBox(height: 22.h),
            bottomNavWidget(context),
            SizedBox(height: 15.h),
          ],
        ),
      ),
    );
  }

  Widget bottomNavWidget(BuildContext context) {
    return Obx(() {
      return Container(
        width: MediaQuery.sizeOf(context).width,
        height: 55.h,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: AppShadows.glowBox,
          borderRadius: BorderRadius.circular(50.r),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 4.h),
                addToCartController.selectedTotalNormalPrice == 0 ||
                        addToCartController.selectedTotalNormalPrice == 0.0 ||
                        addToCartController.selectedTotalNormalPrice == 0.00 ||
                        addToCartController.selectedTotalNormalPrice ==
                            addToCartController.selectedTotalPrice
                    ? SizedBox()
                    : AnimatedLineThrough(
                        color: Colors.black,
                        duration: const Duration(milliseconds: 500),
                        isCrossed: true,
                        strokeWidth: 2.w,
                        child: AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode ?? ""}"
                              " ${addToCartController.selectedTotalNormalPrice.toString()}",
                          fontSize: 12.sp,
                          color: Colors.black.withOpacity(0.8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                Padding(
                  padding: EdgeInsets.only(
                    left: 20.0.w,
                    right: sessionController.selectedLanguageCode == "ar"
                        ? 15.w
                        : 0,
                  ),
                  child: Row(
                    children: [
                      AppTextWidget(
                        text:
                            "${sessionController.countryConfig.value?.currencyCode ?? ""}"
                            " ${addToCartController.totalWithShippingCharges.toStringAsFixed(2)}",
                        fontSize: 15.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primaryColor,
                      ),
                      Obx(
                        () => GestureDetector(
                          onTap: () {
                            addToCartController.isShowBottomSheet.value =
                                !addToCartController.isShowBottomSheet.value;
                            Get.back();
                          },
                          child: Padding(
                            padding: EdgeInsets.only(top: 2.0.h),
                            child: Icon(
                              addToCartController.isShowBottomSheet.value
                                  ? Icons.keyboard_arrow_down_sharp
                                  : Icons.keyboard_arrow_up,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 4.h),
              ],
            ),
            Padding(
              padding: EdgeInsets.only(
                right: 8.0.w,
                left: 8.0.w,
                bottom: 5.h,
                top: 5.h,
              ),
              child: AppButton(
                width: MediaQuery.sizeOf(context).width * 0.4,
                height: 40.h,
                onTap: () {
                  Get.back();
                  if (!addToCartController.hasSelectedItems) {
                    AppToast.showError("pleaseSelect".tr);
                    return;
                  }
                  if (addToCartController.cartItems.isEmpty) {
                    AppToast.showError("pleaseAddAtToCartFirst".tr);
                    return;
                  }
                  Get.toNamed(
                    checkOutScreen,
                    arguments: addToCartController.cartItems,
                  );
                },
                textStyle: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
                borderRadius: 40.r,
                isLoading: false.obs,
                text: "checkOut".tr,
              ),
            ),
          ],
        ),
      );
      //  );
    });
  }

  static Widget priceRow(
    String label,
    String value, {
    bool isDiscount = false,
    bool isTotal = false,
    bool isBold = false,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          AppTextWidget(
            text: label,
            fontSize: 13.sp,
            fontWeight: FontWeight.w500,
          ),
          AppTextWidget(
            text: value,
            fontSize: 13.sp,
            fontWeight: FontWeight.w500,
            color: isDiscount
                ? Colors.green
                : isTotal
                ? AppColors.primaryColor
                : Colors.black,
          ),
        ],
      ),
    );
  }

  Widget cardItem(BuildContext context) {
    return Obx(() {
      // 🔥 FILTER ONLY SELECTED ITEMS:
      final selectedItems = addToCartController.cartItems
          .where((item) => item['isSelected'] == true)
          .toList();

      return Visibility(
        visible: selectedItems.isNotEmpty,
        child: SizedBox(
          height: 107.h,
          //color: Colors.red,
          width: MediaQuery.sizeOf(context).width,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: selectedItems.length,
            itemBuilder: (context, index) {
              final item = selectedItems[index];
              return Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 5.0.w,
                  vertical: 5.0.h,
                ),
                child: Column(
                  children: [
                    // Image container with fixed size
                    Container(
                      height: 70.h,
                      width: 70.w,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          // Image
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8.r),
                            child: CachedNetworkImage(
                              height: 70.h,
                              width: 70.w,
                              imageUrl:
                                  "${SimpleMethode.imageUrl}/${item['image']}",
                              fit: BoxFit.cover,
                              errorWidget: (context, url, error) => Container(
                                color: Colors.grey[200],
                                child: const Icon(
                                  Icons.image,
                                  color: Colors.grey,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            left: 0,
                            right: 0,
                            child: Container(
                              height: 10.h,
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(5.r),
                              ),
                            ),
                          ),
                          // "Almost Sold Out" badge - Bottom Center:
                          Positioned(
                            bottom: 2.h,
                            left: 0,
                            right: 0,
                            child: Center(
                              child: Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 2.w,
                                  vertical: 4.h,
                                ),
                                margin: EdgeInsets.symmetric(horizontal: 3.w),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.5),
                                  borderRadius: BorderRadius.circular(1.r),
                                ),
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: AppTextWidget(
                                    text: "almostSoldOut".tr,
                                    color: Colors.white,
                                    fontSize: 6.sp,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 6.h),

                    /// Price
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 4.w,
                        vertical: 2.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: AppTextWidget(
                        text:
                            "${Get.find<SessionController>().countryConfig.value?.currencyCode} "
                            "${(item['price'] as num).toDouble().toStringAsFixed(2)}",
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      );
    });
  }
}
