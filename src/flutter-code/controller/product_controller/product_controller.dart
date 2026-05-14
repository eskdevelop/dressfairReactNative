import 'dart:convert';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/product_repository/product_repository.dart';
import 'package:flutter/foundation.dart';

import '../../hive_db/all_cache/product_cache_helper.dart';
import '../../model/main_product_model/main_product_model.dart';
import '../../view/util/widgets/routes/screens_library.dart';
import 'iosalates_product_controller.dart';

class ProductController extends GetxController {
  final ProductRepository apiRepository = ProductRepository();
  final SessionController sessionController = Get.find<SessionController>();

  /// Backward-compatible bucket for the "All" tab (empty slug).
  /// Other consumers (cart/all_screen, you_screen) still bind to this.
  RxList<MainProductModel> allProducts = <MainProductModel>[].obs;

  /// Single slug-keyed store. Replaces the 12 hard-coded RxLists.
  final RxMap<String, RxList<MainProductModel>> productsBySlug =
      <String, RxList<MainProductModel>>{}.obs;

  RxList<MainProductModel> subCategoryProductList = <MainProductModel>[].obs;

  /// Legacy global flags. Kept for backward compatibility with screens that
  /// still read `productController.isLoading` / `isMoreLoading` directly,
  /// but they are NO LONGER written by `getProducts` — see
  /// `loadingBySlug` / `moreLoadingBySlug` below. New code should use
  /// `isLoadingFor(slug)` / `isMoreLoadingFor(slug)`.
  RxBool isLoading = false.obs;
  RxBool isMoreLoading = false.obs;

  /// Per-slug loading flags. Each tab's Obx subscribes only to its own
  /// entry, so loading category A no longer rebuilds tabs B/C/D.
  final RxMap<String, bool> loadingBySlug = <String, bool>{}.obs;
  final RxMap<String, bool> moreLoadingBySlug = <String, bool>{}.obs;

  bool isLoadingFor(String slug) => loadingBySlug[slug] ?? false;
  bool isMoreLoadingFor(String slug) => moreLoadingBySlug[slug] ?? false;

  // Pagination per category (keyed by the same slug)
  final Map<String, int> currentPageMap = {};
  final Map<String, int> totalPagesMap = {};
  final Map<String, bool> hasMoreDataMap = {};
  ProductCacheHelper cacheHelper = ProductCacheHelper();

  /// Returns (or lazily creates) the RxList for a given slug.
  /// IMPORTANT: never call from inside an `Obx` build closure — it mutates
  /// `productsBySlug` on first access and the Obx would subscribe to the
  /// outer map, causing cross-slug rebuilds. Resolve once in `initState`.
  RxList<MainProductModel> listFor(String slug) {
    if (slug.isEmpty) return allProducts;
    return productsBySlug.putIfAbsent(slug, () => <MainProductModel>[].obs);
  }

  /// Load products (cache first, then API):
  Future<void> loadProducts({
    required String cateSlug,
    required int page,
    bool isSilentRefresh = false,
    bool isPagination = true,
  }) async {
    try {
      if (page == 1) {
        final cached = cacheHelper.getCategoryProducts(
          cateSlug.isEmpty ? "all" : cateSlug,
        );
        if (cached.isNotEmpty) {
          _updateCategoryList(cateSlug, cached, false);
          log("Cache Product Found == ${cached.length}");
          if (isSilentRefresh) {
            // getProducts(
            //   cateSlug: cateSlug,
            //   page: page,
            //   isPagination: false,
            //   isSilentRefresh: isSilentRefresh,
            // );
          }
          return;
        } else {
          log("Cache Product Not Found Found == ${cached.length}");
        }
      }

      await getProducts(
        cateSlug: cateSlug,
        page: page,
        isPagination: isPagination,
        isSilentRefresh: isSilentRefresh,
      );
    } catch (e) {
      log("Error loading products: $e");
    }
  }

