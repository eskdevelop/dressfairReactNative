import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/product_cart/deals_cart.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class DealsAutomotiveAndAccessories extends StatefulWidget {
  const DealsAutomotiveAndAccessories({super.key});
  @override
  State<DealsAutomotiveAndAccessories> createState() =>
      _DealsAutomotiveAndAccessoriesState();
}

class _DealsAutomotiveAndAccessoriesState
    extends State<DealsAutomotiveAndAccessories>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final dealsController = Get.find<DealsController>();
  final sessionController = Get.find<SessionController>();
  final RxBool hasReachedBottom = false.obs;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (dealsController.dealsAutomotiveAcc.isEmpty) {
        dealsController.getDeals(
          cateSlug: "Automotive Accessories",
          page: 1,
          isSilentRefresh: true,
          isPagination: false,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      body: Column(
        children: [
          StaticTextContainer(text1: '', text2: ''),
          10.h.sh,
          // 🆕 Use Expanded only once at the top level
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

      if (dealsController.dealsAutomotiveAcc.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }

      /// Product Grid:
      return GridView.builder(
        cacheExtent: 3000,
        padding: EdgeInsets.only(bottom: 8.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 3,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.4,
        ),
        itemCount:
            dealsController.dealsAutomotiveAcc.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == dealsController.dealsAutomotiveAcc.length &&
              dealsController.dealsAutomotiveAcc.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }
          final item = dealsController.dealsAutomotiveAcc[index];
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
      child: Column(
        children: [
          SpinKitFadingCircle(color: AppColors.greyColor, size: 30.0.sp),
          8.h.sh,
          // AppTextWidget(
          //   text: "Loading more products...",
          //   fontSize: 12.sp,
          //   color: Colors.grey.shade600,
          //   fontWeight: FontWeight.w500,
          // ),
        ],
      ),
    );
  }
}
