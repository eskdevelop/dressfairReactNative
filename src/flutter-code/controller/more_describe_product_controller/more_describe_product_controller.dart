import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/internet_connectivity_check/InternetController.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/api_response.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/more_describe_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/app_toast/app_toast.dart';
import 'package:get/get.dart';

import '../../model/main_product_model/main_product_model.dart';

class MoreDescribeProductController extends GetxController {
  final MoreDescribeProductRepository apiRepository =
      MoreDescribeProductRepository();
  final SessionController sessionController = Get.find<SessionController>();
  //  final ProductCacheHelper _cacheHelper = ProductCacheHelper();
  RxString selectedNewSort = "Default".obs;
  // RxLists per category
  RxList<MainProductModel> moreDescribeProduct = <MainProductModel>[].obs;

  RxBool isLoading = false.obs;
  RxBool isLoadingFilter = false.obs;
  RxBool isMoreLoading = false.obs;
  RxInt currentPage = 1.obs;
  RxInt totalPages = 1.obs;
  RxBool hasMoreData = true.obs;
  // 🆕 Pagination per category
  final Map<String, int> currentPageMap = {};
  final Map<String, int> totalPagesMap = {};
  final Map<String, bool> hasMoreDataMap = {};

  // --- Filter related fields ---
  RxString selectedOptionValue = ''.obs;
  RxString selectedSizeValue = ''.obs;
  RxString selectedAttributeValue = ''.obs;
  RxString selectedCateSlug = ''.obs;
  RxString selectedSort = ''.obs;
  RxString selectedOrder = ''.obs;

  /// Reset pagination when applying new filters
  void resetPagination() {
    currentPage.value = 1;
    totalPages.value = 1;
    hasMoreData.value = true;
    moreDescribeProduct.clear();
  }

  bool getHasMoreData(String cateSlug) => hasMoreDataMap[cateSlug] ?? true;
  int getCurrentPage(String cateSlug) => currentPageMap[cateSlug] ?? 1;

  /// ✅ NEW: Safe pagination request
  Future<void> requestNextPage(String cateSlug) async {
    if (isMoreLoading.value) return;
    if (!getHasMoreData(cateSlug)) return;
    final nextPage = getCurrentPage(cateSlug) + 1;
    await getMoreDescribeProducts(
      cateSlug: cateSlug,
      page: nextPage,
      isPagination: true,
    );
  }

