import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/price_extention.dart';

import '../../../../../controller/product_controller/product_detail_controller.dart';
import '../../../../../controller/session_controller/session_controller.dart';
import '../../../../../model/detail_category_model/detail_category_model.dart';
import '../../../../util/widgets/routes/screens_library.dart';

class PriceBundleSection extends StatelessWidget {
  ProductDetailModel product;
  PriceBundleSection({super.key, required this.product});

  ProductDetailController productDetailController =
      Get.find<ProductDetailController>();

  SessionController sessionController = Get.find<SessionController>();
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return productDetailController.productDetail.value != null
          ? !product.hasBundleFlag
                ? Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10.0.w),
                    child: _buildPriceRow(context, product),
                  )
                : Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10.0.w),
                    child: priceBundleSection(product),
                  )
          : SizedBox();
    });
  }

  Widget priceBundleSection(ProductDetailModel product) {
    final prices = product.prices;
    if (prices.isEmpty) return const SizedBox.shrink();

    final bestDeal = prices.reduce(
      (a, b) => a.discountPercent > b.discountPercent ? a : b,
    );

    return Wrap(
      spacing: 8.w,
      runSpacing: 8.h,
      children: List.generate(prices.length, (index) {
        final tier = prices[index];
        final isSelected =
            productDetailController.selectedPriceIndex.value == index;
        final isBest = tier == bestDeal;

        return GestureDetector(
          onTap: () {
            productDetailController.selectedPriceIndex.value = index;
          },
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primaryColor : Colors.white,
                  borderRadius: BorderRadius.circular(20.r),
                  border: Border.all(
                    width: 0.5,
                    color: AppColors.primaryColor.withOpacity(0.7),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    /// Quantity
                    Text(
                      '${tier.displayQuantity}x',
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.black,
                        fontWeight: FontWeight.w600,
                        fontSize: 9.sp,
                      ),
                    ),

                    /// Price:
                    Text(
                      '${product.currencyCode} ${tier.priceText}',
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : Colors.black,
                      ),
                    ),

                    /// Cut Price
                    if (tier.strikePriceText != null)
                      Text(
                        '${product.currencyCode} ${tier.strikePriceText}',
                        style: TextStyle(
                          fontSize: 9.sp,
                          color: isSelected ? Colors.white70 : Colors.grey,
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),

                    /// Save %
                    if (tier.discountPercent > 0)
                      Text(
                        'Save ${tier.discountPercent}%',
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: isSelected ? Colors.white : Colors.green,
                          fontWeight: FontWeight.w600,
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
                      'BEST',
                      style: TextStyle(
                        fontSize: 7.sp,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  /// Price Row :
  Widget _buildPriceRow(BuildContext context, ProductDetailModel product) {
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
      ],
    );
  }
}
