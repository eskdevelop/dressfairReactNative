// import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
// import 'package:dress_fair_ecommmerce/repository/service/network/repository/delete_add_to_cart/delete_add_to_card_repository.dart';
// import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
//
// import '../get_add_to_cart_controller/get_add_to_cart_controller.dart';
//
// class DeleteAddToCartController extends GetxController {
//   RxBool isLoading = false.obs;
//
//   final DeleteAddToCardRepository apiRepository = DeleteAddToCardRepository();
//   GetAddToCartController getAddToCartController =
//       Get.find<GetAddToCartController>();
//
//   SessionController sessionController = Get.find<SessionController>();
//   Future<void> deleteAddToCart({required String id}) async {
//     if (await InternetController.checkUserConnection()) {
//       var response;
//       try {
//         isLoading.value = true;
//         response = await apiRepository.deleteAddToCart(
//           sessionToken: sessionController.sessionToken.value,
//           id: id,
//         );
//         if (response != null && response["success"] == 1) {
//           getAddToCartController.allCarts.value = null;
//           await getAddToCartController.getAddToCart();
//           AppToast.showSuccess("Deleted SuccessFully");
//         } else {
//           AppToast.showError("Error Occurred");
//         }
//         isLoading.value = false;
//       } catch (e) {
//         AppToast.showError(ErrorHandler.getErrorMessage(e));
//         isLoading.value = false;
//       }
//     } else {
//       AppToast.showError("internetDisconnected".tr);
//     }
//   }
// }
