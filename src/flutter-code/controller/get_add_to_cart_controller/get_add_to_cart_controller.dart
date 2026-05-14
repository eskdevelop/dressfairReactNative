import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/best_sellers_model/best_sellers_model.dart';
import 'package:dress_fair_ecommmerce/model/get_cart_model/get_cart_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/get_add_to_cart_repositoy/get_add_to_cart_repository.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/tabs/all_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/tabs/best_sellers.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/tabs/great_day.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/tabs/new_arrivals.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../hive_db/all_cache/best_seller_cache_helper.dart';
import '../../hive_db/all_cache/newArrival_cache_helper.dart';

class GetAddToCartController extends GetxController {
  // Loading states:
  RxBool isLoading = false.obs;
  RxBool isLoadingSeller = false.obs;
  RxBool isLoadingGreatDay = false.obs;
  RxBool isLoadingNewArrivals = false.obs;
  Rx<TabController?> tabController = Rx<TabController?>(null);
  RxString label = "".obs;
  RxDouble opacity = 0.0.obs;
  // Data lists
  RxList<ProductItem> bestSeller = <ProductItem>[].obs;
  RxList<ProductItem> greatDay = <ProductItem>[].obs;
  RxList<ProductItem> newArrivals = <ProductItem>[].obs;
  // Pagination flags:
  RxBool isFetchingMore = false.obs;
  RxInt bestSellerCurrentPage = 1.obs;
  RxInt bestSellerTotalPages = 1.obs;
  RxInt greatCurrentPage = 1.obs;
  RxInt greatTotalPages = 1.obs;
  RxInt newArrivalsCurrentPage = 1.obs;
  RxInt newArrivalsTotalPages = 1.obs;

  /// Tabs:
  // List<String> tabs = ['All', 'Best Sellers', 'Great Day', 'New Arrivals'];
  List<String> tabs = ['all', 'bestSellers', 'greatDay', 'newArrivals'];

  List<Widget> cartScreens = [
    AllScreen(),
    BestSellers(),
    GreatDay(),
    NewArrivals(),
  ];

  /// Repositories & Controllers :
  final GetAddToCartRepository apiRepository = GetAddToCartRepository();
  SessionController sessionController = Get.find<SessionController>();
  Rxn<GetCartModel> allCarts = Rxn<GetCartModel>();

  /// Cache helpers:
  final NewArrivalsCacheHelper _newArrivalsCacheHelper =
      NewArrivalsCacheHelper();
  final BestSellerCacheHelper _bestSellerCacheHelper = BestSellerCacheHelper();

