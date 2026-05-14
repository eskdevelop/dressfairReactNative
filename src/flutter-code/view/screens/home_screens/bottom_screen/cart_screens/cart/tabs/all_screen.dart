import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AllScreen extends StatefulWidget {
  const AllScreen({super.key});

  @override
  State<AllScreen> createState() => _AllScreenState();
}

class _AllScreenState extends State<AllScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final ProductController productController = Get.find<ProductController>();
  SessionController sessionController = Get.find<SessionController>();
  // final _scrollController = ScrollController();
  //
  // void _onScroll() {
  //   if (!_scrollController.hasClients) return;
  //
  //   final position = _scrollController.position;
  //   final threshold = position.maxScrollExtent * 0.95;
  //
  //   final currentPage = productController.getCurrentPage(""); // "" for All tab
  //   final hasMore = productController.getHasMoreData("");
  //
  //   if (position.pixels >= threshold &&
  //       !productController.isMoreLoading.value &&
  //       hasMore) {
  //     log("User reached 95% of the screen - loading more products");
  //     // productController.getProducts(
  //     //   cateSlug: "",
  //     //   page: currentPage + 1,
  //     //   isPagination: true,
  //     // );
  //   }
  // }
  //
  // @override
  // void dispose() {
  //   _scrollController.removeListener(_onScroll);
  //   _scrollController.dispose();
  //   super.dispose();
  // }
  //
  // @override
  // void initState() {
  //   super.initState();
  //   _scrollController.addListener(_onScroll);
  //
  //   WidgetsBinding.instance.addPostFrameCallback((v) {
  //     // 🆕 Reset current page when loading initial data
  //
  //     // if (productController.allProducts.isEmpty) {
  //     //   log("All Product Running");
  //     //   productController.loadProducts(
  //     //     cateSlug: "",
  //     //     page: 1,
  //     //     isSilentRefresh: true,
  //     //   );
  //     // }
  //   });
  // }

  late final ScrollController _scrollController;
  final RxBool hasReachedBottom = false.obs;

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;

    /// 🔥 Detect end of MAIN page:
    if (position.extentAfter < 600) {
      hasReachedBottom.value = true;

      if (!productController.isMoreLoading.value &&
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
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(child: _buildProductGridWithLoader()),
    );
  }

  Widget _buildProductGridWithLoader() {
    return Obx(() {
      return Column(
        children: [
          // 🆕 Main product grid
          Expanded(child: _buildProductGrid()),

          // 🆕 Loading indicator at the bottom:
          if (productController.isMoreLoading.value)
            _buildBottomLoadingIndicator(),

          // 🆕 End of list message :
          if (!productController.getHasMoreData("") &&
              productController.getCategoryList("").isNotEmpty)
            _buildEndOfListMessage(),
        ],
      );
    });
  }

  Widget _buildProductGrid() {
    return Obx(() {
      // Initial loading state
      if (productController.isLoading.value &&
          productController.allProducts.isEmpty) {
        return ProductCardShimmer();
      }

      // Empty state
      if (productController.allProducts.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 30.0.h),
            child: AppTextWidget(text: "noDataFound".tr),
          ),
        );
      }

      /// Product grid:
      return GridView.builder(
        controller: _scrollController,
        cacheExtent: 3000,
        physics: const BouncingScrollPhysics(),
        padding: EdgeInsets.only(bottom: 8.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 3,
          crossAxisSpacing: 0,
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

  Widget _buildBottomLoadingIndicator() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 20.h),
      color: Colors.white,
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

  Widget _buildEndOfListMessage() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 20.h),
      color: Colors.white,
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
