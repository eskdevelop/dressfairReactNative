import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/price_extention.dart';

import '../../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class ProductDetailsBottomNavBar extends StatelessWidget {
  ProductDetailsBottomNavBar({super.key});
  ProductDetailController productDetailController =
      Get.find<ProductDetailController>();
  AddToCartController addToCartController = Get.find<AddToCartController>();
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (productDetailController.isLoading.value) return SizedBox();

      ///
      log(
        "Selected Color ==  == ${productDetailController.productDetail.value?.productColors.length}",
      );
      log(
        "Selected Color Index == ${productDetailController.selectedColorIndex}",
      );
      final productId =
          productDetailController.productDetail.value?.productId ?? 0;

      final qty = addToCartController.getQuantityByProduct(
        productId: productId,
        size: productDetailController.selectedSize.value,
        color: productDetailController
            .productDetail
            .value
            ?.productColors[productDetailController.selectedColorIndex.value]
            .color,
      );
      log("Quantity == $qty");

      ///
      //  if (!productDetailController.isFirstTimeOnDetailPage.value) {
      if (qty != 0) {
        return Padding(
          padding: EdgeInsets.only(bottom: 10.h, top: 10.h),
          child: SizedBox(
            height: 50.h,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Container(
                  width: 120.w,
                  height: 45.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(60.r),
                    border: Border.all(color: Colors.black, width: 1.w),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // ➖ Minus button
                      InkWell(
                        onTap: () {
                          addToCartController.decreaseQuantityOnly(
                            productId: productDetailController
                                .productDetail
                                .value!
                                .productId,
                          );
                          //showCartBottomSheet(context);
                        },
                        child: Icon(
                          Icons.remove,
                          size: 22.sp,
                          color: Colors.black87,
                        ),
                      ),
                      16.w.sw,
                      // 🔥 Quantity text (reactive):
                      Obx(() {
                        final productId =
                            productDetailController
                                .productDetail
                                .value
                                ?.productId ??
                            0;

                        final qty = addToCartController.getQuantityByProduct(
                          productId: productId,
                          size: productDetailController.selectedSize.value,
                          color: productDetailController
                              .productDetail
                              .value
                              ?.productColors[productDetailController
                                  .selectedColorIndex
                                  .value]
                              .color,
                        );

                        return AppTextWidget(
                          text: qty == 0 ? "0" : qty.toString(),
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                        );
                      }),
                      16.w.sw,
                      // ➕ Plus button:
                      InkWell(
                        onTap: () {
                          final product =
                              productDetailController.productDetail.value!;
                          final price =
                              product.prices[productDetailController
                                  .selectedPriceIndex
                                  .value];
                          log("Normal Price == ${price.strikePriceText}");
                          log("discount Price == ${price.discountAmount}");
                          log("Sales Price == ${price.salePrice}");
                          addToCartController.addToCartPlus(
                            productId: product.productId,
                            name: product.name,
                            nameAr: product.nameAr,
                            image: product.images.first.image,
                            price: price.finalPrice,
                            normalPrice: price.strikePriceText ?? "",
                            discountPrice: price.discountAmount ?? 0.0,
                            discountPercent: price.discountPercent,
                            quantity: productDetailController.quantity.value,
                            size: productDetailController.selectedSize.value,
                            color: product
                                .productColors[productDetailController
                                    .selectedColorIndex
                                    .value]
                                .color,
                            sku: product.sku,
                            optionId:
                                productDetailController
                                        .productDetail
                                        .value
                                        ?.options
                                        .length ==
                                    1
                                ? productDetailController
                                          .productDetail
                                          .value
                                          ?.options
                                          .first
                                          .productOptionId ??
                                      0
                                : productDetailController
                                      .selectedSizeProductId
                                      .value,
                            priceList:
                                product.prices.map((price) {
                                  return {
                                    'quantity': price.quantity,
                                    'normal_price': price.normalPrice,
                                    'offer_price': price.finalPrice,
                                    'promotional_content_en': "",
                                    'promotional_content_ar': "",
                                    'has_bundle': price.hasBundle,
                                  };
                                }).toList() ??
                                [],
                            isSelected: true,
                          );
                          for (var e in product.prices) {
                            log("quantity == ${e.quantity}");
                            log("Offer Price == ${e.finalPrice}");
                          }

                          // showCartBottomSheet(context);
                        },
                        child: Icon(
                          Icons.add,
                          size: 22.sp,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ),
                16.w.sw,
                AppButton(
                  width: 200.w,
                  height: 50.h,
                  onTap: addToCartController.isLoading.value
                      ? () {
                          AppToast.showInfo(AppText.loadingAddToCart);
                        }
                      : () {
                          productDetailController.quantity.value = 1;
                          Get.toNamed(cartScreen);
                        },
                  textStyle: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                  borderRadius: 50.r,
                  isLoading: addToCartController.isLoading,
                  text: AppText.goToCart,
                ),
              ],
            ),
          ),
        );
      }

      return Padding(
        padding: EdgeInsets.only(
          left: 12.w,
          right: 12.w,
          bottom: 8.h,
          top: 6.h,
        ),
        child: AppButton(
          width: 200.w,
          height: 50.h,
          onTap: () {
            final product = productDetailController.productDetail.value!;
            final price = product
                .prices[productDetailController.selectedPriceIndex.value];
            for (var e in product.prices) {
              log("Product QUantity ==${e.quantity.toString()}");
              log("Product Prices is ==${e.normalPrice}");
            }
            addToCartController.addToCart(
              productId: product.productId,
              productGroupId:
                  productDetailController.productDetail.value?.productGroupId ??
                  0,
              name: product.name,
              nameAr: product.nameAr,
              image: product.images.first.image,
              price: productDetailController
                  .productDetail
                  .value!
                  .prices[productDetailController.selectedPriceIndex.value]
                  .finalPrice,
              normalPrice: price.strikePriceText ?? "",
              discountPrice: price.discountAmount ?? 0.0,
              discountPercent: price.discountPercent,
              quantity: productDetailController
                  .productDetail
                  .value!
                  .prices[productDetailController.selectedPriceIndex.value]
                  .quantity,

              size: productDetailController.selectedSize.value,
              color: product
                  .productColors[productDetailController
                      .selectedColorIndex
                      .value]
                  .color,
              sku: product.sku,
              optionId: productDetailController.selectedSizeProductId.value,
              priceList:
                  product.prices.map((price) {
                    return {
                      'quantity': price.quantity,
                      'normal_price': price.normalPrice,
                      'offer_price': price.finalPrice,
                      'promotional_content_en': "",
                      'promotional_content_ar': "",
                      'has_bundle': price.hasBundle,
                    };
                  }).toList() ??
                  [],
              isSelected: true,
              //options[productDetailController.selectedSize.value].,
            );
          },

          textStyle: TextStyle(color: Colors.white),
          borderRadius: 50.r,
          isLoading: addToCartController.isLoading,
          text: AppText.addToCart,
        ),
      );
    });
  }
}
