import 'dart:developer';

import '../../../../../controller/product_controller/product_detail_controller.dart';
import '../../../../../controller/simple_method/simple_methode.dart';
import '../../../../util/widgets/routes/screens_library.dart';

class DressColor extends StatelessWidget {
  DressColor({super.key});
  ProductDetailController productDetailController =
      Get.find<ProductDetailController>();
  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final products =
          productDetailController.productDetail.value?.productColors;

      if (products == null || products.isEmpty || products.length <= 1) {
        return const SizedBox();
      }
      return SizedBox(
        height: 88.h,
        //color: Colors.red,
        child: ListView.builder(
          padding: EdgeInsets.zero,
          cacheExtent: 3000,
          scrollDirection: Axis.horizontal,
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            final imageUrl = product.image;
            final isSelected =
                productDetailController.selectedColorSku.value == product.sku;
            // product.productId.toString() ==
            // productDetailController.productDetail.value?.productId
            //     .toString();
            return GestureDetector(
              onTap: () async {
                productDetailController.selectedColorSku.value = product.sku;
                productDetailController.loadingSku.value = product.sku;

                productDetailController.loadingSku.value == product.sku;
                productDetailController.selectedColorIndex.value = index;
                await productDetailController.getProductsDetail(
                  cateSlug: product.sku,
                  page: 1,
                  fromVariant: true,
                );
              },
              child: Container(
                margin: EdgeInsets.symmetric(horizontal: 8.w, vertical: 0.h),
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 2.h),
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
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4.r),
                      child:
                          SimpleMethode.isSupportedFormat(
                            "${SimpleMethode.imageUrl}/$imageUrl",
                          )
                          ? CachedNetworkImage(
                              memCacheWidth: 300,
                              fadeInDuration: Duration(milliseconds: 200),
                              imageUrl: "${SimpleMethode.imageUrl}/$imageUrl",
                              fit: BoxFit.cover,
                              width: 60.w,
                              // placeholder: (context, url) => Center(
                              //   child: CircularProgressIndicator(
                              //     color: AppColors.primaryColor,
                              //   ),
                              // ),
                              errorWidget: (context, url, error) {
                                log("Error == ${error.toString()}");
                                return Center(
                                  child: SvgPicture.asset(
                                    color: Colors.red,
                                    height: 80.h,
                                    AppImages.placeHolder,
                                  ),
                                );
                              },
                            )
                          : Container(
                              color: Colors.grey[200],
                              child: const Icon(
                                Icons.image_not_supported,
                                color: Colors.grey,
                              ),
                            ),
                    ),

                    AppTextWidget(
                      text: product.color,
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }
}
