import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../util/widgets/product_cart/deals_cart.dart';

class DealsWomenLingeries extends StatefulWidget {
  const DealsWomenLingeries({super.key});

  @override
  State<DealsWomenLingeries> createState() => _DealsWomenLingeriesState();
}

class _DealsWomenLingeriesState extends State<DealsWomenLingeries>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final dealsController = Get.find<DealsController>();
  final sessionController = Get.find<SessionController>();

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (dealsController.dealsWLingerie.isEmpty) {
        dealsController.getDeals(
          cateSlug: "Women Lingeries",
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
          _buildProductGridWithLoader(),
        ],
      ),
    );
  }

  Widget _buildProductGridWithLoader() {
    return Obx(() {
      return Expanded(
        child: Column(
          children: [
            Expanded(child: _buildProductGrid()),

            if (dealsController.isMoreLoading.value)
              _buildBottomLoadingIndicator(),

            // if (!dealsController.getHasMoreData("w-lingerie") &&
            //     dealsController.getCategoryList("w-lingerie").isNotEmpty)
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
      if (dealsController.dealsWLingerie.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }

      return GridView.builder(
        cacheExtent: 3000,
        padding: EdgeInsets.only(bottom: 8.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 3,
          //  childAspectRatio: 0.63,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.4,
        ),
        itemCount:
            dealsController.dealsWLingerie.length +
            (dealsController.isMoreLoading.value ? 1 : 0),
        itemBuilder: (context, index) {
          // loader cell
          if (index == dealsController.dealsWLingerie.length &&
              dealsController.dealsWLingerie.isNotEmpty) {
            return Center(
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            );
          }

          // 🔥 last item triggers pagination
          if (index == dealsController.dealsWLingerie.length - 1) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              dealsController.requestNextPage("Women Lingeries");
            });
          }

          final item = dealsController.dealsWLingerie[index];
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
