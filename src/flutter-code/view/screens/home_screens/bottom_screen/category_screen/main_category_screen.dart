import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/home_search_bar.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/cache_image/resuabe_cache_image.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shadows_reuse/AppShadows.dart';

import '../../../../../controller/simple_method/simple_methode.dart';
import '../../../../../model/category_model/category_model.dart';
import '../../../../util/widgets/dialog/add_to_cart_dialog/add_to_cart_dialog.dart';

class MainCategoryScreen extends StatefulWidget {
  const MainCategoryScreen({super.key});
  @override
  State<MainCategoryScreen> createState() => _MainCategoryScreenState();
}

class _MainCategoryScreenState extends State<MainCategoryScreen> {
  final CategoryController controller = Get.put(CategoryController());
  final SessionController sessionController = Get.find<SessionController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.whiteColor,
      body: SafeArea(
        child: Column(
          children: [
            6.h.sh,
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12.0.w),
              child: HomeSearchBar(),
            ),
            10.h.sh,
            StaticTextContainer(text1: '', text2: ''),
            5.h.sh,

            Expanded(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// LEFT CATEGORY LIST
                  category(context),

                  /// RIGHT SIDE CONTENT (scrolls as one)
                  Expanded(child: subCategory(context)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// LEFT CATEGORY PANEL
  Widget category(BuildContext context) {
    return Obx(() {
      return controller.categories.isEmpty
          ? const SizedBox()
          : Container(
              width: MediaQuery.sizeOf(context).width * 0.25,
              decoration: BoxDecoration(
                color: const Color(0xFFF7F7F7),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    offset: const Offset(2, 0),
                    blurRadius: 4,
                    spreadRadius: 0,
                  ),
                ],
                border: Border(
                  right: BorderSide(color: Color(0xFFE5E5E5), width: 0.4.w),
                ),
              ),
              //AppColors.lightGreyColor,
              child: ListView.builder(
                padding: EdgeInsets.zero,
                itemCount: controller.categories.length,
                itemBuilder: (context, index) {
                  var item = controller.categories[index];
                  final isSelected = controller.isSelected.value == item.id;
                  if (item.id == 0) {
                    return GestureDetector(
                      onTap: () async {
                        if (controller.isSelected.value != item.id) {
                          controller.selectCategory(item);
                        }
                        setState(() {});
                      },
                      child: Container(
                        color: isSelected ? Colors.white : Colors.transparent,
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.0.w,
                          vertical: 10.0.h,
                        ),
                        child: AppTextWidget(
                          text: item.name == "all".tr ? "feature".tr : "",
                          fontSize: 10.sp,
                          color: isSelected
                              ? AppColors.primaryColor
                              : AppColors.darkGreyText,
                          maxLines: 2,
                          fontWeight: isSelected
                              ? FontWeight.w500
                              : FontWeight.w400,
                        ),
                      ),
                    );
                  }
                  return GestureDetector(
                    onTap: () async {
                      if (controller.isSelected.value != item.id) {
                        controller.selectCategory(item);
                      }
                      setState(() {});
                    },
                    child: Container(
                      color: isSelected ? Colors.white : Colors.transparent,
                      padding: EdgeInsets.symmetric(
                        horizontal: 8.0.w,
                        vertical: 10.0.h,
                      ),
                      child: AppTextWidget(
                        text: sessionController.selectedLanguageCode == "ar"
                            ? item.nameAr
                            : item.name,
                        fontSize: 10.sp,
                        color: isSelected
                            ? AppColors.primaryColor
                            : AppColors.darkGreyText,
                        maxLines: 2,
                        fontWeight: isSelected
                            ? FontWeight.w500
                            : FontWeight.w400,
                      ),
                    ),
                  );
                },
              ),
            );
    });
  }

