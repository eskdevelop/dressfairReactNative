import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/events/facebook_events_service_controller/fb_service_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/hive_db/all_cache/related_product_cache_helper.dart';
import 'package:dress_fair_ecommmerce/model/detail_category_model/detail_category_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/product_repository/product_detail_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../events/tiktok_events_service_controller/titok_events_servie_controller.dart';

class ProductDetailController extends GetxController {
  Rx<TextEditingController> searchController = TextEditingController().obs;
  RxBool isLoadingProductDetail = false.obs;
  RxBool isLoading = false.obs;
  RxBool isRelatedLoading = false.obs;
  SessionController sessionController = Get.find<SessionController>();
  final ProductDetailRepository apiRepository = ProductDetailRepository();
  Rxn<ProductDetailModel> productDetail = Rxn<ProductDetailModel>();
  // RxList<RelatedCategoryModel> relatedProduct = <RelatedCategoryModel>[].obs;
  RxString selectedColorSku = ''.obs;
  RxString loadingSku = ''.obs;

  ///
  // Initialize selectedColorSku when loading product
  void initializeSelectedColor() {
    final colors = productDetail.value?.productColors;
    if (colors != null && colors.isNotEmpty) {
      selectedColorSku.value = colors.first.sku;
    }
  }

  // Method to change color
  Future<void> changeColor(String sku) async {
    selectedColorSku.value = sku;
    isVariantLoading.value = true;

    await getProductsDetail(cateSlug: sku, page: 1, fromVariant: true);

    isVariantLoading.value = false;
  }

  ///
  RxInt quantity = 1.obs;
  RxString selectedSize = "M".obs;
  RxInt selectedSizeProductId = 0.obs;
  RxInt selectedColorIndex = 0.obs;
  RxBool isSizeFirstTime = true.obs;
  RxInt selectedProductOptionId = 0.obs;
  RxInt selectedOptionValueId = 0.obs;
  RxBool isVariantLoading = false.obs;
  RxBool isMoreLoading = false.obs;
  int currentPage = 1;
  int totalPages = 1;
  final _relatedCacheHelper = RelatedProductCacheHelper();
  RxInt selectedPriceIndex = 0.obs;

  Future<void> getProductsDetail({
    required String cateSlug,
    //   required int categoryId,
    required int page,
    bool fromVariant = false,
  }) async {
    // ✅ 1. Try cache first (instant UI load):
    // final cached = await ProductDetailCacheHelper.getProductDetail(
    //   cateSlug,
    //   categoryId,
    // );
    // if (cached != null) {
    //   productDetail.value = cached;
    //   log(" Loaded product from cache for $cateSlug");
    //   return;
    // } else {
    //   log("Cache not found or expired for $cateSlug");
    // }
    // ✅ 2. Fetch fresh data from API (and update cache):

    if (await InternetController.checkUserConnection()) {
      try {
        if (fromVariant) {
          isVariantLoading.value = true;
        } else {
          isLoadingProductDetail.value = true;
        }
        final response = await apiRepository.getProductsDetail(
          sessionToken: sessionController.sessionToken.value,
          cateSlug: cateSlug,
        );
        if (response != null && response["success"] == true) {
          final fetched = ProductDetailModel.fromJson(response);
          productDetail.value = fetched;
          log("Response in Detail Api ==$fetched");
          // ✅ Save new data in cache:
          //   await ProductDetailCacheHelper.saveProductDetail(cateSlug, fetched);

          if (fetched.options.isNotEmpty) {
            selectedColorIndex.value = 0;
          }

          if (fetched.prices.isNotEmpty) {
            selectedPriceTier.value = fetched.prices.first;
          }

          /// ✅ SAFE color index reset
          // if (fetched.productColors.isNotEmpty) {
          //   selectedColorIndex.value = 0;
          // } else {
          //   selectedColorIndex.value = 0;
          // }

          if (fetched.options.isNotEmpty) {
            selectedSize.value = fetched.options.first.label;
            selectedSizeProductId.value = fetched.options.first.productOptionId;
          }
        } else {
          log("Error in Product Detail == ${response["error"]}");
          AppToast.showError(response["error"].toString());
        }
        isLoadingProductDetail.value = false;
      } catch (e) {
        log("❌ Error in Product Detail == ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
      } finally {
        if (fromVariant) {
          isVariantLoading.value = false;
        } else {
          isLoadingProductDetail.value = false;
        }
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// Optional: Clear all cached related products
  Future<void> clearCache() async {
    await _relatedCacheHelper.clearCache();
    log("🧹 Related products cache cleared.");
  }

  ///Normal Methode For Other classes :
  // Future<void> firstSelectionRelatedProductsLoad({
  //   required int category,
  //   required int page,
  // }) async
  // {
  //   try {
  //     // log("Category ID 234== $category");
  //     // final cached = _relatedCacheHelper.getRelatedProducts(category);
  //     // if (cached.isNotEmpty) {
  //     //   log(
  //     //     "✅ Loaded ${cached.length} related products from cache for category $category",
  //     //   );
  //     //   relatedProduct.assignAll(cached);
  //     //
  //     //   // // Silent background refresh (optional):
  //     //   // getRelatedProducts(category: category, page: page, silent: true);
  //     //   return;
  //     // }
  //
  //     // await getRelatedProducts(category: category, page: page, silent: false);
  //   } catch (e) {
  //     log("❌ Error loading cached related products: $e");
  //   }
  // }

  /// For Facebook  , Firebase Analytics , tikTok Tracking :
  void trackProductView({
    required String productId,
    required String productName,
    required double price,
    required String sku,
  }) {
    FacebookEventService.instance.logViewContent(
      productId: productId,
      productName: productName,
      price: price,
      sku: sku,
    );
    TikTokService().handleViewContent(
      contentId: productId,
      contentType: 'Product=$sku',
      contentName: productName,
      price: price,
    );

    // trackViewProduct(
    //   productId: productId,
    //   productName: productName,
    // );
    // FirebaseEventServiceController.instance.logViewContent(
    //   productId: productId,
    //   productName: productName,
    //   price: price,
    //   sku: sku,
    // );
  }

  ///Price Selection Tire:
  Rxn<ProductPriceTier> selectedPriceTier = Rxn<ProductPriceTier>();

  void selectPriceTier(ProductPriceTier tier) {
    selectedPriceTier.value = tier;
  }

  ProductPriceTier? get activePrice =>
      selectedPriceTier.value ?? productDetail.value?.primaryPrice;

  bool getDialogSize() {
    if ((productDetail.value?.productColors != null &&
            productDetail.value!.productColors.isNotEmpty &&
            productDetail.value!.productColors.length >= 2) &&
        (productDetail.value?.options != null &&
            productDetail.value!.options.isNotEmpty &&
            productDetail.value!.options.length >= 2)) {
      log("Dialog True = ");
      return true;
    } else {
      log("Dialog False =");
      return false;
    }
  }
}