  /// Fetch from API and update cache.
  ///
  /// Loading flags are now PER-SLUG. The legacy global `isLoading` /
  /// `isMoreLoading` are intentionally not written here so that loading
  /// category A no longer triggers rebuilds in kept-alive tabs B, C, D.
  Future<void> getProducts({
    required String cateSlug,
    required int page,
    bool isPagination = false,
    bool isSilentRefresh = false,
  }) async {
    try {
      if (isPagination) {
        moreLoadingBySlug[cateSlug] = true;
      } else if (!isSilentRefresh) {
        loadingBySlug[cateSlug] = true;
      }
      final response = await apiRepository.getProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        page: page,
      );
      if (response != null && response["success"] == true) {
        final pagination = response["pagination"] ?? {};
        final int currentPage = pagination["current_page"] ?? page;
        final int lastPage = pagination["last_page"] ?? currentPage;
        currentPageMap[cateSlug] = currentPage;
        totalPagesMap[cateSlug] = lastPage;
        hasMoreDataMap[cateSlug] = currentPage < lastPage;
        // Offload JSON parsing to background isolate:
        final String responseBody = jsonEncode(response);
        final List<MainProductModel> fetchedList = await compute(
          parseProducts,
          responseBody,
        );
        if (page == 1) {
          await cacheHelper.saveCategoryProducts(
            cateSlug.isEmpty ? "all" : cateSlug,
            fetchedList,
          );
        }

        _updateCategoryList(cateSlug, fetchedList, isPagination);
      } else {
        log("Error in getProducts: ${response?["error"]}");
      }
    } catch (e) {
      log("Exception in getProducts: $e");
    } finally {
      if (!isSilentRefresh) {
        loadingBySlug[cateSlug] = false;
      }
      moreLoadingBySlug[cateSlug] = false;
    }
  }

  /// Update Category List.
  /// Writes synchronously so that callers awaiting `loadProducts` /
  /// `getProducts` can rely on the bucket being populated before the
  /// Future resolves. Post-frame deferral was causing the "All" tab to
  /// render empty on cold start because Splash navigated before the
  /// next frame fired.
  void _updateCategoryList(
    String cateSlug,
    List<MainProductModel> data,
    bool isPagination,
  ) {
    log("Slug == $cateSlug");
    final list = listFor(cateSlug);
    if (isPagination) {
      list.addAll(data);
    } else {
      list.assignAll(data);
    }
  }

  /// Clear all cached products
  Future<void> clearCache() async {
    // await _cacheHelper.clearCache();
    log("All cached products cleared.");
  }

  int getCurrentPage(String cateSlug) => currentPageMap[cateSlug] ?? 1;

  /// Helper to get hasMoreData for a category
  bool getHasMoreData(String cateSlug) => hasMoreDataMap[cateSlug] ?? true;

  /// ✅ NEW: Safe pagination request
  Future<void> requestNextPage(String cateSlug) async {
    if (isMoreLoading.value) return; // prevent double calls
    if (!getHasMoreData(cateSlug)) return; // stop at last page
    final nextPage = getCurrentPage(cateSlug) + 1;
    await getProducts(cateSlug: cateSlug, page: nextPage, isPagination: true);
  }

  RxList<MainProductModel> getCategoryList(String cateSlug) =>
      listFor(cateSlug);

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

      final response = await apiRepository.getProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        limit: 24,
        page: page,
      );

      if (response != null && response["success"] == true) {
        final List<dynamic> data = response["data"] as List<dynamic>;

        ///
        // final pagination = response["pagination"] ?? {};
        // final int currentPage = pagination["current_page"] ?? page;
        // final int lastPage = pagination["last_page"] ?? currentPage;
        // currentPageMap[cateSlug] = currentPage;
        // totalPagesMap[cateSlug] = lastPage;
        // hasMoreDataMap[cateSlug] = currentPage < lastPage;

        final List<MainProductModel> fetchedList = data
            .map<MainProductModel>(
              (e) => MainProductModel.fromJson(e as Map<String, dynamic>),
            )
            .toList();
        subCategoryProductList.assignAll(fetchedList);
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
}
