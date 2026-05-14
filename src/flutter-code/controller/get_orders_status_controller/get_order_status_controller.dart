import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/order_status_model/get_order_by_id_model.dart';
import 'package:dress_fair_ecommmerce/model/order_status_model/order_status_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/get_address_status_repository/get_address_status_repository.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/Delivered_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/all_orders.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/cancel_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/pending_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/processing_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/return_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/nav_items/shipped_screen.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetOrderStatusController extends GetxController {
  RxBool isLoading = false.obs;

  final GetOrderStatusRepository apiRepository = GetOrderStatusRepository();
  SessionController sessionController = Get.find<SessionController>();
  Rxn<OrderStatusModel> orderStatuses = Rxn<OrderStatusModel>();
  Rxn<GetOrderByIdModel> orderByID = Rxn<GetOrderByIdModel>();
  RxList<Order> allOrder = <Order>[].obs;
  RxList<Order> pending = <Order>[].obs;
  RxList<Order> complete = <Order>[].obs;
  RxList<Order> canceled = <Order>[].obs;
  RxList<Order> processing = <Order>[].obs;
  RxList<Order> shipped = <Order>[].obs;
  RxList<Order> delivered = <Order>[].obs;
  RxList<Order> returned = <Order>[].obs;

  var currentStatusIndex = 0.obs;
  void changeStatusTab(int index) {
    currentStatusIndex.value = index;
  }

  final List<Widget> orderTrackScreens = [
    AllOrders(),
    PendingScreen(),
    ProcessingScreen(),
    ShippedScreen(),
    DeliveredScreen(),
    CancelScreen(),
    ReturnScreen(),
  ];

  final List<String> orderTrackTabs = [
    "allOrders".tr,
    "pending".tr,
    "processing".tr,
    "shipped".tr,
    "delivered".tr,
    "cancel".tr,
    "returned".tr,
  ];

  /// Fetch all orders and categorize by status
  Future<void> getOrderStatus() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }

    try {
      isLoading.value = true;
      final response = await apiRepository.getOrderStatus(
        sessionToken: sessionController.sessionToken.value,
      );
      if (response != null && response["success"] == true) {
        if (response['orders'] != null) {
          orderStatuses.value = OrderStatusModel.fromJson(response);
          allOrder.clear();
          pending.clear();
          complete.clear();
          canceled.clear();
          processing.clear();
          shipped.clear();
          delivered.clear();
          returned.clear();
          final ordersList = orderStatuses.value!.orders;
          allOrder.addAll(ordersList);
          for (var order in ordersList) {
            final status = order.orderStatus.toLowerCase();
            switch (status) {
              case 'pending':
                pending.add(order);
                break;
              case 'processing':
                processing.add(order);
                break;
              case 'shipped':
                shipped.add(order);
                break;
              case 'delivered':
                delivered.add(order);
                break;
              case 'canceled':
              case 'cancel':
                canceled.add(order);
                break;
              case 'returned':
              case 'return':
                returned.add(order);
                break;
              case 'complete':
                complete.add(order);
                break;
            }
          }

          log(
            "✅ Orders categorized: All=${allOrder.length}, Pending=${pending.length}, Complete=${complete.length}, "
            "Canceled=${canceled.length}, Processing=${processing.length}, Shipped=${shipped.length}, Delivered=${delivered.length}, Returned=${returned.length}",
          );
        }
      } else {
        AppToast.showError(
          (response?["message"] as String?) ?? "Something went wrong",
        );
      }
      isLoading.value = false;
    } catch (e) {
      log("Error in Get Order Status = ${e.toString()}");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  /// Get Order by ID:
  Future<void> getOrderByID(String id) async {
    // if (!await InternetController.checkUserConnection()) {
    //   AppToast.showError("internetDisconnected".tr);
    //   return;
    // }
    //
    // try {
    //   isLoading.value = true;
    //
    //   final response = await apiRepository.getOrderByID(
    //     sessionToken: sessionController.sessionToken.value,
    //     id: id,
    //   );
    //
    //   if (response != null && response["success"] == true) {
    //     if (response['data'] != null) {
    //       orderByID.value = GetOrderByIdModel.fromJson(response['data']);
    //     } else {
    //       log("Get Order BY ID is Empty");
    //     }
    //   } else {
    //     AppToast.showError(
    //       (response?["message"] as String?) ?? "Something went wrong",
    //     );
    //   }
    // } catch (e) {
    //   log("Error in Get Order Status = ${e.toString()}");
    //   AppToast.showError(ErrorHandler.getErrorMessage(e));
    // } finally {
    //   isLoading.value = false;
    // }
  }

  String cleanText(String html) {
    return html
        .replaceAll(RegExp(r'<br\s*/?>'), ', ')
        .replaceAll(RegExp(r'<[^>]*>'), '')
        .trim();
  }
}
