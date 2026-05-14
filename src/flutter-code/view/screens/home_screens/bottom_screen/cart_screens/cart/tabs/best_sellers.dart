import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_add_to_cart_controller/get_add_to_cart_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class BestSellers extends StatefulWidget {
  const BestSellers({super.key});

  @override
  State<BestSellers> createState() => _BestSellersState();
}

class _BestSellersState extends State<BestSellers>
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
    final threshold = position.maxScrollExtent * 0.7; // Trigger at 80% scroll

    if (position.pixels >= threshold &&
        !getAddToCartController.isFetchingMore.value &&
        getAddToCartController.bestSellerCurrentPage.value <
            getAddToCartController.bestSellerTotalPages.value) {
      // getAddToCartController.loadMoreBestSeller();
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
    WidgetsBinding.instance.addPostFrameCallback((v) {
      _scrollController.addListener(_onScroll);
      if (getAddToCartController.bestSeller.isEmpty) {
        //  getAddToCartController.loadBestSeller();
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
          if (getAddToCartController.isLoadingSeller.value) {
            return ProductCardShimmer();
          }

          if (getAddToCartController.bestSeller.isEmpty) {
            return Center(
              child: Padding(
                padding: EdgeInsets.only(top: 30.0.h),
                child: AppTextWidget(text: "noDataFound".tr),
              ),
            );
          }

          // ✅ Scrollable full screen
          return SizedBox();
          //   GridView.builder(
          //   controller: _scrollController,
          //   cacheExtent: 3000,
          //   shrinkWrap: true,
          //   physics: const BouncingScrollPhysics(),
          //   padding: EdgeInsets.zero,
          //   gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          //     crossAxisCount: 2,
          //     // crossAxisSpacing: 10,
          //     mainAxisSpacing: 3,
          //
          //     childAspectRatio: 0.63,
          //   ),
          //   itemCount:
          //       getAddToCartController.bestSeller.length +
          //       (getAddToCartController.isFetchingMore.value ? 1 : 0),
          //   itemBuilder: (context, index) {
          //     final double fakeRating = SimpleMethode().getRandomRating();
          //     final int fakeReviews = SimpleMethode().getRandomReviews();
          //     if (index == getAddToCartController.bestSeller.length) {
          //       return SizedBox(
          //         width: double.infinity,
          //         child: Center(
          //           child: Padding(
          //             padding: EdgeInsets.only(left: 140.0.w),
          //             child: SpinKitFadingCircle(
          //               color: AppColors.greyColor,
          //               size: 40.0.sp,
          //             ),
          //           ),
          //         ),
          //       );
          //     }
          //     final item = getAddToCartController.bestSeller[index];
          //
          //     return ProductCartForCart(
          //       item: item,
          //       sessionController: sessionController,
          //       fakeRating: fakeRating,
          //       fakeReviews: fakeRating,
          //     );
          //   },
          // );
        }),
      ),
    );
  }
}
