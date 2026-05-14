import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import '../category_controller/category_controller.dart';
import '../customer_profile/customer_profile_controller.dart';
import '../home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';
import '../new_arrival_controller/new_arrival_controller.dart';
import '../product_controller/product_controller.dart';
import '../product_controller/product_detail_controller.dart';

class RefreshAllApiController extends GetxController {
  final sessionController = Get.find<SessionController>();
  final categoryController = Get.find<CategoryController>();
  final productController = Get.find<ProductController>();
  final addToCartController = Get.find<AddToCartController>();
  final newArrivalController = Get.find<NewArrivalController>();
  final getProfileController = Get.find<GetProfileController>();
  final getBannerController = Get.find<GetBannerController>();
  final productDetailController = Get.put(ProductDetailController());
  RxBool isLoading = false.obs;

  /// Clear Auth:
  clearAuth() async {
    final loginController = Get.find<SessionController>();
    await UserPreferences.removeToken();
    await UserPreferences.removeIsUserLogin();
    await UserPreferences.setIsUserFirstTime(true);
    loginController.sessionToken.value = "";
    loginController.isUserLoginIn.value = false;
    loginController.isUserFirstTime.value = true;
  }

  /// Refresh Data:
  Future<void> refreshAllData(String value) async {
    try {
      clearProductDetails();
      addToCartController.clearCart();
      sessionController.selectedCountry.value = value;
      sessionController.setBaseUrl(value);
      UserPreferences.setSelectedCountry(value);
      await clearAuth();

      /// 2️⃣ FETCH ESSENTIAL APIs (same as splash):
      await sessionController.getConfig();
      await categoryController.getCategories();

      /// 3️⃣ BACKGROUND APIs (fire & forget):
      Future.wait([
        productController.loadProducts(cateSlug: "", page: 1),
        newArrivalController.getNewArrivals(),
        getProfileController.getCustomerProfile(false),
        sessionController.fetchUserLocation(),
      ]);
      isLoading.value = false;
      Get.offAllNamed(homeScreen);
    } catch (e) {
      debugPrint("Refresh error: $e");
      isLoading.value = false;
    } finally {
      isLoading.value = false;
    }
  }

  clearProductDetails() {
    isLoading.value = true;
    productDetailController.quantity.value = 1;
    productDetailController.selectedSize.value = "M";
    productDetailController.selectedSizeProductId.value = 1;
    productDetailController.selectedColorIndex.value = 0;
    productDetailController.isSizeFirstTime.value = true;
    productDetailController.selectedProductOptionId.value = 0;
    productDetailController.selectedOptionValueId.value = 0;
    productDetailController.currentPage = 1;
    productDetailController.totalPages = 1;
    productDetailController.selectedPriceIndex.value = 0;
    productDetailController.selectedColorSku.value = "";
  }
}
