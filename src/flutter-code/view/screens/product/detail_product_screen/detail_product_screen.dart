import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/detail_category_model/detail_category_model.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/dress_color.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/price_bundle_section.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/product_details_bottom_nav_bar.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/shipping_info.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/size_option.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/widgets/title_section.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/floating_cart_icon/floating_cart_icon.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/product_cart/related_products_cart.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_static_text/resuable_static_text_with_color.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shimer_effect/main_product_detail_shimmer.dart';
import 'package:floating_draggable_widget/floating_draggable_widget.dart';
import 'package:flutter/foundation.dart';

import '../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import 'image_slider.dart';

class ProductDetailScreen extends StatefulWidget {
  String cateSlug;
  double fakeRating;
  int fakeReviews;
  ProductDetailScreen({
    super.key,
    required this.cateSlug,
    required this.fakeRating,
    required this.fakeReviews,
  });
  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  ProductDetailController productDetailController = Get.put(
    ProductDetailController(),
  );
  AddToCartController addToCartController = Get.put(AddToCartController());
  SessionController sessionController = Get.find<SessionController>();
  final ScrollController _innerScrollController = ScrollController();

  void _onInnerScroll() {
    final position = _innerScrollController.position;

    /// Trigger pagination when user scrolls near bottom:
    if (position.pixels >= position.maxScrollExtent * 0.7) {
      if (!productDetailController.isMoreLoading.value &&
          productDetailController.currentPage <
              productDetailController.totalPages) {
        log("🔹 Pagination triggered at ${position.pixels}");
        // productDetailController.getRelatedProducts(
        //   category: productDetailController.productDetail.value?.productId ?? 0,
        //   page: productDetailController.currentPage + 1,
        // );
      }
    }
  }

