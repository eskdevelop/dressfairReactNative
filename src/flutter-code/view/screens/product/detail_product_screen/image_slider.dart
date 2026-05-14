import 'dart:developer';

import 'package:carousel_slider/carousel_slider.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class ProductImageSlider extends StatefulWidget {
  const ProductImageSlider({super.key});

  @override
  State<ProductImageSlider> createState() => _ProductImageSliderState();
}

class _ProductImageSliderState extends State<ProductImageSlider> {
  int _currentIndex = 0;

  final CarouselSliderController _controller = CarouselSliderController();
  final ProductDetailController productDetailController = Get.put(
    ProductDetailController(),
  );
  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Scaffold(
        backgroundColor: Colors.grey[200],
        body: Center(
          child: Stack(
            children: [
              /// Image Slider
              CarouselSlider.builder(
                carouselController: _controller,
                itemCount:
                    productDetailController
                        .productDetail
                        .value
                        ?.images
                        .length ??
                    0,
                itemBuilder: (context, index, realIndex) {
                  final item = productDetailController
                      .productDetail
                      .value!
                      .images[index];
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(8.r),
                    child:
                        SimpleMethode.isSupportedFormat(
                          "${SimpleMethode.imageUrl}/${item.image}",
                        )
                        ? CachedNetworkImage(
                            memCacheWidth: 300,
                            imageUrl: "${SimpleMethode.imageUrl}/${item.image}",
                            fit: BoxFit.cover,
                            width: double.infinity,
                            placeholder: (context, url) => Container(
                              color: Colors.grey[200],
                              child: Center(
                                child: CircularProgressIndicator(
                                  color: AppColors.primaryColor,
                                ),
                              ),
                            ),
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
                },
                options: CarouselOptions(
                  height: 500.h,
                  enlargeCenterPage: true,
                  enableInfiniteScroll: true,
                  viewportFraction: 1,
                  onPageChanged: (index, reason) {
                    setState(() {
                      _currentIndex = index;
                    });
                  },
                ),
              ),

              /// Left button:
              Positioned(
                top: 138.h,
                left: 10.w,
                child: IconButton(
                  icon: Icon(
                    Icons.arrow_back_ios,
                    color: Colors.white,
                    size: 28.sp,
                  ),
                  onPressed: () => _controller.previousPage(),
                ),
              ),

              /// Right button:
              Positioned(
                top: 138.h,
                right: 10.w,
                child: IconButton(
                  icon: Icon(
                    Icons.arrow_forward_ios,
                    color: Colors.white,
                    size: 28.sp,
                  ),
                  onPressed: () => _controller.nextPage(),
                ),
              ),
              Positioned(
                top: 45.h,
                left: 10.w,
                child: CircleAvatar(
                  backgroundColor: Colors.black.withOpacity(0.5),
                  child: Center(
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () {
                        Get.back();
                        // Navigator.pop(context);
                      },
                    ),
                  ),
                ),
              ),

              /// Share button (top-right):
              Positioned(
                top: 45.h,
                right: 10.w,
                child: CircleAvatar(
                  backgroundColor: Colors.black.withOpacity(0.5),
                  child: Center(
                    child: IconButton(
                      icon: const Icon(Icons.share, color: Colors.white),
                      onPressed: () async {
                        await SimpleMethode().shareWebLink(
                          productDetailController.productDetail.value?.sku ??
                              "",
                        );
                      },
                    ),
                  ),
                ),
              ),

              /// Image count (bottom-right):
              Positioned(
                bottom: 20.h,
                right: 20.w,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 10.w,
                    vertical: 5.h,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Text(
                    "${_currentIndex + 1}/${productDetailController.productDetail.value?.images.length ?? 0}",
                    style: TextStyle(color: Colors.white, fontSize: 14.sp),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
