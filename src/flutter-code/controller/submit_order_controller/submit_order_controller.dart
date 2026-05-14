import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/events/facebook_events_service_controller/fb_service_controller.dart';
import 'package:dress_fair_ecommmerce/controller/events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import 'package:dress_fair_ecommmerce/controller/home_controller/home_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/success_order_model/success_order_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/submit_order_repository/submit_order_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:tiktok_events_sdk/tiktok_events_sdk.dart';

import '../add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class SubmitOrderController extends GetxController {
  RxBool isLoading = false.obs;
  RxBool isLoadingSuccess = false.obs;
  final AddToCartController cartController = Get.find();
  final SubmitOrderRepository apiRepository = SubmitOrderRepository();
  SessionController sessionController = Get.find<SessionController>();
  BottomNavController bottomNavController = Get.find<BottomNavController>();

  /// store success order response:
  Rxn<OrderSuccessModel> successOrder = Rxn<OrderSuccessModel>();

  /// Confirm Order Post Request:
  Future<void> confirmOrderPostReq({required Map<String, dynamic> body}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.confirmOrder(
          sessionToken: sessionController.sessionToken.value,
          body: body,
        );
        if (response != null && response["success"] == true) {
          AppToast.showError("Successfully Place Order");
          log("Response == ${response["order_id"]}");
          Get.offNamed(
            successScreen,
            arguments: {'orderId': response["order_id"]},
          );
          cartController.removeCheckoutSelectedItems();
        } else {
          AppToast.showError(response["message"]);
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in Post Req Confirm = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Confirm Order Put Request:
  // Future<void> confirmOrderPutReq() async {
  //   if (await InternetController.checkUserConnection()) {
  //     try {
  //       isLoading.value = true;
  //       var response = await apiRepository.confirmOrderPut(
  //         sessionToken: sessionController.sessionToken.value,
  //         language: sessionController.selectedLanguageCode,
  //       );
  //       if (response != null && response["success"] == 1) {
  //         AppToast.showSuccess("SuccessFully Confirmed Order");
  //         Get.toNamed(
  //           successScreen,
  //           arguments: {"orderId": response['data']['order_id']},
  //         );
  //       } else {
  //         AppToast.showError(response?["error"] ?? "Failed to load categories");
  //       }
  //       isLoading.value = false;
  //     } catch (e) {
  //       log("Error in Put Confirm Req = ${e.toString()}");
  //       AppToast.showError(ErrorHandler.getErrorMessage(e));
  //       isLoading.value = false;
  //     }
  //   } else {
  //     AppToast.showError("internetDisconnected".tr);
  //   }
  // }
  /// Confirm Order Confirm Request:
  Future<void> getSuccessOrder({required String orderId}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoadingSuccess.value = true;
        var response = await apiRepository.getSuccessOrders(
          sessionToken: sessionController.sessionToken.value,
          orderId: orderId,
        );
        if (response != null && response["success"] == true) {
          successOrder.value = null;

          /// Map directly from data:
          successOrder.value = OrderSuccessModel.fromJson(response['data']);
          logPurchase(
            amount:
                double.tryParse(
                  successOrder.value?.orderTotalAmount ?? "0.0",
                ) ??
                0.0,
            currency: successOrder.value?.currencyCode ?? "",
            price: successOrder.value?.orderTotalAmount ?? "",
            productId: "",
            productName: successOrder.value?.customerName ?? "",
            quantity:
                successOrder.value?.orderProducts.first.orderProductQuantity ??
                1,
          );
        } else {
          AppToast.showError(response?["message"] ?? "Failed to load order");
        }
        isLoadingSuccess.value = false;
      } catch (e) {
        log("Error in success  Order api = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoadingSuccess.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// For Fb Tracking :
  void logPurchase({
    required double amount,
    required String currency,
    required String price,
    required String productId,
    required int quantity,
    String? productName,
    String? orderId,
  }) {
    FacebookEventService.instance.logPurchase(
      productId: productId,
      productName: productName,
      price: price,
      amount: amount,
      currency: currency,
    );

    TikTokService().handleCustomEvent(
      eventType: TTEventType.purchase,
      value: double.tryParse(price) ?? 0.0,
      contentName: productName ?? "",
      eventId: productId,
      quantity: quantity,
    );
    // FirebaseEventServiceController.instance.logPurchase(
    //   productId: productId,
    //   productName: productName,
    //   orderId: productId,
    //   amount: amount,
    // );
  }
}
