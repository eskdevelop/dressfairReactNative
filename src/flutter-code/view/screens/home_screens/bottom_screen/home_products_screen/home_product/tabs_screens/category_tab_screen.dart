import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/category_model/category_model.dart';
import 'package:dress_fair_ecommmerce/model/main_product_model/main_product_model.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

/// Generic category tab. Loads & paginates products for a single category
/// using its `slug` (e.g. `w-shoes`, `cell-phone-accessories`). Replaces the
/// 12 near-identical per-category tab widgets.
class CategoryTabScreen extends StatefulWidget {
  final CategoryModel category;

  const CategoryTabScreen({super.key, required this.category});

  @override
  State<CategoryTabScreen> createState() => _CategoryTabScreenState();
}

class _CategoryTabScreenState extends State<CategoryTabScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  late final ScrollController _scrollController;
  final ProductController productController = Get.find<ProductController>();
  final SessionController sessionController = Get.find<SessionController>();

  /// Resolved once outside any Obx closure so the build does NOT
  /// subscribe to `productsBySlug` (which `listFor` mutates on first
  /// access via `putIfAbsent`).
  late final RxList<MainProductModel> _list;
  late final String _slug;

  @override
  void initState() {
    super.initState();
    _slug = (widget.category.slug ?? '').trim();
    _list = productController.listFor(_slug);
    _scrollController = ScrollController()..addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_list.isEmpty) {
        productController.loadProducts(
          cateSlug: _slug,
          page: 1,
          isSilentRefresh: true,
          isPagination: false,
        );
      }
    });
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.extentAfter < 300) {
      productController.requestNextPage(_slug);
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
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
          Expanded(child: _buildGridWithOutsideLoader()),
        ],
      ),
    );
  }

  Widget _buildGridWithOutsideLoader() {
    return Obx(() {
      /// Per-slug loading flags — Obx subscribes only to this slug's
      /// entry, so loading other categories no longer rebuilds this tab.
      final loading = productController.isLoadingFor(_slug);
      final moreLoading = productController.isMoreLoadingFor(_slug);

      if (loading && _list.isEmpty) {
        return ProductCardShimmer(height: 310.h);
      }

      if (_list.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 150.h),
            child: AppTextWidget(text: "No products found"),
          ),
        );
      }

      return Column(
        children: [
          Expanded(
            child: GridView.builder(
              controller: _scrollController,
              cacheExtent: 3000,
              padding: EdgeInsets.only(bottom: 8.h),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 3,
                crossAxisSpacing: 0,
                mainAxisExtent: MediaQuery.sizeOf(context).height * 0.292,
              ),
              itemCount: _list.length,
              itemBuilder: (context, index) {
                final item = _list[index];
                return ProductCard(
                  item: item,
                  sessionController: sessionController,
                  fakeRating: 4.5,
                  fakeReviews: 4,
                );
              },
            ),
          ),
          if (moreLoading)
            Padding(
              padding: EdgeInsets.symmetric(vertical: 16.h),
              child: SpinKitFadingCircle(
                color: AppColors.greyColor,
                size: 30.sp,
              ),
            ),
        ],
      );
    });
  }
}
