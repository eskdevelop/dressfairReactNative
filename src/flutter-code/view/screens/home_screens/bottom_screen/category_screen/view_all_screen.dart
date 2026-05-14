import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_filtered_data_controller/get_filtered_data_controller.dart';
import 'package:dress_fair_ecommmerce/controller/more_describe_product_controller/more_describe_product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/home_search_bar.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/floating_cart_icon/floating_cart_icon.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:floating_draggable_widget/floating_draggable_widget.dart';

import '../../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class ViewAllScreen extends StatefulWidget {
  final String cateSlug;
  const ViewAllScreen({super.key, required this.cateSlug});
  @override
  State<ViewAllScreen> createState() => _ViewAllScreenState();
}

class _ViewAllScreenState extends State<ViewAllScreen> {
  final CategoryController controller = Get.put(CategoryController());
  final AddToCartController addToCartController = Get.put(
    AddToCartController(),
  );
  final SessionController sessionController = Get.find<SessionController>();

  final ScrollController _scrollController = ScrollController();
  GetFilteredDataController getFilteredDataController = Get.put(
    GetFilteredDataController(),
  );
  MoreDescribeProductController cont = Get.put(MoreDescribeProductController());
  final RxBool hasReachedBottom = false.obs;
  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;

    /// 🔥 Detect end of MAIN page:
    if (position.extentAfter < 600) {
      hasReachedBottom.value = true;
      if (!cont.isMoreLoading.value && cont.getHasMoreData("")) {
        cont.requestNextPage(widget.cateSlug);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _scrollController.addListener(_onScroll);
      Future.wait([
        // getFilteredDataController.getFilteredData(
        //   categoryId: widget.categoryId,
        // ),
        // cont.loadMoreDescribeProducts(cateSlug: widget.cateSlug, page: 1),
        cont.getMoreDescribeProducts(cateSlug: widget.cateSlug, page: 1),
      ]);
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    getFilteredDataController.clearAllSelections();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      return FloatingDraggableWidget(
        floatingWidget: FloatingCartButton(),
        floatingWidgetHeight: 75.h,
        floatingWidgetWidth: 80.w,
        dx: MediaQuery.of(context).size.width - 60.w - 19.w,
        dy: MediaQuery.of(context).size.height * 0.75,
        autoAlign: true,
        mainScreenWidget: Scaffold(
          backgroundColor: Colors.white,
          body: AnimatedSwitcher(
            duration: const Duration(milliseconds: 400),
            child: SingleChildScrollView(
              controller: _scrollController,
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  50.h.sh,
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10.0.w),
                    child: HomeSearchBar(),
                  ),
                  //  10.h.sh,
                  relatedCategories(),
                  Divider(
                    color: Colors.black.withOpacity(0.05),
                    thickness: 5.w,
                  ),
                  SizedBox(height: 3.h),
                  ProductFilterBar(
                    selectedSort: cont.selectedNewSort.value,
                    onSortChanged: (value) {
                      setState(() {
                        cont.applySort(value, widget.cateSlug);
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
                  SizedBox(height: 7.h),
                  // getFilteredDataController.isLoading.value
                  //     ? FilterRowShimmer()
                  //     : smallChips(),
                  // StaticTextContainer(text1: "", text2: ""),
                  // 4.h.sh,
                  products(),

                  // 🆕 Show loading indicator at bottom when loading more:
                  //  if (cont.isLoading.value)
                  // Padding(
                  //   padding: EdgeInsets.symmetric(
                  //     horizontal: 16.0.w,
                  //     vertical: 16.h,
                  //   ),
                  //   child: Center(
                  //     child: SpinKitFadingCircle(
                  //       color: AppColors.greyColor,
                  //       size: 40.0.sp,
                  //     ),
                  //   ),
                  // ),
                  // Show end of list message:
                  if (!cont.hasMoreData.value &&
                      cont.moreDescribeProduct.isNotEmpty)
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 16.0.w,
                        vertical: 16.h,
                      ),
                      child: Center(
                        child: AppTextWidget(
                          text: "No more products to load",
                          fontWeight: FontWeight.w400,
                          fontSize: 12.sp,
                          color: Colors.black.withOpacity(0.7),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    });
  }

  /// --- Related Categories ---
  Widget relatedCategories() {
    return Obx(() {
      final selected = controller.selectedCategory.value;
      if (selected == null) return const SizedBox();
      final subCategories = selected.subCategories;
      return Padding(
        padding: EdgeInsets.symmetric(horizontal: 10.0.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            6.h.sh,
            SizedBox(
              height: 100.h,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: subCategories.length,
                padding: EdgeInsets.zero,
                itemBuilder: (context, index) {
                  var subCategory = subCategories[index];
                  return GestureDetector(
                    onTap: () {
                      log("Cate Slug == ${subCategory.name}");
                      Get.toNamed(
                        subCategoryProductScreen,
                        arguments: {"cateSlug": subCategory.name},
                      );
                    },
                    child: Padding(
                      padding: EdgeInsets.only(right: 10.w),
                      child: Column(
                        children: [
                          8.h.sh,
                          Container(
                            height: 60.h,
                            width: 60.h,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.grey.shade200,
                            ),
                            child: ClipOval(
                              child:
                                  SimpleMethode.isSupportedFormat(
                                    "${SimpleMethode.imageUrl}/${subCategory.image}",
                                    //"https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com/productimages/6934413bdb914_A-08-7.jpg",
                                  )
                                  ? CachedNetworkImage(
                                      memCacheWidth: 300,
                                      fadeInDuration: Duration(
                                        milliseconds: 10,
                                      ),
                                      imageUrl:
                                          "${SimpleMethode.imageUrl}/${subCategory.image}",
                                      //imageUrl ?? "",
                                      fit: BoxFit.cover,
                                      // placeholder: (context, url) => Center(
                                      //   child: CircularProgressIndicator(
                                      //     strokeWidth: 1.w,
                                      //     color: AppColors.primaryColor,
                                      //   ),
                                      // ),
                                      errorWidget: (context, url, error) {
                                        log("Error == ${error.toString()}");
                                        return Center(
                                          child: SvgPicture.asset(
                                            color: Colors.red,
                                            height: 80.h,
                                            AppImages.placeHolder,
                                          ),
                                        );
                                      },
                                    )
                                  : Container(
                                      color: Colors.grey[200],
                                      child: const Icon(
                                        Icons.image_not_supported,
                                        color: Colors.grey,
                                      ),
                                    ),
                            ),
                          ),
                          8.h.sh,
                          SizedBox(
                            width: 75.w,
                            child: AppTextWidget(
                              text:
                                  sessionController.selectedLanguageCode == "ar"
                                  ? subCategory.nameAr
                                  : subCategory.name,
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.w400,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    });
  }

  /// --- Related Products ---
  Widget products() {
    return Obx(() {
      final products = cont.moreDescribeProduct;
      if (cont.isLoading.value) {
        return ProductCardShimmer(height: 510.h);
      }
      if (products.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 300.0.h),
            child: AppTextWidget(text: "noDataFound".tr),
          ),
        );
      }
      return GridView.builder(
        cacheExtent: 3000,
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 2,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.286,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          var item = products[index];

          return GestureDetector(
            onTap: () {
              log("CateSlug == ${item.name}");
              Get.offNamed(
                productDetailScreen,
                arguments: {
                  "cateSlug": item.productSku,
                  "categoryId": int.tryParse(item.productId.toString()) ?? 0,
                  "fakeReviews": 4,
                  "fakeRating": 4.5,
                  //item.productId,
                },
              );
            },
            child: ProductCard(
              item: item,
              sessionController: sessionController,
              fakeRating: 4.5,
              fakeReviews: 4,
            ),
          );
        },
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
