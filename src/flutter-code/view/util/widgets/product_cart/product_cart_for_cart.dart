import 'package:dress_fair_ecommmerce/view/util/widgets/dialog/add_to_cart_dialog/add_to_cart_dialog.dart';

import '../../../../model/main_product_model/main_product_model.dart';
import '../../../screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import '../network_Image/product_network_image.dart';

class ProductCartForCart extends StatelessWidget {
  MainProductModel item;
  double fakeRating;
  int fakeReviews;
  final SessionController sessionController;

  ProductCartForCart({
    super.key,
    required this.item,
    required this.sessionController,
    required this.fakeRating,
    required this.fakeReviews,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 3.0.w),
      child: Container(
        constraints: BoxConstraints(maxHeight: 320.h),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: AppShadows.softCardShadow,
        ),
        child: SingleChildScrollView(
          physics: NeverScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () {
                  Get.toNamed(
                    productDetailScreen,
                    arguments: {
                      "cateSlug": item.productSku,
                      "categoryId":
                          int.tryParse(item.productId.toString()) ?? 0,
                      "fakeReviews": 4,
                      "fakeRating": 4.5,
                    },
                  );
                },
                child: SizedBox(
                  height: 180.h,
                  child: ProductCachedImage(
                    imagePath: item.images.isNotEmpty
                        ? item.images.first.image
                        : null,
                    //  height: 200.h,
                    borderRadius: BorderRadius.circular(0.r),
                  ),
                ),
              ),
              5.h.sh,
              Padding(
                padding: EdgeInsets.only(
                  left: 3.0.w,
                  right: sessionController.selectedLanguageCode == "ar"
                      ? 4.w
                      : 0.w,
                ),
                child: AppTextWidget(
                  text: sessionController.selectedLanguageCode == "ar"
                      ? item.nameAr ?? ""
                      : item.name ?? "",
                  fontSize: 10.sp,
                  maxLines: 1,
                  fontWeight: FontWeight.normal,
                ),
              ),

              Padding(
                padding: EdgeInsets.only(
                  right: sessionController.selectedLanguageCode == "ar"
                      ? 4.w
                      : 0.w,
                ),
                child: Visibility(
                  visible:
                      item.price.quantity != null &&
                      item.price.quantity != 0 &&
                      item.price.quantity != 0.0 &&
                      (item.price.quantity is int
                          ? (item.price.quantity ?? 0) <= 10
                          : (int.tryParse(item.price.quantity.toString()) ??
                                    0) >=
                                10),

                  child: Padding(
                    padding: EdgeInsets.only(
                      left: 2.0.w,
                      right: sessionController.selectedLanguageCode == "ar"
                          ? 3.w
                          : 0.w,
                    ),
                    child: AppTextWidget(
                      text:
                          (int.tryParse(item.price.quantity.toString()) ?? 0) <=
                              10
                          ? "Only ${item.price.quantity} Left"
                          : "",
                      fontSize: 10.sp,
                      maxLines: 1,
                      color: AppColors.primaryColor,
                    ),
                  ),
                ),
              ),

              ///
              Row(
                children: [
                  Padding(
                    padding: EdgeInsets.only(
                      left: 1.0.w,
                      right: sessionController.selectedLanguageCode == "ar"
                          ? 4.w
                          : 0.w,
                    ),
                    child: Row(
                      children: List.generate(5, (index) {
                        if (fakeRating >= index + 1) {
                          return Icon(
                            Icons.star,
                            color: Colors.black,
                            size: 15.sp,
                          );
                        } else if (fakeRating > index &&
                            fakeRating < index + 1) {
                          return Icon(
                            Icons.star_half,
                            color: Colors.black,
                            size: 15.sp,
                          );
                        } else {
                          return Icon(
                            Icons.star_border,
                            color: Colors.grey,
                            size: 15.sp,
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
                      text: fakeRating.toStringAsFixed(1),
                      fontSize: 10.sp,
                      maxLines: 1,
                    ),
                  ),
                  8.w.sw,
                  AppTextWidget(
                    text: "($fakeReviews)",
                    fontSize: 10.sp,
                    maxLines: 1,
                  ),
                ],
              ),
              4.h.sh,

              _buildPriceRow(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPriceRow(BuildContext context) {
    final config = sessionController.countryConfig.value;
    final currency = config?.currencyCode ?? '';

    final displayPrice = item.price.getDisplayPrice();
    final cutPrice = item.price.getCutPrice();

    return Row(
      children: [
        Padding(
          padding: EdgeInsets.only(
            left: 3.0.w,
            right: sessionController.selectedLanguageCode == "ar" ? 4.w : 0.w,
          ),
          child: AppTextWidget(
            text: currency,
            fontSize: 10.sp,
            color: AppColors.primaryColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        5.w.sw,
        Expanded(
          child: cutPrice != null
              ? Row(
                  children: [
                    AppTextWidget(
                      text: displayPrice.toStringAsFixed(2),
                      fontSize: 12.sp,
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(width: 6.w),
                    AnimatedLineThrough(
                      color: Colors.grey.shade500,
                      duration: const Duration(milliseconds: 500),
                      isCrossed: true,
                      strokeWidth: 2,
                      child: AppTextWidget(
                        text: cutPrice.toStringAsFixed(2),
                        fontSize: 11.sp,
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                )
              : AppTextWidget(
                  text: displayPrice.toStringAsFixed(2),
                  fontSize: 12.sp,
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
        ),
        Padding(
          padding: EdgeInsets.only(
            right: 4.0.w,
            left: sessionController.selectedLanguageCode == "ar" ? 4.w : 0.w,
            bottom: 1.h,
          ),
          child: GestureDetector(
            onTap: () {
              AddToCartBottomSheet.show(
                context,
                cateSlug: item.productSku,
                categoryId: int.tryParse(item.productId.toString()) ?? 0,
                fakeRating: fakeRating,
                fakeReviews: fakeReviews,
                //item.productId,
              );
            },
            child: Container(
              height: 23.h,
              width: 35.w,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(50.r),
                border: Border.all(color: Colors.black, width: 1.w),
              ),
              child: Center(
                child: SvgPicture.asset(height: 13.h, AppImages.shopIcon),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
