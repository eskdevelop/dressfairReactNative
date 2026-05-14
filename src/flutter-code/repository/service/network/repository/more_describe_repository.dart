import '../../../../view/util/widgets/routes/screens_library.dart';

class MoreDescribeProductRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  Future<dynamic> getMoreDescribeProducts({
    required String sessionToken,
    int limit = 24,
    required String cateSlug,
    int page = 1,
    String optionValue = '',
    String sizeValue = '',
    String attributeValue = '',
    String sort = '',
    String order = '',
  }) async {
    try {
      String fullUrl = "${AppUrl().productApi}/$cateSlug?page=$page";

      if (sort.isNotEmpty) {
        fullUrl += "&sort=$sort";
      }
      if (order.isNotEmpty) {
        fullUrl += "&order=$order";
      }

      debugPrint("👉 More Describe PRODUCTS API: $fullUrl");

      final response = await _apiServices.fetchGetResponse(
        fullUrl,
        sessionToken,
      );

      return response;
    } catch (e) {
      debugPrint("❌ Error fetching products: $e");
      return {};
    }
  }

  ///Apply Filter Data:

  Future<dynamic> applyFilterData({
    required String sessionToken,
    int limit = 24,
    int simple = 1,
    required String cateSlug,
    int page = 1,
    String optionValue = '',
    String sizeValue = '',
    String attributeValue = '',
    required String sort,
    required String order,
  }) async {
    // try {
    //   String fullUrl = "";
    //   // Build full URL manually (no Uri encoding)
    //   if (sort.isNotEmpty) {
    //     fullUrl =
    //         "${AppUrl().applyFilter}&limit=$limit&simple=$simple"
    //         "&cate_slug=$cateSlug"
    //         "&option_value=$optionValue"
    //         "&size_value=$sizeValue"
    //         "&attribute_value=$attributeValue"
    //         "&page=$page"
    //         "&sort=$sort"
    //         "&order=$order";
    //     debugPrint("👉 APPLY FILTER API NOT EMPTY: $fullUrl");
    //   }
    //   else {
    //     fullUrl =
    //         "${AppUrl.applyFilter}&limit=$limit&simple=$simple"
    //         "&cate_slug=$cateSlug"
    //         "&option_value=$optionValue"
    //         "&size_value=$sizeValue"
    //         "&attribute_value=$attributeValue"
    //         "&page=$page";
    //     // "&sort=$sort"
    //     // "&order=$order";
    //     debugPrint("👉 APPLY FILTER API: $fullUrl");
    //   }
    //   final response = await _apiServices.fetchGetResponse(
    //     fullUrl,
    //     sessionToken,
    //   );
    //
    //   return response;
    // } catch (e) {
    //   debugPrint("❌ Error fetching filtered products: $e");
    //   return {};
    // }
  }
}
