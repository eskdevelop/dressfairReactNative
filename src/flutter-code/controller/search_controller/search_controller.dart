import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/events/facebook_events_service_controller/fb_service_controller.dart';
import 'package:dress_fair_ecommmerce/controller/events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/search_suggestion_model/search_result_model.dart';
import 'package:dress_fair_ecommmerce/model/search_suggestion_model/search_suggestion_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/product_repository/product_repository.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/search_repository/search_repository.dart';
import 'package:tiktok_events_sdk/tiktok_events_sdk.dart';

import '../../view/util/widgets/routes/screens_library.dart';

class SearchBarController extends GetxController {
  Rx<TextEditingController> searchController = TextEditingController().obs;
  RxBool isPopularMode = false.obs;
  RxBool isFetchingMore = false.obs;
  RxInt currentPage = 0.obs;
  RxInt totalPage = 0.obs;
  RxBool isBack = false.obs;
  final SearchRepository apiRepository = SearchRepository();
  final ProductRepository getProductApiRepository = ProductRepository();
  SessionController sessionController = Get.find<SessionController>();
  RxBool isLoading = false.obs;
  RxBool isLoadingSuggestion = false.obs;
  RxList<SearchSuggestionModel> suggestions = <SearchSuggestionModel>[].obs;
  RxList<SearchResultModel> searchResult = <SearchResultModel>[].obs;

  /// Get Search Suggestion:
  Future<void> getSearchSuggestion({required String query}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingSuggestion.value = true;
        var response = await apiRepository.getSearchSuggestion(
          sessionToken: sessionController.sessionToken.value,
          query: query,
        );
        if (response != null && response["success"] == true) {
          if (response['data'] != null && response['data'].isNotEmpty) {
            suggestions.value = (response['data'] as List)
                .map((e) => SearchSuggestionModel.fromJson(e))
                .toList();
          } else {
            suggestions.clear();
          }
        } else {
          suggestions.clear();
        }
        isLoadingSuggestion.value = false;
      } catch (e) {
        isLoadingSuggestion.value = false;
        log("Error in getSearchSuggestion = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
      } finally {
        isLoadingSuggestion.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Get Search result:
  Future<void> fetchSearchResults({required String keyword}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        // Reset everything before a fresh search
        currentPage.value = 1;
        totalPage.value = 1;
        searchResult.clear();
        final response = await apiRepository.getSearchResult(
          sessionToken: sessionController.sessionToken.value,
          searchAttribute: keyword,
          page: currentPage.value,
        );
        if (response != null && response["success"] == true) {
          logSearch(searchString: keyword, success: true);

          final List data = response["data"] ?? [];
          if (data.isNotEmpty) {
            searchResult.value = data
                .map((e) => SearchResultModel.fromJson(e))
                .toList();
            //  Read pagination info from API:
            //  currentPage.value =
            //       (response["current_page"] as num?)?.toInt() ?? 1;
            // totalPage.value = (response["total_pages"] as num?)?.toInt() ?? 1;

            log("✅ Page: ${currentPage.value} / ${totalPage.value}");
          } else {
            AppToast.showInfo("noDataFound".tr);
          }
        }
      } catch (e) {
        log("Error in fetch Search Results == ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
      } finally {
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Get Search Fro Popular:
  Future<void> fetchSearchResultPopular({
    required String cateSlug,
    required int page,
    bool isPagination = false,
    bool isSilentRefresh = false,
  }) async {
    try {
      //  if (isPagination) {
      isLoading.value = true;
      // } else {
      //   if (!isSilentRefresh) {
      //     isLoading.value = true;
      //   }
      //}

      final response = await getProductApiRepository.getProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        limit: 24,
        page: currentPage.value,
      );
      if (response != null && response["success"] == true) {
        final List<dynamic> data = response["data"] ?? [];
        final fetchedList = data
            .map((e) => SearchResultModel.fromJson(e))
            .toList();
        searchController.value.text = cateSlug;
        searchResult.clear();
        searchResult.addAll(fetchedList);
        // totalPage.value = response["total_pages"] ?? 1;
        // currentPage.value = response["current_page"] ?? 1;
        logSearch(searchString: cateSlug, success: true);
      } else {
        log("Error in getProducts: ${response["error"]}");
      }
      isLoading.value = false;
    } catch (e) {
      log("Exception in Search getProducts: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Load next page:
  Future<void> loadMoreSearchData({required String keyword}) async {
    // prevent multiple calls
    if (isFetchingMore.value) return;

    // stop if last page reached
    if (currentPage.value >= totalPage.value) {
      log("🚫 No more pages to load");
      return;
    }

    isFetchingMore.value = true;
    currentPage.value++;

    log("🔁 Fetching page ${currentPage.value} / ${totalPage.value}");

    try {
      ////

      final response = await apiRepository.getSearchResult(
        sessionToken: sessionController.sessionToken.value,
        searchAttribute: keyword,
        page: currentPage.value,
      );

      if (response != null && response["success"] == true) {
        final List data = response["data"] ?? [];
        if (data.isNotEmpty) {
          final newResults = data
              .map((e) => SearchResultModel.fromJson(e))
              .toList();
          searchResult.addAll(newResults); // ✅ Append, don’t replace

          // Update page info
          currentPage.value = response["current_page"] ?? currentPage.value;
          totalPage.value = response["total_pages"] ?? totalPage.value;

          log("📈 Total items now: ${searchResult.length}");
        }
      }
    } catch (e) {
      log("Pagination Error == ${e.toString()}");
    } finally {
      isFetchingMore.value = false;
    }
  }

  ///Load More Popular Result:
  Future<void> loadMorePopularResults({required String cateSlug}) async {
    // Prevent duplicate API calls
    if (isFetchingMore.value) return;

    // Stop if we’re already at last page
    if (currentPage.value >= totalPage.value) {
      log("🚫 No more popular pages to load");
      return;
    }

    isFetchingMore.value = true;
    currentPage.value++;

    log("🔁 Fetching popular page ${currentPage.value} / ${totalPage.value}");

    try {
      final response = await getProductApiRepository.getProducts(
        sessionToken: sessionController.sessionToken.value,
        cateSlug: cateSlug,
        limit: 24,
        page: currentPage.value,
      );
      if (response != null && response["success"] == true) {
        final List<dynamic> data = response["data"] ?? [];
        if (data.isNotEmpty) {
          final newItems = data
              .map((e) => SearchResultModel.fromJson(e))
              .toList();
          searchResult.addAll(newItems); // append instead of replace
          // update pagination info
          currentPage.value = response["current_page"] ?? currentPage.value;
          totalPage.value = response["total_pages"] ?? totalPage.value;

          log("📈 Popular items total: ${searchResult.length}");
        }
      }
    } catch (e) {
      log("Popular pagination error == ${e.toString()}");
    } finally {
      isFetchingMore.value = false;
    }
  }

  //Tracing Data:
  /// For Fb,Tiktok Tracking :
  void logSearch({required String searchString, required bool success}) {
    FacebookEventService.instance.logSearch(searchString: searchString);

    TikTokService.logEvent(
      eventName: 'product_search',
      eventType: TTEventType.viewContent,
      properties: EventProperties(
        contentId: 'search_Product',
        contentType: 'Search_Product',
        contentName: searchString,
        //price: 29.99,
        currency: CurrencyCode.AED,
      ),
    );
  }

  /// For Tracing Tiktok Events:
}
