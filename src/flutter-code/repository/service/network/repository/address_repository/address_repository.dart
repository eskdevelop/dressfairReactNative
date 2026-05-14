import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AddressRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Province:
  Future<dynamic> getCities({
    required String sessionToken,

    required countryId,
  }) async {
    try {
      String fullUrl = "${AppUrl().cityApi}/$countryId";
      dynamic response = await _apiServices.fetchGetResponse(fullUrl, "");
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Get city:
  Future<dynamic> getArea({
    required String sessionToken,
    required String id,
  }) async {
    try {
      String fullUrl = "${AppUrl().areaApi}/$id";
      dynamic response = await _apiServices.fetchGetResponse(fullUrl, "");
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  // /// get Address:
  // Future<dynamic> getAddress({required String sessionToken}) async {
  //   try {
  //     dynamic response = await _apiServices.fetchGetResponse(
  //       AppUrl().getUserAddress,
  //       sessionToken,
  //     );
  //     return response;
  //   } catch (e) {
  //     debugPrint(e.toString());
  //     return {};
  //   }
  // }

  /// Save Address:
  Future<dynamic> saveAddress({
    required String sessionToken,
    required Map<String, dynamic> data,
  }) async {
    try {
      dynamic response = await _apiServices.sendPostRequest(
        AppUrl().saveAddressApi,
        data,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  //Make default Address:
  /// Save Address:
  Future<dynamic> makeDefaultAddress({
    required String sessionToken,
    required String id,
  }) async {
    Map<String, dynamic> data = {"customer_address_id": id, "is_default": 1};
    try {
      dynamic response = await _apiServices.sendPutRequest(
        AppUrl().makeDefaultApi,
        data,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  /// Delete Address:
  Future<dynamic> deleteAddress({
    required String sessionToken,
    required String id,
  }) async {
    Map<String, String> data = {"customer_address_id": id};
    try {
      dynamic response = await _apiServices.sendDeleteRequest(
        AppUrl().deleteAddressApi,
        data,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }

  Future<dynamic> updateAddress({
    required String sessionToken,
    required Map<String, dynamic> data,
  }) async {
    try {
      dynamic response = await _apiServices.sendPutRequest(
        AppUrl().updateAddressApi,
        data,
        sessionToken,
      );
      return response;
    } catch (e) {
      debugPrint(e.toString());
      return {};
    }
  }
}
