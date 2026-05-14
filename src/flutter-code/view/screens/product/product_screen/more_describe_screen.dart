import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_filtered_data_controller/get_filtered_data_controller.dart';
import 'package:dress_fair_ecommmerce/controller/more_describe_product_controller/more_describe_product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/home_search_bar.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/product_screen/widget/show_filter_sheet.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/floating_cart_icon/floating_cart_icon.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:floating_draggable_widget/floating_draggable_widget.dart';

import '../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class MoreDescribeScreen extends StatefulWidget {
  final int categoryId;
  final String cateSlug;
  const MoreDescribeScreen({
    super.key,
    required this.categoryId,
    required this.cateSlug,
  });
  @override
  State<MoreDescribeScreen> createState() => _MoreDescribeScreenState();
}

class _MoreDescribeScreenState extends State<MoreDescribeScreen> {
  final CategoryController controller = Get.put(CategoryController());
  final AddToCartController addToCartController = Get.put(
    AddToCartController(),
  );
  final SessionController sessionController = Get.find<SessionController>();

  GetFilteredDataController getFilteredDataController = Get.put(
    GetFilteredDataController(),
  );
  MoreDescribeProductController cont = Get.put(MoreDescribeProductController());
  late final ScrollController _scrollController;

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.extentAfter < 300) {
      cont.requestNextPage(widget.cateSlug);
    }
  }

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      cont.moreDescribeProduct.clear();
      log("More Describe == ${widget.cateSlug}");
      cont.getMoreDescribeProducts(cateSlug: widget.cateSlug, page: 1);
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
                40.h.sh,
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10.0.w),
                  child: HomeSearchBar(),
                ),
                4.h.sh,
                StaticTextContainer(text1: '', text2: ''),
                1.h.sh,
                products(),
              ],
            ),
          ),
        ),
      ),
    );
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
                          Container(
                            height: 60.h,
                            width: 60.h,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.grey.shade300,
                                width: 1,
                              ),
                              image: DecorationImage(
                                fit: BoxFit.cover,
                                image:
                                    // (subCategory.image != null &&
                                    //     subCategory.image.isNotEmpty)
                                    // ? NetworkImage(subCategory.image)
                                    // :
                                    AssetImage(AppImages.placeHolder)
                                        as ImageProvider,
                              ),
                            ),
                          ),
                          6.h.sh,
                          SizedBox(
                            width: 75.w,
                            child: AppTextWidget(
                              text: subCategory.name,
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 2,
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

  ///  Products ---
  Widget products() {
    return Obx(() {
      final products = cont.moreDescribeProduct;
      if (cont.isLoading.value) {
        return ProductCardShimmer();
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
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 0,
          mainAxisSpacing: 2,
          childAspectRatio: 0.651,
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

  Widget smallChips() {
    return Obx(
      () => Container(
        height: 50.h,
        // color: Colors.red,
        color: Colors.white,
        width: MediaQuery.sizeOf(context).width,
        child: ListView.builder(
          padding: EdgeInsets.zero,
          scrollDirection: Axis.horizontal,
          itemCount: getFilteredDataController.unifiedFilters.length,
          itemBuilder: (context, index) {
            var item = getFilteredDataController.unifiedFilters[index];
            int selectedCount = 0;
            if (item['type'] != 'sort') {
              final values = item['values'] as List<dynamic>;
              selectedCount = values
                  .where((v) => v['isSelected'] == true)
                  .length;
            }
            return GestureDetector(
              onTapDown: (details) {
                showFilterPopupMenu(
                  context,
                  item,
                  details.globalPosition,
                  widget.cateSlug,
                );
              },
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 8.0.w, vertical: 8.h),
                child: Container(
                  height: 30.h,
                  decoration: BoxDecoration(
                    color: Color(0xffF5F5F5),
                    borderRadius: BorderRadius.circular(30.r),
                  ),
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12.0.w),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        AppTextWidget(
                          text: item['type'] == 'sort'
                              ? item['name']
                                    .toString() // Sort stays static
                              : "${item['name']} ($selectedCount)", // Show selected count
                          //"${item['name'].toString()} (1)",
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w400,
                          maxLines: 1,
                          softWrap: true,
                          color: Colors.black.withOpacity(0.6),
                        ),
                        2.w.sw,
                        GestureDetector(
                          // onTapDown: (details) {
                          //   showFilterPopupMenu(
                          //     context,
                          //     item,
                          //     details.globalPosition,
                          //   );
                          // },
                          child: Padding(
                            padding: EdgeInsets.only(top: 2.0.h),
                            child: Icon(
                              Icons.keyboard_arrow_down_sharp,
                              size: 15.sp,
                              color: Colors.black.withOpacity(0.8),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
