import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';

import '../../hive_db/all_cache/product_cache_helper.dart';
import '../../model/main_product_model/main_product_model.dart';
import '../../repository/service/network/repository/category_repository/sub_category_products_repository.dart';
import '../../view/util/widgets/routes/screens_library.dart';

class SubCategoryController extends GetxController {
  final SubCategoryProductRepository apiRepository =
      SubCategoryProductRepository();
  final SessionController sessionController = Get.find<SessionController>();
  ProductCacheHelper cacheHelper = ProductCacheHelper();
  RxList<MainProductModel> subCategoryProducts = <MainProductModel>[].obs;
  RxBool isLoading = false.obs;
  RxBool isMoreLoading = false.obs;

  RxString selectedOptionValue = ''.obs;
  RxString selectedSizeValue = ''.obs;
  RxString selectedAttributeValue = ''.obs;
  RxString selectedCateSlug = ''.obs;
  RxString selectedSort = 'Default'.obs;
  RxString selectedOrder = ''.obs;
  RxInt currentPage = 1.obs;
  RxInt totalPages = 1.obs;
  RxBool hasMoreData = true.obs;

  /// 🆕 Pagination per category:
  final Map<String, int> currentPageMap = {};
  final Map<String, int> totalPagesMap = {};
  final Map<String, bool> hasMoreDataMap = {};

  /// Helper to get hasMoreData for a category
  bool getHasMoreData(String cateSlug) {
    if (!hasMoreDataMap.containsKey(cateSlug)) {
      return true;
    }
    return hasMoreDataMap[cateSlug] ?? false; // Default to false if null
  }

  /// Fetch from API and update cache:
  Future<void> getSubCategoryProducts({
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

      final response = await apiRepository.getSubCategoryProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        page: page,
        limit: 24,
        optionValue: selectedOptionValue.value,
        sizeValue: selectedSizeValue.value,
        attributeValue: selectedAttributeValue.value,
        sort: selectedSort.value,
        order: selectedOrder.value,
      );

      if (response != null && response["success"] == true) {
        // ✅ FIX: Pagination is at root level, not inside "data"
        final pagination = response["pagination"] ?? {};
        final int currentPage = pagination["current_page"] ?? page;
        final int lastPage = pagination["last_page"] ?? currentPage;

        // ✅ Update pagination maps
        currentPageMap[cateSlug] = currentPage;
        totalPagesMap[cateSlug] = lastPage;
        hasMoreDataMap[cateSlug] = currentPage < lastPage;

        log(
          "Pagination info - Current: $currentPage, Last: $lastPage, HasMore: ${currentPage < lastPage}",
        );

        // Get products from "data" field
        final List<dynamic> productsData = response["data"] ?? [];

        // Parse products
        final List<MainProductModel> fetchedList = productsData
            .map((json) => MainProductModel.fromJson(json))
            .toList();

        if (page == 1) {
          await cacheHelper.saveCategoryProducts(
            cateSlug.isEmpty ? "all" : cateSlug,
            fetchedList,
          );
        }

        if (isPagination) {
          subCategoryProducts.addAll(fetchedList);
        } else {
          subCategoryProducts.assignAll(fetchedList);
        }
      } else {
        log("Error in getProducts: ${response?["error"]}");
      }
    } catch (e) {
      log("Exception in getProducts: $e");
    } finally {
      if (!isSilentRefresh) {
        isLoading.value = false;
      }
      isMoreLoading.value = false;
    }
  }

  int getCurrentPage(String cateSlug) => currentPageMap[cateSlug] ?? 1;

  /// Reset pagination when applying new filters:

  void resetPagination() {
    currentPage.value = 1;
    totalPages.value = 1;
    hasMoreData.value = true;
    subCategoryProducts.clear();
  }

  /// ✅ NEW: Safe pagination request
  Future<void> requestNextPage(String cateSlug) async {
    if (isMoreLoading.value) return;
    if (!getHasMoreData(cateSlug)) return;
    final nextPage = getCurrentPage(cateSlug) + 1;
    log("Calling APi Sub Category Products == ");
    await getSubCategoryProducts(
      cateSlug: cateSlug,
      page: nextPage,
      isPagination: true,
    );
  }

  void applySort(String label, String cateSlug) {
    selectedSort.value = label;

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

    getSubCategoryProducts(cateSlug: cateSlug, page: 1);
  }
}
