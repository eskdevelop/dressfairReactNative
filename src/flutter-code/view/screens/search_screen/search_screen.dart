import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/recent_search_controller/recent_search_controller.dart';
import 'package:dress_fair_ecommmerce/controller/search_controller/search_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shimer_effect/search_screen_shimmer_effect.dart';

import '../../../controller/simple_method/simple_methode.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  SearchBarController searchBarController = Get.put(SearchBarController());
  SessionController sessionController = Get.find<SessionController>();
  CategoryController categoryController = Get.find<CategoryController>();
  RecentSearchController searchController = Get.put(RecentSearchController());
  final _scrollController = ScrollController();
  void _onScroll() {
    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
          _scrollController.position.maxScrollExtent - 300) {
        if (searchBarController.isPopularMode.value) {
          // 🔵 load more popular items
          searchBarController.loadMorePopularResults(
            cateSlug: searchBarController.searchController.value.text,
          );
        } else {
          // 🔴 load more keyword search results
          searchBarController.loadMoreSearchData(
            keyword: searchBarController.searchController.value.text.trim(),
          );
        }
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
  void initState() {
    _scrollController.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((v) {
      searchBarController.isBack.value = false;
      searchBarController.searchController.value.clear();
      searchBarController.suggestions.clear();
      searchBarController.searchResult.clear();
      if (searchController.recentSearch.isEmpty) {
        searchController.loadRecentSearches();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        if (searchBarController.isBack.value &&
            searchBarController.searchController.value.text.isEmpty) {
          return true;
        } else {
          searchBarController.searchController.value.clear();
          searchBarController.suggestions.clear();
          searchBarController.searchResult.clear();
          searchBarController.isBack.value = true;
          return false;
        }
      },
      child: Obx(() {
        return searchBarController.isLoading.value
            ? SearchScreenShimmer()
            : Scaffold(
                resizeToAvoidBottomInset: true,
                backgroundColor: Colors.white,
                body: SingleChildScrollView(
                  child: SizedBox(
                    height: MediaQuery.sizeOf(context).height,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        50.h.sh,
                        Row(
                          children: [
                            GestureDetector(
                              onTap: () {
                                if (searchBarController.isBack.value &&
                                    searchBarController
                                        .searchController
                                        .value
                                        .text
                                        .isEmpty) {
                                  Get.back();
                                } else {
                                  searchBarController.searchController.value
                                      .clear();
                                  searchBarController.suggestions.clear();
                                  searchBarController.searchResult.clear();
                                  searchBarController.isBack.value = true;
                                  Get.back();
                                }
                              },
                              child: SizedBox(
                                height: 42.h,
                                width: 47.w,
                                //color: Colors.red,
                                child: Padding(
                                  padding: EdgeInsets.only(left: 0.0.w),
                                  child: Icon(
                                    size: 18.sp,
                                    Icons.arrow_back_ios_new,
                                    color: Colors.black.withOpacity(0.8),
                                  ),
                                ),
                              ),
                            ),
                            searchBar(),
                          ],
                        ),

                        /// Recent List :
                        Obx(() {
                          return searchBarController.searchResult.isNotEmpty
                              ? SizedBox()
                              : Visibility(
                                  visible:
                                      searchBarController.suggestions.isEmpty &&
                                      searchController.recentSearch.isNotEmpty,
                                  child: Padding(
                                    padding: EdgeInsets.only(
                                      left: 16.0.w,
                                      top: 20.w,
                                      bottom: 5.h,
                                    ),
                                    child: AppTextWidget(
                                      text: "recentlySearched".tr,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13.sp,
                                      color: Colors.black,
                                    ),
                                  ),
                                );
                        }),

                        Obx(
                          () => searchBarController.searchResult.isNotEmpty
                              ? SizedBox()
                              : Visibility(
                                  visible:
                                      searchBarController.suggestions.isEmpty &&
                                      searchController.recentSearch.isNotEmpty,
                                  child: recentSearchListItem(),
                                ),
                        ),

                        ///popular list :
                        Obx(() {
                          return searchBarController.searchResult.isNotEmpty
                              ? SizedBox()
                              : Visibility(
                                  visible:
                                      searchBarController.suggestions.isEmpty,
                                  child: Padding(
                                    padding: EdgeInsets.only(
                                      left: 16.0.w,
                                      top: 20.w,
                                      bottom: 5.h,
                                      right: 16,
                                    ),
                                    child: AppTextWidget(
                                      text: "popularRightNow".tr,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13.sp,
                                      color: Colors.black,
                                    ),
                                  ),
                                );
                        }),
                        Obx(() {
                          return searchBarController.searchResult.isNotEmpty
                              ? SizedBox()
                              : Visibility(
                                  visible:
                                      searchBarController.suggestions.isEmpty,
                                  child: popularListItem(),
                                );
                        }),
                        Obx(() {
                          return searchBarController.searchResult.isNotEmpty
                              ? SizedBox()
                              : Visibility(
                                  visible: searchBarController
                                      .suggestions
                                      .isNotEmpty,
                                  child: suggestionsList(),
                                );
                        }),

                        /// Product Item Grid:
                        Obx(
                          () => Visibility(
                            visible:
                                searchBarController.searchResult.isNotEmpty,
                            child: Padding(
                              padding: EdgeInsets.only(top: 10.0.h),
                              child: listViewItem(),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
      }),
    );
  }

  Widget searchBar() {
    return Obx(
      () => Padding(
        padding: EdgeInsets.only(right: 10.0.w),
        child: Container(
          height: 42.h,
          width: MediaQuery.sizeOf(context).width * 0.84,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(30.r),
            border: Border.all(
              color: Colors.black.withOpacity(0.6),
              width: 1.w,
            ),
          ),
          child: Row(
            children: [
              10.w.sw,
              SizedBox(
                width: MediaQuery.sizeOf(context).width * 0.54,
                child: TextField(
                  cursorColor: AppColors.primaryColor,
                  style: TextStyle(
                    fontSize: 13.sp,
                    color: Colors.black,
                    fontFamily: "Inter",
                    fontWeight: FontWeight.w400,
                  ),
                  controller: searchBarController.searchController.value,
                  onChanged: (val) {
                    if (val.isNotEmpty) {
                      searchBarController.getSearchSuggestion(query: val);
                    } else {
                      searchBarController.suggestions.clear();
                      searchBarController.searchResult.clear();
                    }
                  },
                  onSubmitted: (va) {
                    log("Search On OnSubmit== ");
                    searchBarController.isPopularMode.value = false;
                    searchBarController.suggestions.clear();
                    searchBarController.searchResult.clear();
                    searchBarController.fetchSearchResults(
                      keyword: searchBarController.searchController.value.text
                          .toString(),
                    );

                    searchController.addRecentSearch(va);
                  },
                  decoration: InputDecoration(
                    hintText: AppText.search,
                    hintStyle: TextStyle(
                      color: Colors.black.withOpacity(0.6),
                      fontWeight: FontWeight.w500,
                      fontSize: 14.sp,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15.r),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12.w,
                      vertical: 10.h,
                    ),
                  ),
                ),
              ),

              GestureDetector(
                onTap: () {},
                child: Icon(
                  Icons.camera_alt,
                  size: 28.sp,
                  color: Colors.transparent,
                  //Colors.black
                ),
              ),
              10.w.sw,
              GestureDetector(
                onTap: () {
                  Get.offNamed(
                    moreDescribeScreen,
                    arguments: {
                      "categoryId": 0,
                      "cateSlug": searchBarController
                          .searchController
                          .value
                          .text
                          .toString(),
                    },
                  );
                  searchBarController.fetchSearchResults(
                    keyword: searchBarController.searchController.value.text
                        .toString(),
                  );
                },
                child: Container(
                  height: 30.h,
                  width: 42.w,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(15.r),
                  ),
                  child: Center(
                    child: Icon(Icons.search, color: Colors.white, size: 22.sp),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Suggestions List:
  Widget suggestionsList() {
    return Obx(() {
      return Expanded(
        child: ListView.separated(
          padding: EdgeInsets.zero,
          itemCount: searchBarController.suggestions.length,
          separatorBuilder: (context, index) =>
              Divider(color: Colors.grey.shade300, thickness: 1, height: 1.h),
          itemBuilder: (context, index) {
            final item = searchBarController.suggestions[index];
            return GestureDetector(
              onTap: () async {
                searchBarController.suggestions.clear();
                searchBarController.searchResult.clear();
                await searchBarController.fetchSearchResults(
                  keyword: item.name,
                );
              },
              child: ListTile(
                dense: true,
                leading: Icon(Icons.search, color: Colors.grey.shade700),
                title: Text(
                  item.name,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w400,
                    color: Colors.black,
                  ),
                ),
                onTap: () {
                  /// :===== //// ==   ////   :
                  log("Search Result Sku == ${item.sku}");
                  Get.offNamed(
                    productDetailScreen,
                    arguments: {
                      "cateSlug": item.sku ?? "",
                      "categoryId": 0,
                      "fakeReviews": 4,
                      "fakeRating": 4.5,
                    },
                  );

                  ///
                  // Get.offNamed(
                  //   moreDescribeScreen,
                  //   arguments: {"categoryId": 0, "cateSlug": item?.sku ?? ""},
                  // );
                  searchBarController.searchController.value.text = item.name;
                  searchBarController.suggestions.clear();
                },
              ),
            );
          },
        ),
      );
    });
  }

  ///Search Result:
  Widget listViewItem() {
    return Obx(() {
      return searchBarController.isLoading.value
          ? Center(
              child: Padding(
                padding: EdgeInsets.only(top: 300.0.h),
                child: CircularProgressIndicator(color: AppColors.primaryColor),
              ),
            )
          : searchBarController.searchResult.isEmpty
          ? Center(
              child: Padding(
                padding: EdgeInsets.only(top: 100.0.h),
                child: AppTextWidget(text: AppText.noDataFound),
              ),
            )
          : Padding(
              padding: EdgeInsets.symmetric(horizontal: 2.0.w),
              child: SizedBox(
                // color: Colors.red,
                height: MediaQuery.sizeOf(context).height * 0.86,
                child: GridView.builder(
                  controller: _scrollController,
                  cacheExtent: 3000,
                  scrollDirection: Axis.vertical,
                  padding: EdgeInsets.zero,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 0,
                    mainAxisSpacing: 2,
                    childAspectRatio: 0.6,
                  ),
                  itemCount:
                      searchBarController.searchResult.length +
                      (searchBarController.isFetchingMore.value ? 1 : 0),
                  itemBuilder: (context, index) {
                    // final double fakeRating = SimpleMethode().getRandomRating();
                    // final int fakeReviews = SimpleMethode().getRandomReviews();
                    if (index == searchBarController.searchResult.length) {
                      return SizedBox(
                        width: double.infinity,
                        child: Center(
                          child: Padding(
                            padding: EdgeInsets.only(left: 140.0.w),
                            child: SpinKitFadingCircle(
                              color: AppColors.greyColor,
                              size: 40.0.sp,
                            ),
                          ),
                        ),
                      );
                    }
                    var item = searchBarController.searchResult[index];
                    return GestureDetector(
                      onTap: () {
                        log("CateSLug in Product Screen == ${item.model}");
                        searchController.addRecentSearch(item.model);
                        Get.toNamed(
                          productDetailScreen,
                          arguments: {
                            "cateSlug": item.slug,
                            "categoryId":
                                int.tryParse(item.productId.toString()) ?? 0,
                            "fakeReviews": 4,
                            "fakeRating": 4.5,
                            //item.productId,
                          },
                        );
                      },
                      child: SizedBox(),
                      // ProductCard(
                      //   item: item,
                      //   sessionController: sessionController,
                      //   fakeRating: fakeRating fakeReviews: fakeReviews,
                      // ),
                    );
                  },
                ),
              ),
            );
    });
  }

  ///Popular List Item:
  Widget popularListItem() {
    return Obx(() {
      return Expanded(
        child: ListView.separated(
          padding: EdgeInsets.zero,
          itemCount: categoryController.categories.length,
          separatorBuilder: (context, index) =>
              Divider(color: Colors.grey.shade300, thickness: 1, height: 1.h),
          itemBuilder: (context, index) {
            final item = categoryController.categories[index];
            return GestureDetector(
              onTap: () async {
                log("Tapped Popular List");
                searchBarController.suggestions.clear();
                searchBarController.searchResult.clear();
                searchBarController.isFetchingMore.value = false;
                searchBarController.isPopularMode.value = true;
                searchBarController.currentPage.value = 1;
                searchBarController.totalPage.value = 0;
                log("Catelog SLug == ${item.slug}");
                log("Catelog SLug == ${item.id}");
                Get.offNamed(
                  moreDescribeScreen,
                  arguments: {
                    "categoryId": item.id ?? 0,
                    "cateSlug": item.slug ?? "",
                  },
                );
                // searchBarController.fetchSearchResultPopular(
                //   cateSlug: item?.slug ?? "",
                //   page: searchBarController.currentPage.value,
                //   isPagination: false,
                //   // isSilentRefresh: isSilentRefresh,
                // );
              },
              child: ListTile(
                visualDensity: const VisualDensity(
                  horizontal: -4,
                  vertical: -2,
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 9.w),
                dense: true,
                leading: ClipOval(
                  child: SvgPicture.asset(
                    width: 20.w,
                    height: 20.h,
                    AppImages.logo,
                  ),

                  // SimpleMethode.isSupportedFormat(
                  //   "${SimpleMethode.imageUrl}/${item.image ?? ""}",
                  // )
                  // ? CachedNetworkImage(
                  //     memCacheWidth: 300,
                  //     imageUrl:
                  //         "${SimpleMethode.imageUrl}/${item.image ?? ""}",
                  //     width: 30.w,
                  //     height: 30.h,
                  //     fit: BoxFit.cover,
                  //     fadeInDuration: const Duration(milliseconds: 200),
                  //     errorWidget: (context, url, error) {
                  //       log("Error == ${error.toString()}");
                  //       return Container(
                  //         width: 20,
                  //         height: 20,
                  //         decoration: const BoxDecoration(
                  //           color: Colors.red,
                  //           shape: BoxShape.circle,
                  //         ),
                  //         child: const Icon(
                  //           Icons.error,
                  //           color: Colors.white,
                  //           size: 12,
                  //         ),
                  //       );
                  //     },
                  //   )
                  // : Container(
                  //     color: Colors.grey[200],
                  //     child: const Icon(
                  //       Icons.image_not_supported,
                  //       color: Colors.grey,
                  //     ),
                  //   ),
                ),
                title: AppTextWidget(
                  text: item.name,
                  fontWeight: FontWeight.w500,
                  fontSize: 13.sp,
                  color: Colors.black,
                ),
                //Text(item.name),
              ),
            );
          },
        ),
      );
    });
  }

  Widget recentSearchListItem() {
    return Obx(() {
      return SizedBox(
        height: searchController.recentSearch.length == 1
            ? MediaQuery.sizeOf(context).height * 0.05
            : searchController.recentSearch.length == 2
            ? MediaQuery.sizeOf(context).height * 0.1
            : MediaQuery.sizeOf(context).height * 0.16,

        child: ListView.separated(
          padding: EdgeInsets.zero,
          itemCount: searchController.recentSearch.length,
          separatorBuilder: (context, index) =>
              Divider(color: Colors.grey.shade300, thickness: 1, height: 1.h),
          itemBuilder: (context, index) {
            final item = searchController.recentSearch[index];
            return ListTile(
              onTap: () async {
                searchBarController.currentPage.value = 1;
                searchBarController.totalPage.value = 1;
                searchBarController.isPopularMode.value = false;
                searchBarController.suggestions.clear();
                searchBarController.searchResult.clear();
                searchBarController.searchController.value.text = item;
                searchBarController.fetchSearchResults(
                  keyword: searchBarController.searchController.value.text
                      .trim(),
                );

                //
              },
              visualDensity: const VisualDensity(
                horizontal: -4,
                vertical: -2,
              ), // 👈 reduce space
              contentPadding: EdgeInsets.symmetric(horizontal: 9.w),
              dense: true,
              leading: ClipOval(
                child:
                    SimpleMethode.isSupportedFormat(
                      "${SimpleMethode.imageUrl}/${sessionController.countryConfig.value?.storeLogo ?? ""}",
                    )
                    ? CachedNetworkImage(
                        memCacheWidth: 300,
                        imageUrl:
                            "${SimpleMethode.imageUrl}/${sessionController.countryConfig.value?.storeLogo ?? ""}",
                        width: 30.w,
                        height: 30.h,
                        fit: BoxFit.cover,
                        fadeInDuration: const Duration(milliseconds: 200),
                        errorWidget: (context, url, error) {
                          log("Error == ${error.toString()}");
                          return Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.error,
                              color: Colors.white,
                              size: 12,
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
              title: SizedBox(
                // color: Colors.red,
                width: MediaQuery.sizeOf(context).width * 0.8,
                child: AppTextWidget(
                  text: item,
                  fontWeight: FontWeight.w500,
                  fontSize: 13.sp,
                  color: Colors.black,
                  maxLines: 1,
                  softWrap: true,
                ),
              ),
              //Text(item.name),
            );
          },
        ),
      );
    });
  }
}
