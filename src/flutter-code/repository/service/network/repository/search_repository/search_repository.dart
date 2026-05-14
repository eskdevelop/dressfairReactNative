import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SearchRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Search:
  Future<dynamic> getSearchSuggestion({
    required String sessionToken,
    required String query,
  }) async {
    try {
      String fullUrl = "${AppUrl().searchSuggestionApi}=$query";
      dynamic response = await _apiServices.fetchGetResponse(
        fullUrl,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Get Search Results:
  Future<dynamic> getSearchResult({
    required String sessionToken,
    required String searchAttribute,
    int page = 1,
    int limit = 30,
  }) async {
    // try {
    //   String fullUrl =
    //       "${AppUrl().searchResult}&limit=$limit&page=$page&simple=1&search_attribute=$searchAttribute";
    //
    //   final response = await _apiServices.fetchGetResponse(
    //     fullUrl,
    //     sessionToken,
    //   );
    //   return response; // 🔥 just return raw response
    // } catch (e) {
    //   debugPrint("❌ getSearchResult error: $e");
    //   return {};
    // }
  }
}