  /// RIGHT CONTENT (Subcategories + Related Products)
  Widget subCategory(BuildContext context) {
    return Obx(() {
      final selected = controller.selectedCategory.value;
      if (selected == null) {
        return Center(
          child: AppTextWidget(
            text: "noCategoriesAvailable".tr,
            color: Colors.black,
            fontSize: 14.sp,
          ),
        );
      }

      final subCategories = selected.subCategories;

      return SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.symmetric(horizontal: 0.w, vertical: 10.h),
        child: Container(
          color: Colors.white,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.w),
                child: AppTextWidget(
                  text: "shopByCategory".tr,
                  color: Colors.black,
                  fontWeight: FontWeight.w600,
                  fontSize: 13.5.sp,
                ),
              ),
              10.h.sh,

              /// Subcategories Grid (part of single scroll):
              GridView.builder(
                padding: EdgeInsets.zero,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: subCategories.length + 1,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 0.85,
                  crossAxisSpacing: 4,
                  mainAxisSpacing: 0,
                ),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return GestureDetector(
                      onTap: () {
                        if (subCategories.length == 1) {
                          Get.toNamed(
                            viewAllScreen,
                            arguments: {"cateSlug": subCategories[0].name},
                          );
                        } else {
                          Get.toNamed(
                            viewAllScreen,
                            arguments: {"cateSlug": subCategories[1].name},
                          );
                        }

                        // Get.toNamed(
                        //   productFilterScreen,
                        //   arguments: {
                        //     "categoryId": subCategories[1].id ?? 0,
                        //     "cateSlug": subCategories[1].name,
                        //   },
                        // );
                      },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            height: 55.h,
                            width: 55.w,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: const Color(0xFFF7F7F7),
                              boxShadow: AppShadows.softBottom,
                              //Colors.black.withOpacity(0.1),
                            ),
                            child: const Icon(
                              Icons.apps,
                              color: Colors.black54,
                            ),
                          ),
                          Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 8.0.w,
                              vertical: 8.0.h,
                            ),
                            child: AppTextWidget(
                              text: "viewAll".tr,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                  final sub = subCategories[index - 1];
                  return Padding(
                    padding: EdgeInsets.symmetric(horizontal: 3.w),
                    child: CategoryItemWidget(
                      imageUrl: sub.image,
                      title: sessionController.selectedLanguageCode == "ar"
                          ? sub.nameAr
                          : sub.name,
                      onTap: () {
                        Get.toNamed(
                          subCategoryProductScreen,
                          arguments: {"cateSlug": sub.name},
                        );
                      },
                    ),
                  );
                },
              ),

              relatedProducts(),
            ],
          ),
        ),
      );
    });
  }

  /// RELATED PRODUCTS SECTION:

  Widget relatedProducts() {
    return Obx(() {
      final selected = controller.selectedCategory.value;

      if (selected == null) {
        return const SizedBox();
      }
      final products = selected.products;
      log("Selected Category: ${selected.name}");
      log("Products Count: ${products.length}");

      if (products.isEmpty) {
        return Padding(
          padding: EdgeInsets.only(top: 40.h),
          child: Center(
            child: AppTextWidget(text: "No products found", fontSize: 12.sp),
          ),
        );
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.w),
            child: AppTextWidget(
              text: "relatedProducts".tr,
              fontWeight: FontWeight.w600,
              fontSize: 13.5.sp,
            ),
          ),
          12.h.sh,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 3.w),
            child: relatedProductItem(products),
          ),
        ],
      );
    });
  }

  Widget relatedProductItem(List<ProductModelNew> products) {
    return GridView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 6,
        mainAxisSpacing: 2,
        mainAxisExtent: MediaQuery.sizeOf(context).height * 0.265,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final item = products[index];
        return GestureDetector(
          onTap: () {},
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(6.r),
              boxShadow: AppShadows.softCardShadow,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                /// IMAGE + CART ICON:
                Stack(
                  children: [
                    GestureDetector(
                      onTap: () {
                        Get.toNamed(
                          productDetailScreen,
                          arguments: {
                            "cateSlug": item.productSku,
                            "categoryId": item.productId,
                            "fakeReviews": 4,
                            "fakeRating": 4.5,
                          },
                        );
                      },
                      child: ClipRRect(
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(6.r),
                          topRight: Radius.circular(6.r),
                        ),
                        child:
                            item.images.isNotEmpty &&
                                SimpleMethode.isSupportedFormat(
                                  "${SimpleMethode.imageUrl}/${item.images.first.image}",
                                )
                            ? CachedNetworkImage(
                                height: 130.h,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                imageUrl:
                                    "${SimpleMethode.imageUrl}/${item.images.first.image}",
                                errorWidget: (_, __, ___) =>
                                    const Icon(Icons.image_not_supported),
                              )
                            : Container(
                                height: 130.h,
                                color: Colors.grey[200],
                                child: const Center(
                                  child: Icon(Icons.image_not_supported),
                                ),
                              ),
                      ),
                    ),

                    /// CART ICON (TOP RIGHT)
                    Positioned(
                      bottom: 6.h,
                      right: 6.w,
                      child: GestureDetector(
                        onTap: () {
                          AddToCartBottomSheet.show(
                            context,
                            cateSlug: item.productSku,
                            categoryId:
                                int.tryParse(item.productId.toString()) ?? 0,
                            fakeRating: 4.5,
                            fakeReviews: 4,
                            //item.productId,
                          );
                        },
                        child: Container(
                          padding: EdgeInsets.all(5.sp),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.black12, blurRadius: 4.r),
                            ],
                          ),
                          child: Icon(
                            Icons.shopping_cart_outlined,
                            size: 15.sp,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                4.h.sh,

                /// NAME
                GestureDetector(
                  onTap: () {
                    Get.toNamed(
                      productDetailScreen,
                      arguments: {
                        "cateSlug": item.productSku,
                        "categoryId": item.productId,
                        "fakeReviews": 4,
                        "fakeRating": 4.5,
                      },
                    );
                  },
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6.w),
                    child: AppTextWidget(
                      text: sessionController.selectedLanguageCode == "ar"
                          ? item.nameAr
                          : item.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 5.w),
                  child: Row(
                    children: [
                      /// Rating:
                      Padding(
                        padding: EdgeInsets.only(
                          left: 1.0.w,
                          right: sessionController.selectedLanguageCode == "ar"
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
                            } else if (4.5 > index && 4.5 < index + 1) {
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
                          right: sessionController.selectedLanguageCode == "ar"
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

                /// PRICE
                GestureDetector(
                  onTap: () {
                    Get.toNamed(
                      productDetailScreen,
                      arguments: {
                        "cateSlug": item.productSku,
                        "categoryId": item.productId,
                        "fakeReviews": 4,
                        "fakeRating": 4.5,
                      },
                    );
                  },
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 6.w),
                    child: Row(
                      children: [
                        AppTextWidget(
                          text: item.currencyCode,
                          fontSize: 10.sp,
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                        3.w.sw,
                        AppTextWidget(
                          text: item.price.getDisplayPrice().toString(),
                          fontSize: 11.sp,
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