  // ==================== GET CART ====================
  Future<void> getAddToCart() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
  }

  // ==================== BEST SELLERS ====================
  // Future<void> loadBestSeller({bool isSilentRefresh = false}) async {
  //   final cached = _bestSellerCacheHelper.getProducts();
  //   if (cached.isNotEmpty && !isSilentRefresh) {
  //     bestSeller.assignAll(cached);
  //     log("Loaded ${cached.length} best sellers from cache");
  //   } else {
  //     log("Calling Api For Best sellers No cache");
  //   }
  //   await getBestSeller(page: 1, isSilentRefresh: true);
  // }

  // Future<void> getBestSeller({
  //   int page = 1,
  //   bool isSilentRefresh = false,
  // }) async {
  //   if (!isSilentRefresh) isLoadingSeller.value = true;
  //
  //   if (!await InternetController.checkUserConnection()) {
  //     AppToast.showError("internetDisconnected".tr);
  //     isLoadingSeller.value = false;
  //     return;
  //   }
  //
  //   try {
  //     final response = await apiRepository.getBestSeller(
  //       sessionToken: sessionController.sessionToken.value,
  //       page: page,
  //     );
  //     if (response != null && response["success"] == 1) {
  //       final items = (response['data'] as List)
  //           .map((e) => ProductItem.fromJson(e))
  //           .toList();
  //       bestSellerCurrentPage.value = response["current_page"] ?? 1;
  //       bestSellerTotalPages.value = response["total_pages"] ?? 1;
  //       if (page == 1) {
  //         bestSeller.assignAll(items);
  //         await _bestSellerCacheHelper.saveProducts(items);
  //       } else {
  //         bestSeller.addAll(items);
  //       }
  //     } else {
  //       AppToast.showError(response["error"].toString());
  //     }
  //   } catch (e) {
  //     log("Error fetching best sellers: $e");
  //     AppToast.showError(ErrorHandler.getErrorMessage(e));
  //   } finally {
  //     if (!isSilentRefresh) isLoadingSeller.value = false;
  //   }
  // }

  // Future<void> loadMoreBestSeller() async {
  //   if (isFetchingMore.value ||
  //       bestSellerCurrentPage.value >= bestSellerTotalPages.value)
  //     return;
  //   isFetchingMore.value = true;
  //   bestSellerCurrentPage.value++;
  //   await getBestSeller(
  //     page: bestSellerCurrentPage.value,
  //     isSilentRefresh: true,
  //   );
  //   isFetchingMore.value = false;
  // }

  // ==================== GREAT DAY ====================
  // Future<void> getGreatDay() async {
  //   if (!await InternetController.checkUserConnection()) {
  //     AppToast.showError("internetDisconnected".tr);
  //     return;
  //   }
  //
  //   try {
  //     isLoadingGreatDay.value = true;
  //     final response = await apiRepository.getGreatDay(
  //       sessionToken: sessionController.sessionToken.value,
  //       page: greatCurrentPage.value,
  //     );
  //
  //     if (response != null && response["success"] == 1) {
  //       final items = (response['data'] as List)
  //           .map((e) => ProductItem.fromJson(e))
  //           .toList();
  //       greatDay.assignAll(items);
  //       greatTotalPages.value = response["total_pages"] ?? 1;
  //     } else {
  //       AppToast.showError(response["error"].toString());
  //     }
  //   } catch (e) {
  //     log("Error fetching Great Day: $e");
  //     AppToast.showError(ErrorHandler.getErrorMessage(e));
  //   } finally {
  //     isLoadingGreatDay.value = false;
  //   }
  // }
  //
  // // ============= Load More Great Day  =====================
  // Future<void> loadMoreGreatDay() async {
  //   if (isFetchingMore.value || greatCurrentPage.value >= greatTotalPages.value)
  //     return;
  //   isFetchingMore.value = true;
  //   greatCurrentPage.value++;
  //   await getGreatDay();
  //   isFetchingMore.value = false;
  // }

  // ==================== NEW ARRIVALS ====================
  // Future<void> loadNewArrivals({bool isSilentRefresh = false}) async {
  //   final cached = _newArrivalsCacheHelper.getProducts();
  //   if (cached.isNotEmpty && !isSilentRefresh) {
  //     newArrivals.assignAll(cached);
  //     log("Loaded ${cached.length} new arrivals from cache");
  //   }
  //   await getNewArrivals(page: 1, isSilentRefresh: true);
  // }

  // Future<void> getNewArrivals({
  //   int page = 1,
  //   bool isSilentRefresh = false,
  // }) async
  // {
  //   if (!isSilentRefresh) isLoadingNewArrivals.value = true;
  //
  //   if (!await InternetController.checkUserConnection()) {
  //     AppToast.showError("internetDisconnected".tr);
  //     isLoadingNewArrivals.value = false;
  //     return;
  //   }
  //
  //   try {
  //     final response = await apiRepository.getNewArrivals(
  //       sessionToken: sessionController.sessionToken.value,
  //       page: page,
  //     );
  //
  //     if (response != null && response["success"] == 1) {
  //       final items = (response['data'] as List)
  //           .map((e) => ProductItem.fromJson(e))
  //           .toList();
  //
  //       newArrivalsCurrentPage.value = response["current_page"] ?? 1;
  //       newArrivalsTotalPages.value = response["total_pages"] ?? 1;
  //
  //       if (page == 1) {
  //         newArrivals.assignAll(items);
  //         await _newArrivalsCacheHelper.saveProducts(items);
  //       } else {
  //         newArrivals.addAll(items);
  //       }
  //     } else {
  //       AppToast.showError(response["error"].toString());
  //     }
  //   } catch (e) {
  //     log("Error fetching new arrivals: $e");
  //     AppToast.showError(ErrorHandler.getErrorMessage(e));
  //   } finally {
  //     if (!isSilentRefresh) isLoadingNewArrivals.value = false;
  //   }
  // }

  // Future<void> loadMoreNewArrivals() async {
  //   if (isFetchingMore.value ||
  //       newArrivalsCurrentPage.value >= newArrivalsTotalPages.value)
  //     return;
  //   isFetchingMore.value = true;
  //   newArrivalsCurrentPage.value++;
  //   await getNewArrivals(
  //     page: newArrivalsCurrentPage.value,
  //     isSilentRefresh: true,
  //   );
  //   isFetchingMore.value = false;
  // }
  /// For Facebook , Firebase Analytics, tiktok Tracking :
  void checkOutTrack({
    required double totalValue,
    required int itemCount,
    required List<String> productIds,
    int quantity = 1,
  }) {
    // FirebaseEventServiceController.instance.logInitiateCheckout(
    //   totalValue: totalValue,
    //   itemCount: itemCount,
    //   productIds: productIds,
    // );
  }
}
