import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../util/widgets/product_cart/deals_cart.dart';

class DealsWomenClothing extends StatefulWidget {
  const DealsWomenClothing({super.key});

  @override
  State<DealsWomenClothing> createState() => _DealsWomenClothingState();
}

class _DealsWomenClothingState extends State<DealsWomenClothing>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final dealsController = Get.find<DealsController>();
  final sessionController = Get.find<SessionController>();

  final RxBool hasReachedBottom = false.obs;

  @override
  void initState() {
    log("Building WomenClothing tab");
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (dealsController.dealsWClothing.isEmpty) {
        dealsController.getDeals(
          cateSlug: "Women Clothings",
          page: 1,
          isSilentRefresh: true,
          isPagination: false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Important for keep-alive
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          StaticTextContainer(text1: '', text2: ''),
          10.h.sh,
          _buildProductGridWithLoader(),
        ],
      ),
    );
  }

  Widget _buildProductGridWithLoader() {
    return Obx(() {
      if (!dealsController.isMoreLoading.value) {
        hasReachedBottom.value = false;
      }
      return Expanded(
        child: Column(
          children: [
            Expanded(child: _buildProductGrid()),

            if (hasReachedBottom.value && dealsController.isMoreLoading.value)
              _buildBottomLoadingIndicator(),

            // if (!dealsController.getHasMoreData("W-clothings") &&
            //     dealsController.getCategoryList("W-clothings").isNotEmpty)
            //   _buildEndOfListMessage(),
          ],
        ),
      );
    });
  }

  Widget _buildProductGrid() {
    return Obx(() {
      if (dealsController.isLoading.value) {
        return Center(child: SpinLoadingBar());
        // return ProductCardShimmer(height: 310.h);
      }
      if (dealsController.dealsWClothing.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }

      return GridView.builder(
        cacheExtent: 3000,
        padding: EdgeInsets.only(bottom: 8.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 3,
          //childAspectRatio: 0.63,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.4,
        ),
        itemCount:
            dealsController.dealsWClothing.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == dealsController.dealsWClothing.length &&
              dealsController.dealsWClothing.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }

          final item = dealsController.dealsWClothing[index];

          return DealsCard(
            item: item,
            sessionController: sessionController,
            fakeRating: 4.5,
            fakeReviews: 4,
          );
        },
      );
    });
  }

  Widget _buildBottomLoadingIndicator() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: SpinKitFadingCircle(color: AppColors.greyColor, size: 30.0.sp),
    );
  }

  Widget _buildEndOfListMessage() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: AppTextWidget(
        text: "",
        //"You've reached the end",
        fontSize: 12.sp,
        color: Colors.grey.shade500,
        fontWeight: FontWeight.w400,
      ),
    );
  }
}
