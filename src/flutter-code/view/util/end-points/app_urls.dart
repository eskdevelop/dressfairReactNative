import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AppUrl {
  SessionController controller = Get.find<SessionController>();
  //static String baseUrl = baseUrlUAE;
  // void setBaseUrl() {
  //   log("Selected Country  ==${controller.locationBaseCountry.value}");
  //   switch (controller.locationBaseCountry.value) {
  //     case "OM":
  //       baseUrl = baseUrlOman;
  //       break;
  //     case "SA":
  //       baseUrl = baseUrlSaudiArabia;
  //       break;
  //     case "AE":
  //       baseUrl = AppUrl.baseUrlUAE;
  //     case "PK":
  //       baseUrl = AppUrl.baseUrlUAE;
  //     case "US":
  //       baseUrl = AppUrl.baseUrlUAE;
  //       break;
  //     default:
  //       baseUrl = baseUrlUAE;
  //   }
  // }
  //
  // static String get loginWithGoogle => "$baseUrl/rest_api.googleLogin";
  // static String get session => "$baseUrl/rest_api.session";
  // // static String get config => "$baseUrl/feed_rest_api.getConfig";
  // static String get category => "$baseUrl/rest_api.categories";
  // static String get whatsappLogin => "$baseUrl/rest_api.sendOtp";
  // static String get verifyOtp => "$baseUrl/rest_api.otpLogin";
  // //static String get getZone => "$baseUrl/rest_api.getZones";
  // //static String get getAreas => "$baseUrl/rest_api.getAreas";
  // static String get getBanner => "$baseUrl/rest_api.getBanners";
  // static String get addToCart => "$baseUrl/rest_api.cart";
  // static String get getToCart => "$baseUrl/rest_api.cart";
  // static String get getUserAddress => "$baseUrl/feed_rest_api.getUserAddresses";
  // static String get saveAddress => "$baseUrl/feed_rest_api.saveAddress";
  // static String get makeDefault => "$baseUrl/feed_rest_api.makeDefaultAddress";
  // static String get deleteAddToCart => "$baseUrl/rest_api.cart";
  // static String get confirmOrder => "$baseUrl/rest_api.confirm";
  // static String get filterData => "$baseUrl/rest_api.getFilterData";
  // static String get getOrdersStatus => "$baseUrl/rest_api.orders";
  // static String get searchSuggestion =>
  //     "$baseUrl/feed_rest_api.getSearchSuggestions";
  // static String get searchResult => "$baseUrl/rest_api.productsLp";
  // static String get successOrders => "$baseUrl/rest_api.orders";
  // static String get makeDefaultAddress =>
  //     "$baseUrl/feed_rest_api.makeDefaultAddress";
  // static String get deleteAddress => "$baseUrl/feed_rest_api.deleteUserAddress";
  // static String get getBestSeller => "$baseUrl/rest_api.bestSeller";
  // static String get getGreatDay => "$baseUrl/rest_api.salePromotion";
  // static String get newArrivals => "$baseUrl/rest_api.newArrivals";
  // static String get customerProfile => "$baseUrl/rest_api.customerProfile";
  // static String get logout => "$baseUrl/rest_api.logout";
  // static String get getFeaturedCategory =>
  //     "$baseUrl/feed_rest_api.getFeaturedCategory";

  /// Privacy Content :
  // /// Privacy Content:
  // static String get termAndCondition =>
  //     "$baseUrl/feed_rest_api.contentPage&page_url=terms-and-connditions";
  // static String get refundPolicy =>
  //     "$baseUrl/feed_rest_api.contentPage&page_url=return-refund-en";
  // static String get aboutUs =>
  //     "$baseUrl/feed_rest_api.contentPage&page_url=about-us-en";
  // static String get privacyPolicy =>
  //     "$baseUrl/feed_rest_api.contentPage&page_url=privacy-policy-content";
  // static String get applyFilter => "$baseUrl/rest_api.productsLp";
  // static String get deleteAccount => "$baseUrl/feed_rest_api.account";

  /// ==========  =============  /////
  String get settingApi => "${controller.baseUrl}/api/rest/store/setting";
  String get cityApi => "${controller.baseUrl}/api/rest/store/cities";
  String get areaApi => "${controller.baseUrl}/api/rest/store/city/areas";
  String get productApi => "${controller.baseUrl}/api/rest/store/products";
  String get categoryApi => "${controller.baseUrl}/api/rest/mobile-categories";
  String get productDetailsApi =>
      "${controller.baseUrl}/api/rest/store/product";
  String get googleLoginApi =>
      "${controller.baseUrl}/api/rest/store/auth/google/login";
  String get whatsappLoginApi =>
      "${controller.baseUrl}/api/rest/store/checkout/send/otp";
  String get whatsappOtpLoginApi =>
      "${controller.baseUrl}/api/rest/store/checkout/login/otp";
  String get customerInfoApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/info";
  String get customerUpdateInfoApi =>
      "${controller.baseUrl}/api/rest/store/checkout/update/customer/info";
  String get saveAddressApi =>
      "${controller.baseUrl}/api/rest/store/checkout/add/customer/address";
  String get placeOrderApi =>
      "${controller.baseUrl}/api/rest/store/checkout/place/order";
  String get successOrderDetailsApi =>
      "${controller.baseUrl}/api/rest/store/checkout/order";
  String get analyticsApi =>
      "${controller.baseUrl}/api/rest/store/checkout/add-to-cart/analytic";
  String get bannerApi => "${controller.baseUrl}/api/rest/store/banners";
  String get searchApi =>
      "${controller.baseUrl}/api/rest/store/search/list?search=";
  String get loginApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/login";
  String get registerApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/register";
  String get orderHistoryApi =>
      "${controller.baseUrl}/api/rest/store/checkout/orders";
  String get newArrivalApi =>
      "${controller.baseUrl}/api/rest/store/new-arrivals";
  String get searchSuggestionApi =>
      "${controller.baseUrl}/api/rest/store/search/list?search";
  String get registrationApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/register";
  String get loginWithEmailApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/mobile-login";
  String get makeDefaultApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/address/set-default";
  String get deleteAddressApi =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/address/delete";
  String get updateAddressApi =>
      "${controller.baseUrl}/api/rest/store/checkout/update/customer/address";
  String get addToCartAnalyticsApi =>
      "${controller.baseUrl}/api/rest/store/checkout/add-to-cart/analytic";
  String get getDealsApi => "${controller.baseUrl}/api/rest/store/deals";
  String get verifyEmailOtp =>
      "${controller.baseUrl}/api/rest/store/checkout/customer/mobile-email-otp";

  ///

  // static String cityApi = "https://97115.ecomplug.com/api/rest/store/cities";
  // static String areaApi =
  //     "https://97115.ecomplug.com/api/rest/store/city/areas";

  // String productApi = "https://9711653.ecomplug.com/api/rest/store/products";
  //String productDetailsApi =
  //  "https://9711653.ecomplug.com/api/rest/store/product";

  ///
  // static String categoryApi =
  //     "https://97115.ecomplug.com/api/rest/mobile-categories";

  // static String googleLoginApi =
  //     "https://97115.ecomplug.com/api/rest/store/auth/google/login";
  // static String whatsappLoginApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/send/otp";
  // static String whatsappOtpLoginApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/login/otp";
  // static String customerInfoApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/info";
  // static String saveAddressApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/add/customer/address";
  // static String placeOrderApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/place/order";
  // static String successOrderDetailsApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/order";
  // static String analyticsApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/add-to-cart/analytic";
  // static String bannerApi = "https://97112.ecomplug.com/api/rest/store/banners";
  // static String searchApi =
  //     "https://97115.ecomplug.com/api/rest/store/search/list?search=";
  // static String loginApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/login";
  // static String registerApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/register";
  // static String orderHistoryApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/orders";
  // static String newArrivalApi =
  //     "https://97115.ecomplug.com/api/rest/store/new-arrivals";
  // static String searchSuggestionApi =
  //     "https://97115.ecomplug.com/api/rest/store/search/list?search";
  // static String registrationApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/register";
  // static String loginWithEmailApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/login";
  // static String makeDefaultApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/address/set-default";
  // static String deleteAddressApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/customer/address/delete";
  // static String updateAddressApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/update/customer/address";
  // static String addToCartAnalyticsApi =
  //     "https://97115.ecomplug.com/api/rest/store/checkout/add-to-cart/analytic";

  ///Dress Fair.ae= 9711694
}
