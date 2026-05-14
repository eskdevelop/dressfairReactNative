import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_add_to_cart_controller/get_add_to_cart_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GreatDay extends StatefulWidget {
  const GreatDay({super.key});

  @override
  State<GreatDay> createState() => _GreatDayState();
}

class _GreatDayState extends State<GreatDay>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final GetAddToCartController getAddToCartController =
      Get.find<GetAddToCartController>();
  SessionController sessionController = Get.find<SessionController>();

  final _scrollController = ScrollController();

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    log("On Scroll Section");

    final position = _scrollController.position;
    final threshold = position.maxScrollExtent * 0.7;
    if (position.pixels >= threshold &&
        !getAddToCartController.isFetchingMore.value &&
        getAddToCartController.greatCurrentPage.value <
            getAddToCartController.greatTotalPages.value) {
      // getAddToCartController.loadMoreNewArrivals();
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((v) {
      getAddToCartController.isFetchingMore.value = false;
      getAddToCartController.greatCurrentPage.value = 1;
      getAddToCartController.greatTotalPages.value = 1;
      if (getAddToCartController.greatDay.isEmpty) {
        getAddToCartController.greatDay();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Obx(() {
          if (getAddToCartController.isLoadingGreatDay.value) {
            return ProductCardShimmer();
          }

          if (getAddToCartController.greatDay.isEmpty) {
            return Center(
              child: Padding(
                padding: EdgeInsets.only(top: 30.0.h),
                child: AppTextWidget(text: "noDataFound".tr),
              ),
            );
          }

          // ✅ Scrollable full screen
          return GridView.builder(
            controller: _scrollController,
            shrinkWrap: true,
            cacheExtent: 3000,
            physics: const BouncingScrollPhysics(),
            padding: EdgeInsets.zero,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 3,
              childAspectRatio: 0.59,
            ),
            itemCount:
                getAddToCartController.greatDay.length +
                (getAddToCartController.isFetchingMore.value ? 1 : 0),
            //getAddToCartController.greatDay.length,
            itemBuilder: (context, index) {
              final item = getAddToCartController.greatDay[index];
              // final double fakeRating = SimpleMethode().getRandomRating();
              // final int fakeReviews = SimpleMethode().getRandomReviews();
              return SizedBox();
              //   ProductCard(
              //   item: item,
              //   sessionController: sessionController, fakeRating: fakeRating ,fakeReviews: fakeReviews,
              // );

              //   Container(
              //   decoration: BoxDecoration(
              //     // color: Colors.red,
              //     borderRadius: BorderRadius.circular(8.r),
              //     boxShadow: [
              //       BoxShadow(
              //         color: Colors.black.withOpacity(0.05),
              //         blurRadius: 4.r,
              //         offset: const Offset(0, 2),
              //       ),
              //     ],
              //   ),
              //   child: Column(
              //     crossAxisAlignment: CrossAxisAlignment.start,
              //     children: [
              //       // ✅ Product image
              //       GestureDetector(
              //         onTap: () {
              //           log("CateSlug in Product Screen == ${item.model}");
              //           Get.toNamed(
              //             productDetailScreen,
              //             arguments: {"cateSlug": item.model},
              //           );
              //         },
              //         child: CachedNetworkImage(
              //           fadeInDuration: Duration(milliseconds: 200),
              //           // height: 100.h,
              //           // width: ,
              //           imageUrl: item.image ?? "",
              //           fit: BoxFit.cover,
              //           // placeholder: (context, url) => Center(
              //           //   child: CircularProgressIndicator(
              //           //     strokeWidth: 2.w,
              //           //   ),
              //           // ),
              //           errorWidget: (context, url, error) {
              //             log("Error == ${error.toString()}");
              //             return Center(
              //               child: SvgPicture.asset(
              //                 AppImages.placeHolder,
              //                 height: 80.h,
              //                 color: Colors.red,
              //               ),
              //             );
              //           },
              //         ),
              //       ),
              //       5.h.sh,
              //
              //       // ✅ Product title
              //       AppTextWidget(
              //         text: item.name,
              //         fontSize: 10.sp,
              //         maxLines: 1,
              //       ),
              //       10.h.sh,
              //
              //       // ✅ Price row
              //       SingleChildScrollView(
              //         scrollDirection: Axis.horizontal,
              //         child: SizedBox(
              //           width: MediaQuery.sizeOf(context).width * 0.45,
              //           child: Row(
              //             children: [
              //               AppTextWidget(
              //                 text:
              //                     '${sessionController.countryConfig.value.currency}',
              //                 fontSize: 10.sp,
              //                 color: AppColors.primaryColor,
              //               ),
              //               5.w.sw,
              //               (item.special.isNotEmpty &&
              //                       item.price.isNotEmpty &&
              //                       item.special != "0" &&
              //                       item.special != "0.0" &&
              //                       item.special != "0.00" &&
              //                       double.tryParse(item.special)! <
              //                           double.tryParse(item.price)!)
              //                   ? Row(
              //                       children: [
              //                         Text(
              //                           item.special,
              //                           style: TextStyle(
              //                             color: AppColors.primaryColor,
              //                             fontSize: 12.sp,
              //                             fontWeight: FontWeight.w500,
              //                           ),
              //                         ),
              //                         SizedBox(width: 6.w),
              //                         AnimatedLineThrough(
              //                           color: Colors.grey.shade500,
              //                           duration: const Duration(
              //                             milliseconds: 500,
              //                           ),
              //                           isCrossed: true,
              //                           strokeWidth: 2,
              //                           child: AppTextWidget(
              //                             text: item.price,
              //                             fontSize: 11.sp,
              //                             color: Colors.grey.shade500,
              //                             fontWeight: FontWeight.w600,
              //                           ),
              //                         ),
              //                       ],
              //                     )
              //                   : AppTextWidget(
              //                       text: item.price,
              //                       fontSize: 12.sp,
              //                       color: AppColors.primaryColor,
              //                       fontWeight: FontWeight.w600,
              //                     ),
              //               const Spacer(),
              //
              //               // ✅ Add to cart button
              //               GestureDetector(
              //                 onTap: () {
              //                   showDialog(
              //                     context: context,
              //                     builder: (context) {
              //                       return AddToCartDialog(
              //                         cateSlug: item.model,
              //                       );
              //                     },
              //                   );
              //                 },
              //                 child: Container(
              //                   height: 25.h,
              //                   width: 36.w,
              //                   decoration: BoxDecoration(
              //                     borderRadius: BorderRadius.circular(50.r),
              //                     border: Border.all(
              //                       color: Colors.black,
              //                       width: 1.w,
              //                     ),
              //                   ),
              //                   child: Center(
              //                     child: SvgPicture.asset(
              //                       AppImages.shopIcon,
              //                       height: 15.h,
              //                     ),
              //                   ),
              //                 ),
              //               ),
              //             ],
              //           ),
              //         ),
              //       ),
              //     ],
              //   ),
              // );
            },
          );
        }),
      ),
    );
  }
}
