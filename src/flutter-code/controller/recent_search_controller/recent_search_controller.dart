import 'package:dress_fair_ecommmerce/hive_db/all_cache/recent_search_cache_helper.dart';

import '../../view/util/widgets/routes/screens_library.dart';

class RecentSearchController extends GetxController {
  RxBool isLoading = false.obs;

  RxList<String> recentSearch = <String>[].obs;

  final RecentSearchHelper _recentSearchHelper = RecentSearchHelper();

  // @override
  // void onInit() {
  //   super.onInit();
  //   loadRecentSearches();
  // }

  /// Load Recent Search:
  Future<void> loadRecentSearches() async {
    final searches = await _recentSearchHelper.getSearches();
    recentSearch.assignAll(searches);
  }

  /// Add Recent Search:

  Future<void> addRecentSearch(String query) async {
    await _recentSearchHelper.addSearch(query);
    recentSearch.remove(query);
    recentSearch.insert(0, query);
    if (recentSearch.length > 3) {
      recentSearch.removeLast();
    }
  }

  /// Clear Recent Search:
  Future<void> clearRecentSearches() async {
    await _recentSearchHelper.clearSearches();
    recentSearch.clear();
  }
}
