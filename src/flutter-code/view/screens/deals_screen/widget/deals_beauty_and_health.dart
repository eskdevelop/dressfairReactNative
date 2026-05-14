import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/product_cart/deals_cart.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class DealsBeautyAndHealth extends StatefulWidget {
  const DealsBeautyAndHealth({super.key});

  @override
  State<DealsBeautyAndHealth> createState() => _DealsBeautyAndHealthState();
}

class _DealsBeautyAndHealthState extends State<DealsBeautyAndHealth>
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
      if (dealsController.dealsBeautyHealth.isEmpty) {
        dealsController.getDeals(
          cateSlug: "Beauty & Health",
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
    super.build(context);
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

            // if (!dealsController.getHasMoreData("Beauty-health") &&
            //     dealsController.getCategoryList("Beauty-health").isNotEmpty)
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

      if (dealsController.dealsBeautyHealth.isEmpty) {
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
            dealsController.dealsBeautyHealth.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          // Loader cell
          if (index == dealsController.dealsBeautyHealth.length &&
              dealsController.dealsBeautyHealth.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }

          final item = dealsController.dealsBeautyHealth[index];
          // final double fakeRating = SimpleMethode().getRandomRating();
          // final int fakeReviews = SimpleMethode().getRandomReviews();

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
