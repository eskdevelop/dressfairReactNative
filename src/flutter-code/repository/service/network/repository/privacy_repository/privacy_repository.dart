import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class PrivacyRepository {
  final BaseApiServices _apiServices = NetworkApiService();

  /// Get Term And Condition:
  Future<dynamic> getTermAndCondition({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl().termAndCondition,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }

  /// Get Refund Policy:
  Future<dynamic> getRefundPolicy({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl.refundPolicy,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }

  /// Get Refund Policy:
  Future<dynamic> getAboutUs({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl.aboutUs,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }

  /// Get Privacy Policy:
  Future<dynamic> getPrivacyPolicy({required String sessionToken}) async {
    // try {
    //   dynamic response = await _apiServices.fetchGetResponse(
    //     AppUrl.privacyPolicy,
    //     sessionToken,
    //   );
    //   return response;
    // } catch (e) {
    //   debugPrint(e.toString());
    //   return {};
    // }
  }
}
