import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../model/main_product_model/main_product_model.dart';
import '../../repository/service/network/repository/new_arrival_repository/new_arrival_repository.dart';

class NewArrivalController extends GetxController {
  RxList<MainProductModel> newArrivals = <MainProductModel>[].obs;

  SessionController controller = Get.find<SessionController>();
  final NewArrivalRepository apiRepository = NewArrivalRepository();
  final Map<String, int> currentPageMap = {};
  final Map<String, int> totalPagesMap = {};
  final Map<String, bool> hasMoreDataMap = {};
  RxBool isLoading = false.obs; // first load
  RxBool isMoreLoading = false.obs; // pagination
  /// Helper to get hasMoreData for a category
  bool getHasMoreData(String cateSlug) => hasMoreDataMap[cateSlug] ?? true;
  int currentPage = 1;
  bool hasMore = true;
  Future<void> requestNextPage() async {
    if (isMoreLoading.value) return;
    if (!hasMore) return;

    await getNewArrivals(isPagination: true);
  }
  //
  // Future<void> getNewArrivals({bool isPagination = false}) async {
  //   if (isPagination) {
  //     if (isMoreLoading.value || !hasMore) return;
  //     isMoreLoading.value = true;
  //   } else {
  //     isLoading.value = true;
  //     currentPage = 1;
  //     hasMore = true;
  //     newArrivals.clear();
  //   }
  //
  //   if (!await InternetController.checkUserConnection()) {
  //     AppToast.showError("internetDisconnected".tr);
  //     isLoading.value = false;
  //     isMoreLoading.value = false;
  //     return;
  //   }
  //
  //   try {
  //     final response = await apiRepository.getNewArrivals(
  //       sessionToken: controller.sessionToken.value,
  //       page: currentPage,
  //     );
  //     if (response != null && response["success"] == true) {
  //       final List<MainProductModel> fetchedList = (response["data"] as List)
  //           .map((e) => MainProductModel.fromJson(e))
  //           .toList();
  //       if (fetchedList.isEmpty) {
  //         hasMore = false;
  //       } else {
  //         newArrivals.assignAll(fetchedList);
  //         currentPage++;
  //       }
  //     }
  //   } catch (e) {
  //     log("Error fetching new arrivals: $e");
  //     AppToast.showError(ErrorHandler.getErrorMessage(e));
  //   } finally {
  //     isLoading.value = false;
  //     isMoreLoading.value = false;
  //   }
  // }

  Future<void> getNewArrivals({bool isPagination = false}) async {
    if (isPagination) {
      isMoreLoading.value = true;
    } else {
      isLoading.value = true;
      currentPage = 1;
      hasMore = true;
      newArrivals.clear();
    }

    try {
      final response = await apiRepository.getNewArrivals(
        sessionToken: controller.sessionToken.value,
        page: currentPage,
        isPagination: isPagination,
      );

      if (response != null && response["success"] == true) {
        final List<MainProductModel> fetchedList = (response["data"] as List)
            .map((e) => MainProductModel.fromJson(e))
            .toList();

        if (fetchedList.isEmpty) {
          hasMore = false;
        } else {
          newArrivals.addAll(fetchedList);
          currentPage++;
        }
      }
    } catch (e) {
      log("Error fetching new arrivals: $e");
    } finally {
      isLoading.value = false;
      isMoreLoading.value = false;
    }
  }
}
