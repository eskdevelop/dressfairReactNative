import 'dart:convert';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/model/deals_model/deals_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/get_deals_repository/get_deals_repository.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:flutter/foundation.dart';

import 'deals_isolate.dart';

class DealsController extends GetxController {
  Rx<TabController?> tabController = Rx<TabController?>(null);
  final GetDealsRepository apiRepository = GetDealsRepository();
  final SessionController sessionController = Get.find<SessionController>();
  RxBool isMoreLoading = false.obs;
  RxBool isLoading = false.obs;
  RxList<DealProductModel> dealsRecommended = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsAutomotiveAcc = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsBabyToddler = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsBags = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsBeautyHealth = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsCellPhone = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsHomeKitchen = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsJewelryAcc = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsMClothing = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsWClothing = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsWLingerie = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsWShoes = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsDefaultList = <DealProductModel>[].obs;
  RxList<DealProductModel> dealsSubCategoryProductList =
      <DealProductModel>[].obs;

  // 🆕 Pagination per category
  final Map<String, int> dealsCurrentPageMap = {};
  final Map<String, int> dealsTotalPagesMap = {};
  final Map<String, bool> dealsHasMoreDataMap = {};

  /// Fetch from API and update cache:
  Future<void> getDeals({
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
      final response = await apiRepository.getDeals(
        sessionToken: sessionController.sessionToken.value,
        page: page,
        slug: cateSlug,
      );
      if (response != null && response["success"] == true) {
        final pagination = response["pagination"] ?? {};
        final int currentPage = pagination["current_page"] ?? page;
        final int lastPage = pagination["last_page"] ?? currentPage;
        dealsCurrentPageMap[cateSlug] = currentPage;
        dealsTotalPagesMap[cateSlug] = lastPage;
        dealsHasMoreDataMap[cateSlug] = currentPage < lastPage;

        // Offload JSON parsing to background isolate:
        final String responseBody = jsonEncode(response);
        final List<DealProductModel> fetchedList = await compute(
          parseDeals,
          responseBody,
        );

        _updateCategoryList(cateSlug, fetchedList, isPagination);
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

  /// Update Category List :
  void _updateCategoryList(
    String cateSlug,
    List<DealProductModel> data,
    bool isPagination,
  ) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      log("Deals Slug == $cateSlug");
      switch (cateSlug) {
        case "":
          isPagination
              ? dealsRecommended.addAll(data)
              : dealsRecommended.assignAll(data);
          break;
        case "Automotive Accessories":
          isPagination
              ? dealsAutomotiveAcc.addAll(data)
              : dealsAutomotiveAcc.assignAll(data);

          break;
        case "Baby-Toddler":
          isPagination
              ? dealsBabyToddler.addAll(data)
              : dealsBabyToddler.assignAll(data);

          break;
        case "Bags":
          isPagination ? dealsBags.addAll(data) : dealsBags.assignAll(data);

          break;
        case "Beauty & Health":
          isPagination
              ? dealsBeautyHealth.addAll(data)
              : dealsBeautyHealth.assignAll(data);

          break;

        case "Cell Phone":
          isPagination
              ? dealsCellPhone.addAll(data)
              : dealsCellPhone.assignAll(data);

          break;
        case "Home & Kitchen":
          isPagination
              ? dealsHomeKitchen.addAll(data)
              : dealsHomeKitchen.assignAll(data);

          break;
        case "Jewlery & Accessories":
          isPagination
              ? dealsJewelryAcc.addAll(data)
              : dealsJewelryAcc.assignAll(data);

          break;
        case "Men Clothings":
          isPagination
              ? dealsMClothing.addAll(data)
              : dealsMClothing.assignAll(data);

          break;
        case "Women Clothings":
          isPagination
              ? dealsWClothing.addAll(data)
              : dealsWClothing.assignAll(data);

          break;
        case "Women Lingeries":
          isPagination
              ? dealsWLingerie.addAll(data)
              : dealsWLingerie.assignAll(data);

          break;
        case "Women Shoes":
          isPagination ? dealsWShoes.addAll(data) : dealsWShoes.assignAll(data);

          break;
        case "Bags & Luggages":
          isPagination ? dealsBags.addAll(data) : dealsBags.assignAll(data);

          break;
        default:
          //   if (allProducts.isEmpty) {
          //     if (!isPagination) {
          //      allProducts.clear();
          //  }
          // isPagination ? allProducts.addAll(data) : allProducts.assignAll(data);
          //  }
          break;
      }
    });
  }

  int getCurrentPage(String cateSlug) => dealsCurrentPageMap[cateSlug] ?? 1;

  /// Helper to get hasMoreData for a category
  bool getHasMoreData(String cateSlug) => dealsHasMoreDataMap[cateSlug] ?? true;

  // RxList<DealProductModel> getCategoryList(String cateSlug) {
  //   switch (cateSlug) {
  //     case "":
  //       return dealsRecommended;
  //     case "Automotive Accessories":
  //       return dealsAutomotiveAcc;
  //     case "Baby & Toddler":
  //       return dealsBabyToddler;
  //     case "Bags":
  //       return dealsBags;
  //     case "Beauty & Health":
  //       return dealsBeautyHealth;
  //     case "Cell Phone Accessories":
  //       return dealsCellPhone;
  //     case "Home & Kitchen":
  //       return dealsHomeKitchen;
  //     case "Jewlery & Accessories":
  //       return dealsJewelryAcc;
  //     case "Men Clothings":
  //       return dealsMClothing;
  //     case "Women Clothings":
  //       return dealsWClothing;
  //     case "Women Lingeries":
  //       return dealsWLingerie;
  //     case "Women Shoes":
  //       return dealsWShoes;
  //     default:
  //       return dealsRecommended;
  //   }
  // }

  /// ✅ NEW: Safe pagination request
  Future<void> requestNextPage(String cateSlug) async {
    if (isMoreLoading.value) return;
    if (!getHasMoreData(cateSlug)) return;
    final nextPage = getCurrentPage(cateSlug) + 1;
    await getDeals(cateSlug: cateSlug, page: nextPage, isPagination: true);
  }
}
