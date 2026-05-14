import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/extensions/deals_extension.dart';

import '../../../controller/simple_method/simple_methode.dart';
import '../../../model/deals_model/deals_model.dart';

class HomeDealCard extends StatelessWidget {
  final DealProductModel product;
  final VoidCallback? onTap;
  final int index;

  HomeDealCard({
    super.key,
    required this.product,
    this.onTap,
    required this.index,
  });
  SessionController sessionController = Get.find<SessionController>();
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 160.w,
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 4.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8.r),
          boxShadow: AppShadows.softCardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// 🔹 Deal type badge + image :
            Stack(
              children: [
                /// Image :
                ClipRRect(
                  borderRadius: BorderRadius.circular(8.r),
                  child:
                      SimpleMethode.isSupportedFormat(
                        "${SimpleMethode.imageUrl}/${product.displayImage}",
                      )
                      ? CachedNetworkImage(
                          key: ValueKey(
                            "${SimpleMethode.imageUrl}/${product.displayImage}",
                          ),
                          imageUrl:
                              "${SimpleMethode.imageUrl}/${product.displayImage}",
                          height: 158.w,
                          width: 160.w,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: Colors.grey.shade200,
                            child: Center(
                              child: CircularProgressIndicator(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 3.w,
                                  vertical: 3.h,
                                ),
                                strokeWidth: 1.w,
                                color: AppColors.primaryColor,
                              ),
                            ),
                          ),

                          errorWidget: (context, url, error) {
                            return Image.network(
                              "${SimpleMethode.alternativeBanner}/${product.displayImage}",
                              fit: BoxFit.cover,
                              height: 158.w,
                              width: 160.w,
                            );
                          },
                        )
                      : Container(
                          height: 158.w,
                          width: 160.w,
                          color: Colors.grey[200],
                          child: const Icon(
                            Icons.image_not_supported,
                            color: Colors.grey,
                          ),
                        ),
                ),

                /// Top-left deal badge
                Positioned(
                  top: 6.h,
                  left: 6.w,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 11.w,
                      vertical: 3.h,
                    ),
                    decoration: BoxDecoration(
                      color: index == 0 ? Colors.green : Colors.blue,
                      borderRadius: BorderRadius.circular(15.r),
                    ),
                    child: Row(
                      children: [
                        if (index == 0)
                          Icon(
                            Icons.flash_on,
                            size: 12.sp,
                            color: Colors.white,
                          ),
                        if (index == 0) SizedBox(width: 2.w),
                        AppTextWidget(
                          text: index == 0
                              ? "lightningDeals".tr
                              : "newArrival".tr,
                          fontSize: 10.sp,
                          color: Colors.white,
                          fontWeight: FontWeight.w400,
                        ),
                      ],
                    ),
                  ),
                ),

                /// Bottom-left "Only few left"
                Positioned(
                  bottom: 6.h,
                  left: 6.w,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 11.w,
                      vertical: 3.h,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: AppTextWidget(
                      text: "onlyLYFEWLEFT".tr,
                      fontSize: 8.sp,
                      color: Colors.white,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 3.h),

            /// Product name:
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              child: AppTextWidget(
                text: sessionController.selectedLanguageCode == "ar"
                    ? product.nameAr
                    : product.name,
                fontSize: 10.sp,
                fontWeight: FontWeight.w400,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(height: 3.h),
            Padding(
              padding: EdgeInsets.only(left: 2.0.w),
              child: Container(
                // color: Colors.red,
                child: Row(
                  children: [
                    AppTextWidget(
                      text:
                          '${sessionController.countryConfig.value?.currencyCode} ${product.displayPrice.toStringAsFixed(0)}',
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primaryColor,
                    ),
                    SizedBox(width: 4.w),
                    if (product.price.hasOffer)
                      Text(
                        '${sessionController.countryConfig.value?.currencyCode} ${product.price.normalPrice.toStringAsFixed(0)}',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    if (product.discountPercent > 0) SizedBox(width: 4.w),
                    if (product.discountPercent > 0)
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 2.h,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(.1),
                          borderRadius: BorderRadius.circular(4.r),
                        ),
                        child: AppTextWidget(
                          text: '-${product.discountPercent}%',
                          fontSize: 10.sp,
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
