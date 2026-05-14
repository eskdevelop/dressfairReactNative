import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';

import '../../../util/widgets/product_cart/deals_cart.dart';
import '../../../util/widgets/routes/screens_library.dart';

class DealsCellPhoneAccessories extends StatefulWidget {
  const DealsCellPhoneAccessories({super.key});

  @override
  State<DealsCellPhoneAccessories> createState() =>
      _DealsCellPhoneAccessoriesState();
}

class _DealsCellPhoneAccessoriesState extends State<DealsCellPhoneAccessories>
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
      if (dealsController.dealsCellPhone.isEmpty) {
        dealsController.getDeals(
          cateSlug: "Cell Phone",
          page: 1,
          isSilentRefresh: true,
          isPagination: false,
        );
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // keep-alive
    return Scaffold(
      body: Column(
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

            // if (!dealsController.getHasMoreData("Cellphone") &&
            //     dealsController.getCategoryList("Cellphone").isNotEmpty)
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

      if (dealsController.dealsCellPhone.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }

      return GridView.builder(
        cacheExtent: 3000,
        padding: EdgeInsets.only(bottom: 8.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 3,
          // childAspectRatio: 0.63,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.4,
        ),
        itemCount:
            dealsController.dealsCellPhone.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == dealsController.dealsCellPhone.length &&
              dealsController.dealsCellPhone.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }

          final item = dealsController.dealsCellPhone[index];
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
      child: SpinKitFadingCircle(color: AppColors.greyColor, size: 30.sp),
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
