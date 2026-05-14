import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/sub_category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/search_controller/search_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/floating_cart_icon/floating_cart_icon.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:floating_draggable_widget/floating_draggable_widget.dart';

import '../home_products_screen/home_product/widgets/home_search_bar.dart';

class SubCategoryProductScreen extends StatefulWidget {
  String cateSlug;
  SubCategoryProductScreen({super.key, required this.cateSlug});
  @override
  State<SubCategoryProductScreen> createState() =>
      _SubCategoryProductScreenState();
}

class _SubCategoryProductScreenState extends State<SubCategoryProductScreen> {
  SearchBarController searchBarController = Get.put(SearchBarController());
  SessionController sessionController = Get.find<SessionController>();
  final SubCategoryController subCategoryController = Get.put(
    SubCategoryController(),
  );
  late final ScrollController _scrollController;
  final RxBool hasReachedBottom = false.obs;
  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final position = _scrollController.position;
    final maxScroll = position.maxScrollExtent;
    final currentScroll = position.pixels;

    log(
      "Scroll - Current: $currentScroll, Max: $maxScroll, Difference: ${maxScroll - currentScroll}",
    );

    if (maxScroll - currentScroll <= 100.0) {
      final hasMore = subCategoryController.getHasMoreData(widget.cateSlug);
      final isLoading = subCategoryController.isMoreLoading.value;
      final currentPage = subCategoryController.getCurrentPage(widget.cateSlug);

      log(
        "Pagination Trigger - HasMore: $hasMore, IsLoading: $isLoading, CurrentPage: $currentPage, CateSlug: ${widget.cateSlug}",
      );

      if (!isLoading && hasMore) {
        subCategoryController.requestNextPage(widget.cateSlug);
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();

    // Clear previous category data if needed
    WidgetsBinding.instance.addPostFrameCallback((v) {
      subCategoryController.getSubCategoryProducts(
        cateSlug: widget.cateSlug,
        page: 1,
      );
    });

    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(SubCategoryProductScreen oldWidget) {
    super.didUpdateWidget(oldWidget);

    // If category slug changed, fetch new data
    if (oldWidget.cateSlug != widget.cateSlug) {
      subCategoryController.getSubCategoryProducts(
        cateSlug: widget.cateSlug,
        page: 1,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FloatingDraggableWidget(
      floatingWidget: FloatingCartButton(),
      floatingWidgetHeight: 75.h,
      floatingWidgetWidth: 80.w,
      dx: MediaQuery.of(context).size.width - 60.w - 19.w,
      dy: MediaQuery.of(context).size.height * 0.75,
      autoAlign: true,
      mainScreenWidget: Scaffold(
        backgroundColor: Colors.white,
        body: Column(
          children: [
            45.h.sh,
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 10.0.w),
              child: HomeSearchBar(),
            ),
            10.h.sh,
            StaticTextContainer(text1: '', text2: ''),
            10.h.sh,
            ProductFilterBar(
              selectedSort: subCategoryController.selectedSort.value,
              onSortChanged: (value) {
                setState(() {
                  subCategoryController.applySort(value, widget.cateSlug);
                  //cont.selectedNewSort.value = value;
                });
              },
              onFilterTap: () {
                // Open bottom sheet filter
              },
              onColorTap: () {
                // Open color filter
              },
              onSizeTap: () {
                // Open size filter
              },
            ),
            SizedBox(height: 10.h),
            Expanded(child: listViewItem()),
          ],
        ),
      ),
    );
  }

  /// Search Bar:
  // Widget searchBar() {
  //   return GestureDetector(
  //     onTap: () {
  //       Get.toNamed(searchScreen);
  //     },
  //     child: Container(
  //       padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
  //       decoration: BoxDecoration(
  //         color: Colors.white,
  //         border: Border.all(color: Colors.black, width: 0.5.w),
  //         borderRadius: BorderRadius.circular(30.r),
  //       ),
  //       child: Row(
  //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
  //         children: [
  //           Padding(
  //             padding: EdgeInsets.only(right: 5.0.w),
  //             child: AppTextWidget(
  //               text: "search".tr,
  //               color: Colors.black54,
  //               fontSize: 12.sp,
  //             ),
  //           ),
  //           Container(
  //             height: 30.h,
  //             width: 40.w,
  //             decoration: BoxDecoration(
  //               color: Colors.black,
  //               borderRadius: BorderRadius.circular(30.r),
  //             ),
  //             child: Center(
  //               child: Icon(Icons.search, color: Colors.white, size: 22.sp),
  //             ),
  //           ),
  //         ],
  //       ),
  //     ),
  //   );
  // }

  /// ListView Item:
  Widget listViewItem() {
    return Obx(() {
      if (subCategoryController.isLoading.value) {
        return ProductCardShimmer(height: 500.h);
      }

      if (subCategoryController.subCategoryProducts.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 150.0.h),
            child: AppTextWidget(text: AppText.noDataFound),
          ),
        );
      }

      return Column(
        children: [
          Expanded(
            child: GridView.builder(
              controller: _scrollController,
              cacheExtent: 3000,
              padding: EdgeInsets.zero,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 0,
                mainAxisSpacing: 3,
                mainAxisExtent: MediaQuery.sizeOf(context).height * 0.286,
              ),
              itemCount: subCategoryController.subCategoryProducts.length,
              itemBuilder: (context, index) {
                var item = subCategoryController.subCategoryProducts[index];
                return ProductCard(
                  item: item,
                  sessionController: sessionController,
                  fakeRating: 4.5,
                  fakeReviews: 4,
                );
              },
            ),
          ),

          /// Show loading indicator BELOW GridView:
          if (subCategoryController.isMoreLoading.value)
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

class ProductFilterBar extends StatelessWidget {
  final String selectedSort;
  final Function(String) onSortChanged;
  final VoidCallback onFilterTap;
  final VoidCallback onColorTap;
  final VoidCallback onSizeTap;

  const ProductFilterBar({
    super.key,
    required this.selectedSort,
    required this.onSortChanged,
    required this.onFilterTap,
    required this.onColorTap,
    required this.onSizeTap,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          // 🔹 FILTERS
          _chipButton(icon: Icons.tune, text: "Filters", onTap: onFilterTap),

          // 🔹 SORT BY DROPDOWN
          PopupMenuButton<String>(
            onSelected: onSortChanged,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.r),
            ),
            itemBuilder: (context) => [
              _menuItem("Clear"),
              _menuItem("New Arrival"),
              _menuItem("Popular"),
              _menuItem("Price: Low to High"),
              _menuItem("Price: High to Low"),
            ],
            child: _chipButton(text: "Sort by: $selectedSort", showArrow: true),
          ),

          // 🔹 COLOR
          _chipButton(text: "Color", onTap: onColorTap),

          // 🔹 SIZE
          _chipButton(text: "Size", onTap: onSizeTap),
        ],
      ),
    );
  }

  PopupMenuItem<String> _menuItem(String text) {
    return PopupMenuItem(
      value: text,
      child: AppTextWidget(
        text: text,
        fontSize: 11.sp,
        fontWeight: FontWeight.w400,
      ),
    );
  }

  Widget _chipButton({
    IconData? icon,
    required String text,
    bool showArrow = false,
    VoidCallback? onTap,
  }) {
    return Padding(
      padding: EdgeInsets.only(right: 10.w),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(30.r),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: text.contains(selectedSort)
                ? Colors.grey.shade200
                : Colors.grey.shade100,
            //Colors.grey.shade100,
            borderRadius: BorderRadius.circular(30.r),
          ),
          child: Row(
            children: [
              if (icon != null) ...[
                Icon(icon, size: 18.sp),
                SizedBox(width: 6.w),
              ],
              AppTextWidget(
                text: text,
                fontSize: 11.sp,
                color:
                    //text.contains(selectedSort)
                    //  ? Colors.white
                    //    :
                    Colors.black,
                fontWeight: FontWeight.w400,
              ),
              if (showArrow) ...[
                SizedBox(width: 4.w),
                const Icon(Icons.keyboard_arrow_down),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
