import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/home_deals_card.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/home_banner.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';

class AllProductsScreen extends StatefulWidget {
  const AllProductsScreen({super.key});

  @override
  State<AllProductsScreen> createState() => _AllProductsScreenState();
}

class _AllProductsScreenState extends State<AllProductsScreen>
    with AutomaticKeepAliveClientMixin {
  late final ScrollController _scrollController;
  final RxBool hasReachedBottom = false.obs;
  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;

    /// 🔥 Detect end of MAIN page:
    if (position.extentAfter < 600) {
      hasReachedBottom.value = true;
      if (!productController.isMoreLoadingFor("") &&
          productController.getHasMoreData("")) {
        productController.requestNextPage("");
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    /// Defensive load: if Splash's loadProducts(cateSlug: "") was delayed,
    /// failed, or was skipped, make sure the "All" tab fetches generic
    /// products itself. Empty slug => no slug filter, returns everything.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (productController.allProducts.isEmpty) {
        productController.loadProducts(
          cateSlug: "",
          page: 1,
          isSilentRefresh: true,
          isPagination: false,
        );
      }
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  bool get wantKeepAlive => true;
  final ProductController productController = Get.find<ProductController>();
  final sessionController = Get.find<SessionController>();

  final GetBannerController bannerController = Get.put(GetBannerController());
  DealsController dealsController = Get.put(DealsController());

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      body: Obx(() {
        if (bannerController.banners.value.isNotEmpty) {
          //  return
          //   NestedScrollView(
          //   controller: _outerScrollController,
          //   headerSliverBuilder: (context, innerBoxIsScrolled) => [
          //     // SliverAppBar(
          //     //   pinned: false,
          //     //   floating: false,
          //     //   toolbarHeight: 1.h,
          //     //   expandedHeight: 99.h,
          //     //   backgroundColor: Colors.white,
          //     //   surfaceTintColor: Colors.white,
          //     //   foregroundColor: Colors.white,
          //     //   collapsedHeight: 1.h,
          //     //   flexibleSpace: FlexibleSpaceBar(background: HomeBanner()),
          //     //   systemOverlayStyle: const SystemUiOverlayStyle(
          //     //     statusBarColor: Colors.transparent,
          //     //     statusBarIconBrightness: Brightness.dark,
          //     //     statusBarBrightness: Brightness.light,
          //     //   ),
          //     // ),
          //   ],
          //   body: _buildBody(),
          // );
        }
        return _buildBody();
      }),
    );
  }

  /// Build Body:
  Widget _buildBody() {
    return Obx(
      () => SingleChildScrollView(
        controller: _scrollController,
        physics: BouncingScrollPhysics(),
        child: Column(
          children: [
            bannerController.banners.value.isNotEmpty
                ? SizedBox(
                    height: 120.h,
                    width: MediaQuery.sizeOf(context).width,
                    child: HomeBanner(),
                  )
                : SizedBox(),
            SizedBox(height: 4.h),
            dealsController.dealsRecommended.isEmpty
                ? const SizedBox()
                : Center(
                    child: SizedBox(
                      height: Get.height * 0.28,
                      width: Get.width,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Center(
                            child: Center(
                              child: HomeDealCard(
                                product: dealsController.dealsRecommended[0],
                                index: 0,
                                onTap: () {
                                  Get.toNamed(dealsMainTabs);
                                },
                              ),
                            ),
                          ),
                          SizedBox(width: 10.w),
                          Center(
                            child: Center(
                              child: HomeDealCard(
                                product: dealsController.dealsRecommended[1],
                                index: 1,
                                onTap: () {
                                  Get.toNamed(bestSellerMainScreen);
                                  // Navigate on tap
                                },
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

            SizedBox(height: 2.h),

            _buildStaticContent(),
            _buildProductsGrid(),
            if (productController.isMoreLoadingFor(""))
              Padding(
                padding: EdgeInsets.symmetric(vertical: 20.h),
                child: SpinKitFadingCircle(
                  color: AppColors.greyColor,
                  size: 30.sp,
                ),
              ),
          ],
        ),
      ),
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
      if (productController.isLoadingFor("") &&
          productController.allProducts.isEmpty) {
        return ProductCardShimmer(height: 310.h);
      }
      if (productController.allProducts.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 150.h),
            child: AppTextWidget(text: "noDataFound".tr),
          ),
        );
      }
      return GridView.builder(
        padding: EdgeInsets.only(bottom: 8.h),
        cacheExtent: 3000,
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 3,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.292,
        ),
        itemCount: productController.allProducts.length,
        itemBuilder: (context, index) {
          final item = productController.allProducts[index];
          return ProductCard(
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
