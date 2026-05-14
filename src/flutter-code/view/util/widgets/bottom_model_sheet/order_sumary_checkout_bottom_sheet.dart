import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:flutter/gestures.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../../controller/simple_method/simple_methode.dart';

class PriceDetailsCheckoutBottomSheet extends StatelessWidget {
  PriceDetailsCheckoutBottomSheet({super.key});
  final AddToCartController addToCartController = Get.find();
  final SessionController sessionController = Get.find();
  final GetProfileController getProfileController = Get.find();
  final SubmitOrderController submitOrderController = Get.put(
    SubmitOrderController(),
  );
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
            addToCartController.selectedTotalNormalPrice == 0 ||
                    addToCartController.selectedTotalNormalPrice == 0.0 ||
                    addToCartController.selectedTotalNormalPrice == 0.00 ||
                    addToCartController.selectedTotalNormalPrice ==
                        addToCartController.selectedTotalPrice
                ? SizedBox()
                : SizedBox(height: 10.h),

            /// Items Total:
            addToCartController.selectedTotalNormalPrice == 0 ||
                    addToCartController.selectedTotalNormalPrice == 0.0 ||
                    addToCartController.selectedTotalNormalPrice == 0.00 ||
                    addToCartController.selectedTotalNormalPrice ==
                        addToCartController.selectedTotalPrice
                ? SizedBox()
                : Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "itemTotal".tr,
                        fontSize: 13.sp,
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
                              "${addToCartController.selectedTotalNormalPrice.toString()}",
                          fontSize: 13.sp,
                          color: Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
            addToCartController.selectedDiscount == 0 ||
                    addToCartController.selectedDiscount == 0.0 ||
                    addToCartController.selectedDiscount == 0.00
                ? SizedBox()
                : SizedBox(height: 10.h),

            ///Discount:
            addToCartController.selectedDiscount == 0 ||
                    addToCartController.selectedDiscount == 0.0 ||
                    addToCartController.selectedDiscount == 0.00
                ? SizedBox()
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
                            "-${sessionController.countryConfig.value?.currencyCode.toString()} "
                            "${addToCartController.selectedDiscount.toStringAsFixed(2)}",
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w400,
                        color: Colors.green,
                      ),
                    ],
                  ),
            SizedBox(height: 10.h),

            /// Sub Total Amount:
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text:
                      addToCartController.selectedTotalNormalPrice == 0 ||
                          addToCartController.selectedTotalNormalPrice == 0.0 ||
                          addToCartController.selectedTotalNormalPrice ==
                              0.00 ||
                          addToCartController.selectedTotalNormalPrice ==
                              addToCartController.selectedTotalPrice
                      ? "total".tr
                      : "subTotal".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${addToCartController.selectedTotalPrice.toStringAsFixed(2)}",
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                  color: AppColors.primaryColor,
                ),
              ],
            ),
            Divider(thickness: 0.5, height: 12.h),
            SizedBox(height: 5.h),

            /// Shipping
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: "shipping".tr,
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                ),
                Obx(() {
                  double shipping = addToCartController.checkShipping(
                    addToCartController.selectedTotalPrice,
                  );
                  return (shipping == 0 || shipping == 0.0 || shipping == 0.00)
                      ? AppTextWidget(
                          text: "free".tr,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.green,
                        )
                      : AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode.toString()} "
                              "${sessionController.countryConfig.value?.shippingAmount.toString()}",
                          fontSize: 13.sp,
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
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
                AppTextWidget(
                  text:
                      "${sessionController.countryConfig.value?.currencyCode.toString()} "
                      "${addToCartController.totalWithShippingCharges.toStringAsFixed(2)}",
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
              ],
            ),
            SizedBox(height: 8.h),
            bottomText(() {}, () {}, context),

            SizedBox(height: 26.h),
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
                  if (sessionController.isUserLoginIn.value) {
                    final body = buildPlaceOrderBody();
                    submitOrderController.confirmOrderPostReq(body: body);
                  } else {
                    AppToast.showError("pleaseLoginFirst".tr);
                  }
                },
                textStyle: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
                borderRadius: 40.r,
                isLoading: submitOrderController.isLoading,
                text: AppText.submitOrder,
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
          height: 108.h,
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
                    /// Image container with fixed size:
                    Container(
                      height: 70.h,
                      width: 70.w,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.1),
                            blurRadius: 4.r,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          // Image
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
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

                          // Gradient overlay at bottom for better text visibility
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

                          // "Almost Sold Out" badge - Bottom Center
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
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    SizedBox(
                                      // color: Colors.red,
                                      width: 50.w,
                                      child: AppTextWidget(
                                        text: "almostSoldOut".tr,
                                        color: Colors.white,
                                        fontSize: 6.sp,
                                        fontWeight: FontWeight.w700,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 6.h),

                    // Price
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 4.w,
                        vertical: 2.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(4),
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

  ///Bottom Text:
  Widget bottomText(
    final VoidCallback? onTermsTap,
    final VoidCallback? onPrivacyTap,
    BuildContext context,
  ) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w400,
              color: AppColors.blackColor.withOpacity(0.5),
            ),
            children: [
              TextSpan(text: "bySubmittingToOur".tr),
              TextSpan(
                text: "termOfUse".tr,
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w500,
                  fontSize: 12.sp,
                ),
                recognizer: TapGestureRecognizer()..onTap = onTermsTap,
              ),
              TextSpan(text: " ${AppText.and} "),
              TextSpan(
                text: "privacyPolicy".tr,
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w500,
                  fontSize: 12.sp,
                ),
                recognizer: TapGestureRecognizer()..onTap = onPrivacyTap,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Map<String, dynamic> buildPlaceOrderBody() {
    final address = getProfileController.hasDefaultAddress.value;

    final double shippingCharges = addToCartController.checkShipping(
      addToCartController.selectedTotalPrice,
    );

    final double totalPrice =
        addToCartController.selectedTotalPrice + shippingCharges;

    /// Build products array:
    final products = addToCartController.cartItems
        .where((item) => item['isSelected'] == true)
        .map((item) {
          log("Product Sku == ${item['sku'] ?? ""}");
          return {
            "product_id": item['productId'],
            "product_option_id": item['optionId'] ?? 0,
            "product_option_label": item['size'] ?? "",
            "product_option_color": item['color'] ?? "",
            "product_name": item['name'],
            "product_quantity": item['quantity'],
            "product_sku": item['sku'] ?? "",
            "product_price": item['price'],
          };
        })
        .toList();

    return {
      "customer_name":
          "${getProfileController.customerProfile.value?.firstname ?? ""} ${getProfileController.customerProfile.value?.lastname ?? ""}",
      "customer_email":
          getProfileController.customerProfile.value?.email ?? "", // optional
      "customer_mobile":
          getProfileController.customerProfile.value?.mobile ?? "",
      "customer_city_id": address?.cityId ?? "",
      "customer_area_id": address?.cityAreaId ?? "",
      "customer_city_name": address?.city?.name ?? "",
      "customer_area_name": address?.area?.name ?? "",
      "customer_address": address?.address ?? "",
      "products": products,
      "shipping_charges": shippingCharges,
      "source": "theme5",
      "total_price": totalPrice,
    };
  }
}
