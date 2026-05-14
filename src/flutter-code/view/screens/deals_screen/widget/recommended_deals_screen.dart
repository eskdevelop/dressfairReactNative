import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/product_cart/deals_cart.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';

class RecommendedDealsScreen extends StatefulWidget {
  const RecommendedDealsScreen({super.key});

  @override
  State<RecommendedDealsScreen> createState() => _RecommendedDealsScreenState();
}

class _RecommendedDealsScreenState extends State<RecommendedDealsScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final dealsController = Get.find<DealsController>();
  final sessionController = Get.find<SessionController>();
  final GetBannerController bannerController = Get.put(GetBannerController());

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      if (dealsController.dealsRecommended.isEmpty) {
        dealsController.getDeals(cateSlug: "", page: 1);
      }
    });

    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(body: _buildBody());
  }

  /// Build Body:
  Widget _buildBody() {
    return Column(
      children: [
        _buildStaticContent(),
        Expanded(child: _buildProductsGrid()),
      ],
    );
  }

  Widget _buildStaticContent() {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          2.h.sh,
          StaticTextContainer(text1: "", text2: ""),
          2.h.sh,
        ],
      ),
    );
  }

  Widget _buildProductsGrid() {
    return Obx(() {
      if (dealsController.isLoading.value) {
        return Center(child: SpinLoadingBar());

        //ProductCardShimmer(height: 310.h);
      }

      if (dealsController.dealsRecommended.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }

      return GridView.builder(
        padding: EdgeInsets.only(bottom: 8.h),
        cacheExtent: 3000,
        physics: const BouncingScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          // childAspectRatio: 0.65,
          //childAspectRatio: 0.63,
          mainAxisSpacing: 3,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.4,
        ),
        itemCount:
            dealsController.dealsRecommended.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == dealsController.dealsRecommended.length &&
              dealsController.dealsRecommended.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }
          final item = dealsController.dealsRecommended[index];
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
}