  @override
  void initState() {
    super.initState();
    // _innerScrollController.addListener(_onInnerScroll);
    productDetailController.isSizeFirstTime.value = true;

    productDetailController.quantity.value = 1;
    productDetailController.selectedSize.value = "0";
    productDetailController.selectedColorIndex.value = 0;
    productDetailController.selectedProductOptionId.value = 0;
    productDetailController.selectedOptionValueId.value = 0;

    // call async methods, but do NOT await here:
    productDetailController.getProductsDetail(
      cateSlug: widget.cateSlug,
      // categoryId: widget.categoryId,
      page: 1,
    );
    // productDetailController.loadRelatedProducts(
    //   page: 1,
    //   category: productDetailController.productDetail.value?.productId ?? 0,
    // );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Listen for changes and track product view:
      ever<ProductDetailModel?>(productDetailController.productDetail, (
        product,
      ) {
        if (product != null) {
          // ✅ FIXED: Use named parameters as defined in the method
          productDetailController.trackProductView(
            productId: product.productId.toString(),
            productName: product.name,
            price: 0,
            //product.prices.first.price,
            sku: product.name,
          );
          if (kDebugMode) {
            print("✅ Facebook event tracked for product: ${product.name}");
          }
        }
      });
    });
  }

  @override
  void dispose() {
    _innerScrollController.removeListener(_onInnerScroll);
    _innerScrollController.dispose();
    // _outerScrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return FloatingDraggableWidget(
        floatingWidget: FloatingCartButton(),
        floatingWidgetHeight: 75.h,
        floatingWidgetWidth: 80.w,
        dx: MediaQuery.of(context).size.width - 60.w - 19.w,
        dy: MediaQuery.of(context).size.height * 0.75,
        autoAlign: true,
        mainScreenWidget: Scaffold(
          backgroundColor: Colors.white,

          body: AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: productDetailController.isLoadingProductDetail.value
                ? ProductDetailShimmer()
                : Stack(
                    children: [
                      SingleChildScrollView(
                        physics: BouncingScrollPhysics(),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              height: 300.h,
                              child: ProductImageSlider(),
                            ),
                            StaticTextContainerWithColor(
                              text1: '',
                              text2: '',
                              isShowIcon: false,
                            ),
                            TitleSection(),
                            SizedBox(height: 5.h),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 9.w),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  productDetailController.productDetail.value !=
                                          null
                                      ? PriceBundleSection(
                                          product: productDetailController
                                              .productDetail
                                              .value!,
                                        )
                                      : SizedBox(),
                                  SizedBox(height: 6.h),

                                  /// ALMOST SOLD OUT (Below price):
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 9.0.w,
                                    ),
                                    child: Container(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 8.w,
                                        vertical: 2.h,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(
                                          2.r,
                                        ),
                                        border: Border.all(
                                          width: 0.5.w,
                                          color: AppColors.primaryColor,
                                        ),
                                      ),
                                      child: AppTextWidget(
                                        text: 'almostSoldOut'.tr,
                                        fontSize: 9.sp,
                                        color: AppColors.primaryColor,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),

                                  SizedBox(height: 8.h),
                                  DressColor(),
                                  SizeOption(),
                                  SizedBox(height: 6.h),
                                ],
                              ),
                            ),
                            10.h.sh,
                            Container(
                              height: 3.5.h,
                              width: MediaQuery.sizeOf(context).width,
                              color: Colors.black.withOpacity(0.09),
                            ),
                            8.h.sh,
                            ShippingInfo(),
                            5.h.sh,
                            relatedProducts(),
                          ],
                        ),
                      ),
                      if (productDetailController.isVariantLoading.value)
                        Container(
                          color: Colors.black.withOpacity(0.2),
                          child: Center(
                            child: CircularProgressIndicator(
                              color: AppColors.primaryColor,
                            ),
                          ),
                        ),
                    ],
                  ),
          ),
          bottomNavigationBar: ProductDetailsBottomNavBar(),
        ),
      );
    });
  }

  Widget quantitySection() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.w),
      child: Row(
        children: [
          AppTextWidget(
            text: 'qty'.tr,
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
          ),
          6.w.sw,
          Container(
            height: 25.h,
            width: 100.w,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade400),
              borderRadius: BorderRadius.circular(3.r),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // ➖ Minus button:
                InkWell(
                  onTap: () {
                    if (productDetailController.quantity.value > 1) {
                      productDetailController.quantity.value--;
                    } else {
                      AppToast.showError("quantityCanNotBeLessThan1".tr);
                    }
                  },
                  child: Container(
                    height: double.infinity,
                    width: 40.w,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(3.r),
                        bottomLeft: Radius.circular(3.r),
                      ),
                    ),
                    child: Icon(
                      Icons.remove,
                      size: 20.sp,
                      color: Colors.black87,
                    ),
                  ),
                ),

                // 🔥 Quantity text (reactive)
                Obx(
                  () => AppTextWidget(
                    text: productDetailController.quantity.value.toString(),
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.transparent,
                  ),
                ),

                // ➕ Plus button
                InkWell(
                  onTap: () {
                    productDetailController.quantity.value++;
                  },
                  child: Container(
                    height: double.infinity,
                    width: 40.w,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.only(
                        topRight: Radius.circular(3.r),
                        bottomRight: Radius.circular(3.r),
                      ),
                    ),
                    child: Icon(Icons.add, size: 20.sp, color: Colors.black87),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget relatedCategories() {
    return Obx(() {
      final products =
          productDetailController.productDetail.value?.relatedProducts;

      if (products == null || products.isEmpty) {
        return const SizedBox();
      }

      return Padding(
        padding: EdgeInsets.symmetric(horizontal: 10.0.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextWidget(text: AppText.relatedCategories),
            12.h.sh,
            SizedBox(
              height: 42.h,
              child: ListView.separated(
                padding: EdgeInsets.zero,
                scrollDirection: Axis.horizontal,
                itemCount: products.length,
                separatorBuilder: (_, __) => SizedBox(width: 10.w),
                itemBuilder: (context, index) {
                  final category = products[index];
                  return GestureDetector(
                    onTap: () {
                      log("Category Slug 333 == ${category.name}");
                      // Get.toNamed(
                      //   productScreen,
                      //   arguments: {"cateSlug": category.slug},
                      // );
                    },
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(30.r),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 16.r,
                            backgroundImage:
                                (category.relatedProductImages.isNotEmpty)
                                ? NetworkImage(
                                    category.relatedProductImages.first.image,
                                  )
                                : AssetImage(AppImages.placeHolder)
                                      as ImageProvider,
                          ),
                          SizedBox(width: 8.w),
                          Text(
                            category.name,
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.black87,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget relatedProducts() {
    return Obx(() {
      final products =
          productDetailController.productDetail.value?.relatedProducts;
      if (products == null || products.isEmpty) {
        return const SizedBox();
      }

      return Container(
        // height: 240.h,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 10.0.w),
              child: AppTextWidget(text: 'relatedProducts'.tr, fontSize: 14.sp),
            ),
            12.h.sh,
            relatedProductItem(),
          ],
        ),
      );
    });
  }

  Widget relatedProductItem() {
    return Obx(() {
      return productDetailController.isLoading.value
          ? Center(
              child: Padding(
                padding: EdgeInsets.only(top: 300.0.h),
                child: CircularProgressIndicator(color: AppColors.primaryColor),
              ),
            )
          : productDetailController.productDetail.value?.relatedProducts !=
                    null &&
                productDetailController
                    .productDetail
                    .value!
                    .relatedProducts
                    .isEmpty
          ? Center(
              child: Padding(
                padding: EdgeInsets.only(top: 300.0.h),
                child: AppTextWidget(text: AppText.noDataFound),
              ),
            )
          : GridView.builder(
              controller: _innerScrollController,
              cacheExtent: 3000,
              padding: EdgeInsets.zero,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 0,
                mainAxisSpacing: 2,
                mainAxisExtent: MediaQuery.sizeOf(context).height * 0.286,
              ),
              itemCount: productDetailController
                  .productDetail
                  .value
                  ?.relatedProducts
                  .length,
              itemBuilder: (context, index) {
                var item = productDetailController
                    .productDetail
                    .value
                    ?.relatedProducts[index];

                return GestureDetector(
                  onTap: () {
                    Get.offNamed(
                      productDetailScreen,
                      arguments: {
                        "cateSlug": item?.productSku ?? "",
                        "categoryId":
                            int.tryParse(item?.productId.toString() ?? "") ?? 0,
                        "fakeReviews": 4,
                        "fakeRating": 4.5,
                      },
                    );
                  },
                  child: RelatedProductCard(
                    item:
                        item ??
                        RelatedProductNew(
                          productId: 0,
                          productSku: '',
                          currencyCode: "",
                          name: '',
                          nameAr: '',
                          relatedProductCategory: RelatedProductCategory(
                            nameAr: "",
                            name: "",
                          ),
                          relatedProductsPrice: RelatedProductPrice(
                            normalPrice: 0,
                          ), // single RelatedProductPrice object
                          relatedProductImages:
                              [], // empty list of ProductImageNew
                        ),
                    sessionController: sessionController,
                    fakeRating: 4.5,
                    fakeReviews: 4,
                  ),
                );
              },
            );
    });
  }
}