  ///Apply Filter with pagination support:
  Future<void> applyFilter({
    required String cateSlug,
    required String optionValue,
    required String sizeValue,
    required String attributeValue,
    required int page,
    required sort,
    required order,
    bool isLoadMore = false, // Add this parameter
  }) async {
    if (await InternetController.checkUserConnection()) {
      try {
        // 🆕 Set loading states based on whether it's load more or initial load
        if (isLoadMore) {
          isMoreLoading.value = true;
        } else {
          isLoading.value = true;
          resetPagination(); // 🆕 Reset pagination for new filters
        }

        selectedCateSlug.value = cateSlug;
        selectedOptionValue.value = optionValue;
        selectedSizeValue.value = sizeValue;
        selectedAttributeValue.value = attributeValue;
        selectedSort.value = sort;
        selectedOrder.value = order;

        final response = await apiRepository.applyFilterData(
          sessionToken: sessionController.sessionToken.value,
          cateSlug: cateSlug,
          limit: 24,
          page: page, // 🆕 Use the provided page parameter
          optionValue: selectedOptionValue.value,
          sizeValue: selectedSizeValue.value,
          attributeValue: selectedAttributeValue.value,
          sort: sort,
          order: order,
        );

        if (response != null && response["success"] == true) {
          final List<dynamic> data = response["data"] ?? [];
          totalPages.value = response["total_pages"] ?? 1;
          currentPage.value = response["current_page"] ?? 1;

          // 🆕 Check if there are more pages
          hasMoreData.value = currentPage.value < totalPages.value;

          final fetchedList = data
              .map((e) => MainProductModel.fromJson(e))
              .toList();

          if (isLoadMore) {
            // 🆕 Append for pagination
            moreDescribeProduct.addAll(fetchedList);
          } else {
            // 🆕 Replace for initial load
            moreDescribeProduct.assignAll(fetchedList);
          }
        } else {
          log("Error in applyFilter: ${response?["error"]}");
        }

        isLoading.value = false;
        isMoreLoading.value = false;
      } catch (e) {
        log("Error in applyFilter = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
        isMoreLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
      isLoading.value = false;
      isMoreLoading.value = false;
    }
  }

  /// 🆕 Load more data for current filters
  Future<void> loadMoreData() async {
    if (!hasMoreData.value || isMoreLoading.value || isLoading.value) {
      return;
    }

    final nextPage = currentPage.value + 1;

    await applyFilter(
      cateSlug: selectedCateSlug.value,
      optionValue: selectedOptionValue.value,
      sizeValue: selectedSizeValue.value,
      attributeValue: selectedAttributeValue.value,
      page: nextPage,
      sort: selectedSort.value,
      order: selectedOrder.value,
      isLoadMore: true,
    );
  }

  /// Fetch from API and update cache:
  Future<void> getMoreDescribeProducts({
    required String cateSlug,
    required int page,
    bool isPagination = false,
    bool isSilentRefresh = false,
  }) async {
    try {
      if (isPagination) {
        isMoreLoading.value = true;
      } else {
        if (!isSilentRefresh) {
          isLoading.value = true;
        }
      }
      // final response = await apiRepository.getMoreDescribeProducts(
      //   sessionToken: sessionController.sessionToken.value,
      //   cateSlug: cateSlug,
      //   limit: 24,
      //   page: page,
      //   optionValue: selectedOptionValue.value,
      //   sizeValue: selectedSizeValue.value,
      //   attributeValue: selectedAttributeValue.value,
      // );
      final response = await apiRepository.getMoreDescribeProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        limit: 24,
        page: page,
        optionValue: selectedOptionValue.value,
        sizeValue: selectedSizeValue.value,
        attributeValue: selectedAttributeValue.value,
        sort: selectedSort.value,
        order: selectedOrder.value,
      );

      if (response != null && response["success"] == true) {
        final List<dynamic> data = response["data"] as List<dynamic>;
        final List<MainProductModel> fetchedList = data
            .map<MainProductModel>(
              (e) => MainProductModel.fromJson(e as Map<String, dynamic>),
            )
            .toList();

        moreDescribeProduct.addAll(fetchedList);
      } else {
        log("Error in More Describe Products APi: ${response?["error"]}");
      }
      isLoading.value = false;

      // if (response != null && response["success"] == true) {
      //   final List<dynamic> data = response["data"] ?? [];
      //   // final fetchedList = data
      //   //     .map((e) => ProductModelNew.fromJson(e))
      //   //     .toList();
      //
      //   // totalPages.value = response["total_pages"] ?? 1;
      //   // currentPage.value = response["current_page"] ?? 1;
      //   // hasMoreData.value = currentPage.value < totalPages.value;
      //
      //   // if (isPagination) {
      //   //   moreDescribeProduct.addAll(fetchedList);
      //   // } else {
      //   //   moreDescribeProduct.assignAll(fetchedList);
      //   // }
      //
      //   // if (!isPagination && page == 1) {
      //   //   await _cacheHelper.saveProducts(
      //   //     cateSlug.isEmpty ? "all" : cateSlug,
      //   //     fetchedList,
      //   //   );
      //   // }
      //
      //   // log(
      //   //   "Fetched ${fetchedList.length} products for $cateSlug page $currentPage / $totalPages"
      //   //   "with filters: option=${selectedOptionValue.value}, size=${selectedSizeValue.value}, attr=${selectedAttributeValue.value}",
      //   // );
      // } else {
      //   log("Error in More describe getProducts: ${response?["error"]}");
      // }
    } catch (e) {
      isLoading.value = false;
      log("Exception in Get More Describe  getProducts: $e");
    } finally {
      isLoading.value = false;
      if (!isSilentRefresh) {
        isLoading.value = false;
      }
      isMoreLoading.value = false;
    }
  }

  void applySort(String label, String cateSlug) {
    selectedNewSort.value = label;

    switch (label) {
      case "New Arrival":
        selectedSort.value = "new";
        selectedOrder.value = "desc";
        break;

      case "Popular":
        selectedSort.value = "popular";
        selectedOrder.value = "desc";
        break;

      case "Price: Low to High":
        selectedSort.value = "price";
        selectedOrder.value = "asc";
        break;

      case "Price: High to Low":
        selectedSort.value = "price";
        selectedOrder.value = "desc";
        break;

      default: // Clear
        selectedSort.value = "";
        selectedOrder.value = "";
        break;
    }

    resetPagination();

    getMoreDescribeProducts(cateSlug: cateSlug, page: 1);
  }
}
