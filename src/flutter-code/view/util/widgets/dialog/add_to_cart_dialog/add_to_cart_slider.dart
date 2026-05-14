import 'dart:developer';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../controller/simple_method/simple_methode.dart';

class AddToCartDialogSlider extends StatefulWidget {
  const AddToCartDialogSlider({super.key});

  @override
  State<AddToCartDialogSlider> createState() => _AddToCartDialogSliderState();
}

class _AddToCartDialogSliderState extends State<AddToCartDialogSlider> {
  final CarouselSliderController _controller = CarouselSliderController();
  ProductDetailController productDetailController = Get.put(
    ProductDetailController(),
  );
  int _currentIndex = 0;
  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Center(
        child: Stack(
          children: [
            /// Image Slider:
            productDetailController.productDetail.value?.images != null &&
                    productDetailController
                        .productDetail
                        .value!
                        .images
                        .isNotEmpty
                ? CarouselSlider(
                    carouselController: _controller,
                    options: CarouselOptions(
                      height: 160.h,
                      enlargeCenterPage: true,
                      enableInfiniteScroll: true,
                      viewportFraction: 1,
                      onPageChanged: (index, reason) {
                        setState(() {
                          _currentIndex = index;
                        });
                      },
                    ),
                    items: productDetailController.productDetail.value?.images
                        .map((item) {
                          return ClipRRect(
                            borderRadius: BorderRadius.circular(2.r),
                            child:
                                SimpleMethode.isSupportedFormat(
                                  "${SimpleMethode.imageUrl}/${item.image}",
                                )
                                ? CachedNetworkImage(
                                    memCacheWidth: 300,
                                    fadeInDuration: Duration(milliseconds: 200),
                                    imageUrl:
                                        "${SimpleMethode.imageUrl}/${item.image}",
                                    fit: BoxFit.cover,
                                    width: double.infinity,
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
                          );
                        })
                        .toList(),
                  )
                : SizedBox(),

            /// Left button:
            Positioned(
              top: 55.h,
              left: 10.w,
              child: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios,
                  color: Colors.white,
                  size: 16.sp,
                ),
                onPressed: () => _controller.previousPage(),
              ),
            ),

            /// Right button:
            Positioned(
              top: 55.h,
              right: 10.w,
              child: IconButton(
                icon: Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.white,
                  size: 16.sp,
                ),
                onPressed: () => _controller.nextPage(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
