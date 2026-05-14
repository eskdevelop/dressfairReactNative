import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/home_controller/home_controller.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/price_extention.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shimer_effect/product_detail_shimmer_effect.dart';

import '../../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import '../../../../../model/detail_category_model/detail_category_model.dart';
import '../../routes/screens_library.dart';

class AddToCartBottomSheet {
  static show(
    BuildContext context, {
    required String cateSlug,
    required int categoryId,
    required double fakeRating,
    required int fakeReviews,
    bool isCart = false,
    // required bool isColorAndSize,
  }) {
    final ProductDetailController productDetailController = Get.put(
      ProductDetailController(),
    );
    final SessionController sessionController = Get.find<SessionController>();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      productDetailController.quantity.value = 1;
      productDetailController.isSizeFirstTime.value = true;
      productDetailController.selectedSize.value = "0";
      productDetailController.selectedProductOptionId.value = 0;
      productDetailController.selectedOptionValueId.value = 0;
      await productDetailController.getProductsDetail(
        cateSlug: cateSlug,
        page: 1,
      );
    });
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            padding: EdgeInsets.only(left: 16.w, right: 16.w, top: 6.h),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(12.r)),
            ),
            child: Obx(() {
              if (productDetailController.isLoadingProductDetail.value) {
                return AddToCartShimmerDialog();
              }

              final product = productDetailController.productDetail.value;
              final products = product?.options;

              ProductOptionNew? selectedProduct;
              if (products != null && products.isNotEmpty) {
                selectedProduct = products.first;
              }

              return SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    /// HEADER
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (product?.images.isNotEmpty ?? false)
                          Container(
                            width: 66.w,
                            height: 66.h,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12.r),
                              color: Colors.grey.shade100,
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(2.r),
                              child: CachedNetworkImage(
                                imageUrl:
                                    "${SimpleMethode.imageUrl}/${product!.images.first.image}",
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        8.w.sw,
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: AppTextWidget(
                                      text:
                                          sessionController
                                                  .selectedLanguageCode ==
                                              "ar"
                                          ? product?.nameAr ?? ""
                                          : product?.name ?? "",
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w500,
                                      maxLines: 1,
                                    ),
                                  ),
                                  GestureDetector(
                                    onTap: () => Navigator.pop(context),
                                    child: SvgPicture.asset(
                                      AppImages.crossIcon,
                                      height: 14.h,
                                    ),
                                  ),
                                ],
                              ),
                              if ((int.tryParse(
                                        product?.availableQty.toString() ?? '0',
                                      ) ??
                                      0) <=
                                  15) ...[
                                AppTextWidget(
                                  text: "onlyLeft".trParams({
                                    "count":
                                        "${int.tryParse(product?.availableQty.toString() ?? '0') ?? 0}",
                                  }),
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w500,
                                ),
                                SizedBox(height: 2.h),
                              ],
                              Padding(
                                padding: EdgeInsets.symmetric(horizontal: 0.w),
                                child: Row(
                                  children: [
                                    /// Rating:
                                    Padding(
                                      padding: EdgeInsets.only(
                                        left: 1.0.w,
                                        right:
                                            sessionController
                                                    .selectedLanguageCode ==
                                                "ar"
                                            ? 4.w
                                            : 0.w,
                                      ),
                                      child: Row(
                                        children: List.generate(5, (index) {
                                          if (4.5 >= index + 1) {
                                            return Icon(
                                              Icons.star,
                                              color: Colors.black,
                                              size: 12.sp,
                                            );
                                          } else if (4.5 > index &&
                                              4.5 < index + 1) {
                                            return Icon(
                                              Icons.star_half,
                                              color: Colors.black,
                                              size: 12.sp,
                                            );
                                          } else {
                                            return Icon(
                                              Icons.star_border,
                                              color: Colors.grey,
                                              size: 12.sp,
                                            );
                                          }
                                        }),
                                      ),
                                    ),
                                    4.w.sw,
                                    Padding(
                                      padding: EdgeInsets.only(
                                        right:
                                            sessionController
                                                    .selectedLanguageCode ==
                                                "ar"
                                            ? 4.w
                                            : 0.w,
                                      ),
                                      child: AppTextWidget(
                                        text: 4.toStringAsFixed(1),
                                        fontSize: 10.sp,
                                        maxLines: 1,
                                      ),
                                    ),
                                    4.w.sw,
                                    AppTextWidget(
                                      text: "(${4})",
                                      fontSize: 10.sp,
                                      maxLines: 1,
                                    ),
                                  ],
                                ),
                              ),
                              AppTextWidget(
                                text:
                                    '${product?.currencyCode} ${product?.displayPrice.toStringAsFixed(2)}',
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w400,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    Divider(color: Colors.black.withOpacity(0.1)),

                    /// COLORS
                    Obx(
                      () => Visibility(
                        visible:
                            (productDetailController
                                    .productDetail
                                    .value
                                    ?.productColors !=
                                null &&
                            productDetailController
                                .productDetail
                                .value!
                                .productColors
                                .isNotEmpty &&
                            productDetailController
                                    .productDetail
                                    .value!
                                    .productColors
                                    .length >=
                                2),
                        child: dressColors(categoryId),
                      ),
                    ),
                    1.h.sh,

                    /// SIZES
                    Visibility(
                      visible:
                          (productDetailController
                                  .productDetail
                                  .value
                                  ?.options !=
                              null &&
                          productDetailController
                              .productDetail
                              .value!
                              .options
                              .isNotEmpty &&
                          productDetailController
                                  .productDetail
                                  .value!
                                  .options
                                  .length >=
                              2),
                      child: _buildSizesSection(productDetailController),
                    ),

                    8.h.sh,

                    /// PRICE BUNDLES
                    if (product != null) priceBundleSection(product, context),

                    20.h.sh,

                    /// ADD TO CART BUTTON:
                    _buildAddToCart1(context),

                    25.h.sh,
                  ],
                ),
              );
            }),
          ),
        );
      },
    );
  }

  static String calculateDiscountPercentage(
    String originalPrice,
    String discountPrice,
  ) {
    try {
      final original = double.parse(originalPrice);
      final discount = double.parse(discountPrice);
      final percentage = ((original - discount) / original * 100).round();
      return '-$percentage%';
    } catch (e) {
      return '-0%';
    }
  }

  static Widget _buildSizesSection(
    ProductDetailController productDetailController,
  ) {
    return Obx(() {
      final sizes = productDetailController.productDetail.value?.options;
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextWidget(
            text: "sizes".tr,
            fontSize: 13.sp,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
          4.h.sh,
          if (sizes != null && sizes.isNotEmpty) ...[
            Wrap(
              spacing: 6.w, // horizontal gap
              runSpacing: 6.h, // vertical gap
              children: sizes.map((size) {
                final isSelected =
                    productDetailController.selectedSize.value == size.label;

                return GestureDetector(
                  onTap: () {
                    productDetailController.selectedSize.value = size.label;
                    productDetailController.selectedOptionValueId.value =
                        size.productOptionId ?? 0;
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 5.w,
                      vertical: 3.h,
                    ), // auto size by text
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primaryColor
                            : Colors.grey.shade400,
                        width: 1.w,
                      ),
                      borderRadius: BorderRadius.circular(6.r),
                      color: isSelected
                          ? AppColors.primaryColor.withOpacity(0.12)
                          : Colors.transparent,
                    ),
                    child: AppTextWidget(
                      text: size.label, // S, M, L, XL, XXL
                      fontSize: 7.5.sp, // 🔹 smaller text
                      fontWeight: FontWeight.w500,
                      color: isSelected ? AppColors.primaryColor : Colors.black,
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          Column(
            children: [
              productDetailController.isSizeFirstTime.value
                  ? SizedBox()
                  : 8.h.sh,

              productDetailController.isSizeFirstTime.value
                  ? SizedBox()
                  : Visibility(
                      visible:
                          productDetailController.selectedSize.value == "0" ||
                          productDetailController.selectedSize.value.isEmpty,
                      child: AppTextWidget(
                        text: "noSizeSelected".tr,
                        color: Colors.red,
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
            ],
          ),
          // }),
        ],
      );
    });
  }

  static Widget _buildAddToCart1(BuildContext context) {
    ProductDetailController productDetailController =
        Get.find<ProductDetailController>();
    BottomNavController bottomNavController = Get.find<BottomNavController>();

    AddToCartController addToCartController = Get.find<AddToCartController>();
    return Obx(() {
      if (productDetailController.isLoading.value) return SizedBox();
      final colors =
          productDetailController.productDetail.value?.productColors ?? [];
      final safeColorIndex =
          productDetailController.selectedColorIndex.value < colors.length
          ? productDetailController.selectedColorIndex.value
          : 0;
      final selectedColor = colors.isNotEmpty
          ? colors[safeColorIndex].color
          : '';

      ///
      final productId =
          productDetailController.productDetail.value?.productId ?? 0;
      final qty = addToCartController.getQuantityByProduct(
        productId: productId,
        size: productDetailController.selectedSize.value,
        color: selectedColor,
      );
      log("Quantity == $qty");
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
                      /// ➖ Minus button:
                      InkWell(
                        onTap: () {
                          addToCartController.decreaseQuantityOnly(
                            productId: productDetailController
                                .productDetail
                                .value!
                                .productId,
                          );
                        },
                        child: Icon(
                          Icons.remove,
                          size: 22.sp,
                          color: Colors.black87,
                        ),
                      ),
                      16.w.sw,

                      /// 🔥 Quantity text (reactive)
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

                      /// ➕ Plus button:
                      InkWell(
                        onTap: () {
                          /// Plus Button :

                          final product =
                              productDetailController.productDetail.value!;
                          final price =
                              product.prices[productDetailController
                                  .selectedPriceIndex
                                  .value];

                          addToCartController.addToCartPlus(
                            productId: product.productId,
                            name: product.name,
                            nameAr: product.nameAr,
                            image: product.images.first.image,
                            price: price.finalPrice,
                            normalPrice: price.strikePriceText ?? "",
                            discountPrice: price.discountAmount,
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
                6.w.sw,
                AppButton(
                  width: 200.w,
                  height: 50.h,
                  onTap: addToCartController.isLoading.value
                      ? () {
                          AppToast.showInfo(AppText.loadingAddToCart);
                        }
                      : () {
                          log("Tapped pppp");
                          productDetailController.quantity.value = 1;
                          log(
                            "Current Index == ${bottomNavController.currentIndex.value}",
                          );
                          Get.offNamed(cartScreen);
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
        child: Center(
          child: AppButton(
            width: Get.width,
            height: 50.h,
            onTap: () {
              final product = productDetailController.productDetail.value;
              final price = product
                  ?.prices[productDetailController.selectedPriceIndex.value];
              product?.prices.forEach((e) {
                log("Product Quantity ==${e.quantity.toString()}");
                log("Product Prices is ==${e.normalPrice}");
              });

              /// Add to cart:
              addToCartController.addToCart(
                productId: product?.productId ?? 0,
                productGroupId: product?.productGroupId ?? 0,
                name: product?.name ?? "",
                nameAr: product?.nameAr ?? "",
                image: product?.images.first.image ?? "",
                price: productDetailController
                    .productDetail
                    .value!
                    .prices[productDetailController.selectedPriceIndex.value]
                    .finalPrice,
                normalPrice: price?.strikePriceText ?? "",
                discountPrice: price?.discountAmount ?? 0.0,
                discountPercent: price?.discountPercent ?? 0,
                quantity: productDetailController
                    .productDetail
                    .value!
                    .prices[productDetailController.selectedPriceIndex.value]
                    .quantity,
                size: productDetailController.selectedSize.value,
                color:
                    product
                        ?.productColors[productDetailController
                            .selectedColorIndex
                            .value]
                        .color ??
                    "",
                sku: product?.sku ?? "",
                optionId: productDetailController.selectedSizeProductId.value,
                priceList:
                    product?.prices.map((price) {
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
              //showCartBottomSheet(context);
            },

            textStyle: TextStyle(color: Colors.white),
            borderRadius: 50.r,
            isLoading: addToCartController.isLoading,
            text: AppText.addToCart,
          ),
        ),
      );
    });
  }

  static Widget dressColors(int categoryId) {
    final ProductDetailController productDetailController = Get.put(
      ProductDetailController(),
    );
    return Obx(() {
      final products =
          productDetailController.productDetail.value?.productColors;
      if (products == null || products.isEmpty || products.length <= 1) {
        return const SizedBox();
      }
      return SizedBox(
        height: 82.h,
        // color: Colors.grey,
        child: ListView.builder(
          padding: EdgeInsets.zero,
          scrollDirection: Axis.horizontal,
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            final imageUrl = product.image;
            final isSelected =
                productDetailController.selectedColorSku.value == product.sku;
            return GestureDetector(
              onTap: () async {
                // Mark the tapped SKU as selected and loading:
                productDetailController.selectedColorSku.value = product.sku;
                productDetailController.loadingSku.value = product.sku;
                // Fetch variant details:
                await productDetailController.getProductsDetail(
                  cateSlug: product.sku,
                  page: 1,
                  fromVariant: true,
                );

                // Stop loader for this SKU
                productDetailController.loadingSku.value = '';
              },
              child: Obx(() {
                final isLoading =
                    productDetailController.loadingSku.value == product.sku;

                return Container(
                  margin: EdgeInsets.only(top: 4.h, bottom: 0.h, left: 4.w),
                  padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.h),
                  decoration: BoxDecoration(
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primaryColor
                          : Colors.transparent,
                      width: 1.4.w,
                    ),
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                  child: Column(
                    children: [
                      Stack(
                        alignment: Alignment.center,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4.r),
                            child:
                                SimpleMethode.isSupportedFormat(
                                  "${SimpleMethode.imageUrl}/$imageUrl",
                                )
                                ? CachedNetworkImage(
                                    memCacheWidth: 3000,

                                    fadeInDuration: Duration(milliseconds: 200),
                                    imageUrl:
                                        "${SimpleMethode.imageUrl}/$imageUrl",
                                    fit: BoxFit.cover,
                                    width: 50.w,
                                    height: 50.w,
                                    errorWidget: (context, url, error) =>
                                        Container(
                                          width: 50.w,
                                          height: 50.w,
                                          color: Colors.grey[200],
                                          child: const Icon(
                                            Icons.image_not_supported,
                                            color: Colors.grey,
                                          ),
                                        ),
                                  )
                                : Container(
                                    width: 50.w,
                                    height: 50.w,
                                    color: Colors.grey[200],
                                    child: const Icon(
                                      Icons.image_not_supported,
                                      color: Colors.grey,
                                    ),
                                  ),
                          ),
                          if (isLoading)
                            SizedBox(
                              width: 20.w,
                              height: 20.w,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.0,
                                color: AppColors.primaryColor,
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: 4.h),
                      AppTextWidget(
                        text: product.color,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                      ),
                    ],
                  ),
                );
              }),
            );
          },
        ),
      );
    });
  }

  static Widget priceBundleSection(
    ProductDetailModel product,
    BuildContext context,
  ) {
    final ProductDetailController productDetailController = Get.put(
      ProductDetailController(),
    );

    final prices = product.prices;
    if (prices.isEmpty) return const SizedBox.shrink();
    final bestDeal = prices.reduce(
      (a, b) => a.discountPercent > b.discountPercent ? a : b,
    );
    return Obx(() {
      return productDetailController.productDetail.value != null
          ? !product.hasBundleFlag
                ? Padding(
                    padding: EdgeInsets.symmetric(horizontal: 0.0.w),
                    child: buildPriceRow(context, product),
                  )
                : Wrap(
                    spacing: 8.w,
                    runSpacing: 8.h,
                    children: List.generate(prices.length, (index) {
                      final tier = prices[index];
                      final isSelected =
                          productDetailController.selectedPriceIndex.value ==
                          index;
                      final isBest = tier == bestDeal;

                      return GestureDetector(
                        onTap: () {
                          productDetailController.selectedPriceIndex.value =
                              index;
                        },
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 14.w,
                                vertical: 8.h,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.primaryColor
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(20.r),
                                border: Border.all(
                                  width: 0.6.w,
                                  color: AppColors.primaryColor.withOpacity(
                                    0.7,
                                  ),
                                ),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: AppColors.primaryColor
                                              .withOpacity(0.25),
                                          blurRadius: 6.r,
                                          offset: const Offset(0, 2),
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  /// Quantity
                                  Text(
                                    '${tier.displayQuantity}x',

                                    //    '${tier.quantity}x',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w600,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.black,
                                      fontSize: 9.sp,
                                    ),
                                  ),

                                  /// Final Price
                                  Text(
                                    '${product.currencyCode} ${tier.priceText}',
                                    style: TextStyle(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w600,
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.black,
                                    ),
                                  ),

                                  /// Cut Price
                                  if (tier.strikePriceText != null)
                                    Text(
                                      '${product.currencyCode} ${tier.strikePriceText}',
                                      style: TextStyle(
                                        fontSize: 9.sp,
                                        color: isSelected
                                            ? Colors.white70
                                            : Colors.grey,
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),

                                  /// Save %
                                  if (tier.discountPercent > 0)
                                    Text(
                                      'Save ${tier.discountPercent}%',
                                      style: TextStyle(
                                        fontSize: 11.sp,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? Colors.white
                                            : Colors.green.shade700,
                                      ),
                                    ),
                                ],
                              ),
                            ),

                            /// BEST DEAL BADGE
                            if (isBest)
                              Positioned(
                                top: -6.h,
                                right: -6.w,
                                child: Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 6.w,
                                    vertical: 2.h,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.red,
                                    borderRadius: BorderRadius.circular(10.r),
                                  ),
                                  child: Text(
                                    'bestDeal'.tr,
                                    style: TextStyle(
                                      fontSize: 7.sp,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      );
                    }),
                  )
          : SizedBox();
    });
  }

  static Widget buildPriceRow(
    BuildContext context,
    ProductDetailModel product,
  ) {
    SessionController sessionController = Get.find<SessionController>();
    final config = sessionController.countryConfig.value;
    final currency = config?.currencyCode ?? '';
    final displayPrice = product.displayPrice;
    final cutPrice = product.cutPrice;
    final discountPercent = product.discountPercent;
    final bool hasDiscount = cutPrice != null && cutPrice > displayPrice;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        /// 🔥 PRICE ROW (Dress style)
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            /// Price
            AppTextWidget(
              text: '$currency ${displayPrice.toStringAsFixed(2)}',
              fontSize: 14.sp,
              color: AppColors.primaryColor,
              fontWeight: FontWeight.bold,
            ),

            /// Cut Price:
            if (hasDiscount) ...[
              SizedBox(width: 6.w),
              AnimatedLineThrough(
                color: Colors.grey.shade500,
                duration: const Duration(milliseconds: 400),
                isCrossed: true,
                strokeWidth: 2,
                child: AppTextWidget(
                  text: '$currency ${cutPrice.toStringAsFixed(2)}',
                  fontSize: 13.sp,
                  color: Colors.grey.shade500,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],

            /// Discount Percent (CLOSE to price)
            if (hasDiscount) ...[
              SizedBox(width: 6.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4.r),
                  border: Border.all(
                    width: 0.5.w,
                    color: AppColors.primaryColor,
                  ),
                ),
                child: AppTextWidget(
                  text: '$discountPercent% OFF',
                  fontSize: 9.sp,
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ],
        ),

        /// ALMOST SOLD OUT (Below price):
        SizedBox(height: 3.h),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4.r),
            border: Border.all(width: 0.5.w, color: AppColors.primaryColor),
          ),
          child: AppTextWidget(
            text: 'almostSoldOut'.tr,
            fontSize: 9.sp,
            color: AppColors.primaryColor,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}
