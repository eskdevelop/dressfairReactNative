import 'dart:developer';

import '../../../../../controller/product_controller/product_detail_controller.dart';
import '../../../../util/widgets/routes/screens_library.dart';

class SizeOption extends StatefulWidget {
  const SizeOption({super.key});

  @override
  State<SizeOption> createState() => _SizeOptionState();
}

class _SizeOptionState extends State<SizeOption> {
  ProductDetailController productDetailController =
      Get.find<ProductDetailController>();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final sizeOptions = productDetailController.productDetail.value?.options;
      log("Size Option == ${sizeOptions?.length ?? 0}");

      if (sizeOptions == null ||
          sizeOptions.isEmpty ||
          sizeOptions.length <= 1) {
        return const SizedBox();
      }

      log(
        "Options == ${productDetailController.productDetail.value?.options.length}",
      );
      return Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.w),
        child: Column(
          children: [
            Row(
              children: [
                Padding(
                  padding: EdgeInsets.only(left: 2.0.w),
                  child: AppTextWidget(
                    text: AppText.size,
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            SizedBox(height: 2.h),
            Container(
              height: 22.h,
              color: Colors.white,
              child: ListView.builder(
                padding: EdgeInsets.zero,
                cacheExtent: 3000,
                scrollDirection: Axis.horizontal,
                itemCount:
                    productDetailController.productDetail.value?.options.length,
                itemBuilder: (context, index) {
                  var item = productDetailController
                      .productDetail
                      .value
                      ?.options[index];
                  return Padding(
                    padding: EdgeInsets.only(left: 6.0.w),
                    child: GestureDetector(
                      onTap: () {
                        productDetailController.selectedSize.value =
                            productDetailController
                                .productDetail
                                .value
                                ?.options[index]
                                .label ??
                            "";
                        productDetailController.selectedSizeProductId.value =
                            productDetailController
                                .productDetail
                                .value
                                ?.options[index]
                                .productOptionId ??
                            0;

                        setState(() {});
                      },

                      // {
                      //   final selected = sizeOptions[index];
                      //   // productDetailController.selectedSize.value =
                      //   //     selected.name; // "40"
                      //   productDetailController.selectedProductOptionId.value =
                      //       productDetailController
                      //           .productDetail
                      //           .value
                      //           ?.sizeOption
                      //           ?.productOptionId ??
                      //       0;
                      //   productDetailController.selectedOptionValueId.value =
                      //       selected.productOptionValueId ?? 0;
                      // },
                      child: Container(
                        decoration: BoxDecoration(
                          border: Border.all(
                            color:
                                productDetailController.selectedSize.value ==
                                    sizeOptions[index].label
                                ? AppColors.primaryColor
                                : Colors.black.withOpacity(0.3),
                            width: 1.w,
                          ),
                          color: AppColors.whiteColor,
                          borderRadius: BorderRadius.circular(10.r),
                        ),
                        child: Center(
                          child: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8.0.w),
                            child: AppTextWidget(
                              text: item?.label ?? "",
                              fontWeight: FontWeight.w500,
                              fontSize: 10.sp,
                              color:
                                  productDetailController.selectedSize.value ==
                                      sizeOptions[index].label
                                  ? AppColors.primaryColor
                                  : Colors.black,
                            ),
                          ),
                        ),
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
}
