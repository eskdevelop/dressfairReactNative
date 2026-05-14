import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:get/get.dart';
import 'package:hive/hive.dart';
import 'package:tiktok_events_sdk/tiktok_events_sdk.dart';

import '../../repository/service/network/repository/add_to_cart_repository/add_to_cart_repository.dart';
import '../../view/util/app_toast/app_toast.dart';
import '../events/facebook_events_service_controller/fb_service_controller.dart';
import '../events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import '../internet_connectivity_check/InternetController.dart';

class AddToCartController extends GetxController {
  static const String cartBoxName = 'cart_cache';
  SessionController sessionController = Get.find<SessionController>();
  late Box cartBox;
  RxBool isLoading = false.obs;
  RxBool isShowBottomSheet = false.obs;
  RxBool isShowCheckoutBottomSheet = false.obs;
  final AddToCartRepository apiRepository = AddToCartRepository();

  //   /// Get categories:
  Future<void> addToCartAnalyticsApi({
    required int productId,
    required int productGroupId,
  }) async {
    Map<String, dynamic> body = {
      "product_id": productId,
      "product_group_id": productGroupId,
    };
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.addToCart(
          sessionToken: sessionController.sessionToken.value,
          body: body,
        );
        if (response != null && response["success"] == true) {
          AppToast.showSuccess("successFullyAdded".tr);
        } else {
          AppToast.showError(response['message']);
        }
        isLoading.value = false;
      } catch (e) {
        log("Error in add To Cart Ananlytics = ${e.toString()}");
        //   AppToast.showError(ErrorHandler.getErrorMessage(e));
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  ///Remove Specified items :
  /// Remove ONLY checkout-selected items
  Future<void> removeCheckoutSelectedItems() async {
    try {
      cartItems.removeWhere((item) => item['isSelected'] == true);

      await cartBox.put('items', cartItems.toList());

      cartItems.refresh();
      log("✅ Selected checkout items removed");
    } catch (e) {
      log("❌ Error removing selected checkout items: $e");
    }
  }

  /// 🔥 In-memory reactive list (instant UI):
  final RxList<Map<String, dynamic>> cartItems = <Map<String, dynamic>>[].obs;

  @override
  Future<void> onInit() async {
    super.onInit();
    if (!Hive.isBoxOpen(cartBoxName)) {
      await Hive.openBox(cartBoxName);
    }
    cartBox = Hive.box(cartBoxName);
    loadCartFromHive();
  }

  /// Load cart from Hive → RxList with priceList support:
  void loadCartFromHive() {
    try {
      final List stored = cartBox.get('items', defaultValue: []);
      cartItems.assignAll(
        stored.map((e) {
          final item = Map<String, dynamic>.from(e);
          if (item.containsKey('priceList') && item['priceList'] is List) {
            final priceListData = item['priceList'] as List;
            item['priceList'] = priceListData
                .map((priceItem) => Map<String, dynamic>.from(priceItem))
                .toList();
            log("✅ Converted priceList to List<Map<String, dynamic>>");
          }

          return item;
        }).toList(),
      );
      log("✅ Loaded ${cartItems.length} cart items");
    } catch (e) {
      log("❌ Error loading cart from Hive: $e");
    }
  }

  /// Add To Cart Plus:
  Future<void> addToCartPlus({
    required int productId,

    required String name,
    required String nameAr,
    required String image,
    required double price,
    required String normalPrice,
    required double discountPrice,
    required int discountPercent,
    required int quantity,
    required String size,
    required String color,
    required String sku,
    required int optionId,
    required List<Map<String, dynamic>> priceList,
    required bool isSelected,
  }) async {
    try {
      isLoading.value = true;

      // Function to calculate the correct price based on priceList & quantity:
      double getPriceForQuantity(
        int quantity,
        List<Map<String, dynamic>> priceList,
      ) {
        if (priceList.isEmpty) return price;
        // Sort bundles by quantity ascending
        final sortedBundles = List<Map<String, dynamic>>.from(priceList)
          ..sort(
            (a, b) => (a['quantity'] as int).compareTo(b['quantity'] as int),
          );

        // Find exact match
        final exactMatch = sortedBundles.firstWhere(
          (bundle) => bundle['quantity'] == quantity,
          orElse: () => {},
        );

        if (exactMatch.isNotEmpty) {
          return (exactMatch['offer_price'] as num).toDouble();
        }
        // If no exact match, use first bundle price multiplied by quantity:
        final firstBundlePrice = (sortedBundles.first['offer_price'] as num)
            .toDouble();
        return firstBundlePrice * quantity;
      }

      final index = cartItems.indexWhere(
        (e) =>
            e['productId'] == productId &&
            e['size'] == size &&
            e['color'] == color,
      );

      if (index != -1) {
        final currentQuantity = cartItems[index]['quantity'] as int;
        final newQuantity = currentQuantity + quantity;

        /// for Normal Price :
        final newNormalPrice = calculateNormalPrice(
          quantity: newQuantity,
          baseNormalPrice:
              double.tryParse(cartItems[index]['normalPrice'].toString()) ??
              0.0,
          priceList:
              cartItems[index]['priceList'] as List<Map<String, dynamic>>,
        );

        /// For Total or sale price :
        double price = getPriceForQuantity(
          newQuantity,
          cartItems[index]['priceList'],
        );

        /// Get Discount price :
        final discountData = calculateDiscountForBundles(
          quantity: newQuantity,
          priceList: priceList,
        );
        cartItems[index]['quantity'] = newQuantity;
        cartItems[index]['normalPrice'] = newNormalPrice;
        cartItems[index]['price'] = price;
        cartItems[index]['discountPrice'] = discountData['discountPrice'];
        cartItems[index]['discountPercent'] = discountData['discountPercent'];
        log("Discount Price == ${cartItems[index]['discountPrice']}");
        log("Discount percent == ${cartItems[index]['discountPercent']}");
      } else {
        /// Add new item with price based on bundle:
        final calculatedPrice = getPriceForQuantity(quantity, priceList);

        cartItems.add({
          'productId': productId,
          'name': name,
          'nameAr': nameAr,
          'image': image,
          'price': calculatedPrice,
          'normalPrice': normalPrice,
          'discountPrice': discountPrice,
          'discountPercent': discountPercent,
          'quantity': quantity,
          'size': size,
          'color': color,
          'sku': sku,
          'optionId': optionId,
          'priceList': priceList,
          'isSelected': true,
        });
      }

      await cartBox.put('items', cartItems.toList());
      log("✅ Cart updated: ${cartItems.length} items");

      AppToast.showSuccess("Quantity Added Successfully");

      cartItems.refresh();
    } catch (e) {
      log("❌ Add to cart error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// For Plus Discount Calculation :
  Map<String, double> calculateDiscountForBundles({
    required int quantity,
    required List<Map<String, dynamic>> priceList,
  }) {
    if (priceList.isEmpty) {
      return {'discountPrice': 0.0, 'discountPercent': 0.0, 'bundlePrice': 0.0};
    }

    // Sort bundles by quantity ascending
    final sortedBundles = List<Map<String, dynamic>>.from(priceList)
      ..sort((a, b) => (a['quantity'] as int).compareTo(b['quantity'] as int));

    double totalPrice = 0.0;
    double totalNormal = 0.0;

    int remainingQuantity = quantity;

    // Iterate bundles
    for (int i = sortedBundles.length - 1; i >= 0; i--) {
      final bundle = sortedBundles[i];
      final bundleQty = bundle['quantity'] as int;
      final bundleOffer = (bundle['offer_price'] as num).toDouble();
      final bundleNormal = (bundle['normal_price'] as num).toDouble();

      if (remainingQuantity >= bundleQty) {
        totalPrice += bundleOffer;
        totalNormal += bundleNormal;
        remainingQuantity -= bundleQty;
        break; // Stop at the largest fitting bundle
      }
    }

    // If quantity exceeds all bundles, use first bundle price for remaining units
    if (remainingQuantity > 0) {
      final firstBundle = sortedBundles.first;
      final firstOffer = (firstBundle['offer_price'] as num).toDouble();
      final firstNormal = (firstBundle['normal_price'] as num).toDouble();

      totalPrice += firstOffer * remainingQuantity;
      totalNormal += firstNormal * remainingQuantity;
    }

    final discountPrice = totalNormal - totalPrice;
    final discountPercent = totalNormal > 0
        ? ((discountPrice / totalNormal) * 100).roundToDouble()
        : 0.0;

    return {
      'bundlePrice': totalPrice,
      'discountPrice': discountPrice > 0 ? discountPrice : 0.0,
      'discountPercent': discountPercent > 0 ? discountPercent : 0.0,
    };
  }

  /// Add TO Cart :
  Future<void> addToCart({
    required int productId,
    required int productGroupId,
    required String name,
    required String nameAr,
    required String image,
    required double price,
    required String normalPrice,
    required double discountPrice,
    required int discountPercent,
    required int quantity,
    required String size,
    required String color,
    required String sku,
    required int optionId,
    required List<Map<String, dynamic>> priceList,
    required bool isSelected,
  }) async {
    try {
      isLoading.value = true;

      final index = cartItems.indexWhere(
        (e) =>
            e['productId'] == productId &&
            e['size'] == size &&
            e['color'] == color,
      );

      if (index != -1) {
        cartItems[index]['quantity'] += quantity;
      } else {
        cartItems.add({
          'productId': productId,
          'name': name,
          'nameAr': nameAr,
          'image': image,
          'price': price,
          'normalPrice': normalPrice,
          'discountPrice': discountPrice,
          'discountPercent': discountPercent,
          'quantity': quantity == 0 ? 1 : quantity,
          'size': size,
          'color': color,
          'sku': sku,
          'optionId': optionId,
          'priceList': priceList,
          'isSelected': true,
        });
      }

      await cartBox.put('items', cartItems.toList());

      log("✅ Cart updated: ${cartItems.length} items");
      log("✅ Cart Quantity : $quantity");
      log("✅ Cart Product ID : $productId");
      log("✅ Cart product Group Id: $productGroupId items");

      await addToCartAnalyticsApi(
        productId: productId,
        productGroupId: productGroupId,
      );

      logAddToCart(
        productId: productId.toString() ?? "",
        productName: name ?? "",
        quantity: quantity,
        price: double.tryParse(normalPrice) ?? 0.0,
      );

      AppToast.showSuccess("Add To Cart Successfully");
      cartItems.refresh();
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      log("❌ Add to cart error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  /// Remove item by index
  Future<void> removeItem(int index) async {
    try {
      if (index >= 0 && index < cartItems.length) {
        cartItems.removeAt(index);
        await cartBox.put('items', cartItems.toList());
        log("✅ Item removed from cart");
      }
    } catch (e) {
      log("❌ Error removing item: $e");
    }
  }

  /// Remove item by product details
  Future<void> removeItemByProduct({
    required int productId,
    required String size,
    required String color,
  }) async {
    try {
      final index = cartItems.indexWhere(
        (e) =>
            e['productId'] == productId &&
            e['size'] == size &&
            e['color'] == color,
      );

      if (index != -1) {
        await removeItem(index);
      }
    } catch (e) {
      log("❌ Error removing item by product: $e");
    }
  }

  /// Update quantity for specific item
  Future<void> updateQuantity({
    required int index,
    required int newQuantity,
  }) async {
    try {
      if (index >= 0 && index < cartItems.length && newQuantity > 0) {
        cartItems[index]['quantity'] = newQuantity;
        await cartBox.put('items', cartItems.toList());
        log("✅ Quantity updated to $newQuantity");

        // Refresh UI
        cartItems.refresh();
      }
    } catch (e) {
      log("❌ Error updating quantity: $e");
    }
  }

  /// Clear cart
  Future<void> clearCart() async {
    try {
      cartItems.clear();
      await cartBox.delete('items');
      log("✅ Cart cleared");
    } catch (e) {
      log("❌ Error clearing cart: $e");
    }
  }

  /// Total items count (badge) - FIXED
  double get totalPrice1 => cartItems.fold<double>(
    0.0,
    (sum, item) => sum + ((item['price'] as num?)?.toDouble() ?? 0.0),
  );

  double get selectedTotalPrice => cartItems
      .where((item) => item['isSelected'] == true)
      .fold<double>(
        0.0,
        (sum, item) => sum + ((item['price'] as num?)?.toDouble() ?? 0.0),
      );

  /// Total Amount with Shipping Charges :
  double get totalWithShippingCharges {
    double totalWithShipping = selectedTotalPrice;

    final config = sessionController.countryConfig.value;

    final double shippingAmount =
        double.tryParse(config?.shippingAmount ?? '0') ?? 0.0;

    final double shippingLimit =
        double.tryParse(config?.freeShippingLimit ?? '0') ?? 0.0;
    if (selectedTotalPrice > 0) {
      if (selectedTotalPrice <= shippingLimit) {
        totalWithShipping = selectedTotalPrice + shippingAmount;
      }
    }
    return totalWithShipping;
  }

  /// For Total Normal Price :
  double get selectedTotalNormalPrice => cartItems
      .where((item) => item['isSelected'] == true)
      .fold<double>(0.0, (sum, item) {
        final normalPrice = item['normalPrice'];
        double price = 0.0;

        if (normalPrice is num) {
          price = normalPrice.toDouble();
        } else if (normalPrice is String) {
          price = double.tryParse(normalPrice) ?? 0.0;
        }

        return sum + price;
      });
  double get selectedDiscount {
    final discount = selectedTotalNormalPrice - selectedTotalPrice;
    return discount > 0 ? discount : 0.0;
  }

  /// Get price list for specific item
  List<Map<String, dynamic>>? getPriceListForItem(int index) {
    if (index >= 0 && index < cartItems.length) {
      final priceList = cartItems[index]['priceList'];
      if (priceList is List) {
        return List<Map<String, dynamic>>.from(
          priceList.map((e) => Map<String, dynamic>.from(e)),
        );
      }
    }
    return null;
  }

  /// Check if item has price list/bundles
  bool hasPriceList(int index) {
    if (index >= 0 && index < cartItems.length) {
      final priceList = cartItems[index]['priceList'];
      return priceList is List && priceList.isNotEmpty;
    }
    return false;
  }

  /// check if any isslected or not :
  bool get hasSelectedItems =>
      cartItems.any((item) => item['isSelected'] == true);

  /// Check if free shipping
  /// Returns shipping amount (0 = FREE)
  double checkShipping(double totalPrice) {
    final config = sessionController.countryConfig.value;

    if (config == null) return 0.0;

    final double shippingAmount = double.tryParse(config.shippingAmount) ?? 0.0;
    final double freeShippingLimit =
        double.tryParse(config.freeShippingLimit) ?? 0.0;

    // If flat shipping is 0 → always free
    if (shippingAmount == 0) return 0.0;

    // If free shipping limit is 0 → always charge shipping
    if (freeShippingLimit == 0) return shippingAmount;

    // Normal rule
    if (totalPrice >= freeShippingLimit) {
      return 0.0; // FREE
    }

    return shippingAmount; // Apply flat shipping
  }

  /// Get Sub Total with shipping
  String getSummarySubTotal() {
    final double shipping = checkShipping(totalPrice1);
    final double finalSubTotal = shipping == 0.0
        ? totalPrice1
        : totalPrice1 + shipping;
    final currency = sessionController.countryConfig.value?.currencyCode ?? '';

    return "$currency ${finalSubTotal.toStringAsFixed(2)}";
  }

  /// Get Sub Total with shipping (SELECTED items – checkout)
  String getSelectedSummarySubTotal() {
    final double selectedTotal = selectedTotalPrice;
    final double shipping = checkShipping(selectedTotal);

    final double finalSubTotal = shipping == 0.0
        ? selectedTotal
        : selectedTotal + shipping;

    final currency = sessionController.countryConfig.value?.currencyCode ?? '';
    return "$currency ${finalSubTotal.toStringAsFixed(2)}";
  }

  /// Get shipping cost text
  String getShippingText() {
    final double shipping = checkShipping(totalPrice1);
    final currency = sessionController.countryConfig.value?.currencyCode ?? '';

    if (shipping == 0.0) {
      return "Free Shipping";
    } else {
      return "Shipping: $currency ${shipping.toStringAsFixed(2)}";
    }
  }

  /// Calculate savings from bundles (if you need it later)
  double calculatePotentialSavings(int index) {
    final priceList = getPriceListForItem(index);
    if (priceList == null || priceList.isEmpty) return 0.0;

    final item = cartItems[index];
    final currentQuantity = (item['quantity'] as int?) ?? 0;
    final basePrice = (item['price'] as num?)?.toDouble() ?? 0.0;
    final currentTotal = basePrice * currentQuantity;

    // Find best bundle price for current quantity
    double? bestBundlePrice;
    for (var bundle in priceList) {
      final bundleQuantity = (bundle['quantity'] as int?) ?? 0;
      final bundlePrice = (bundle['price'] as num?)?.toDouble() ?? 0.0;

      if (currentQuantity >= bundleQuantity) {
        if (bestBundlePrice == null || bundlePrice < bestBundlePrice) {
          bestBundlePrice = bundlePrice;
        }
      }
    }

    if (bestBundlePrice != null) {
      return currentTotal - bestBundlePrice;
    }

    return 0.0;
  }

  /// Debug method to print cart contents
  void debugPrintCart() {
    log("🛒 Cart Contents (${cartItems.length} items):");
    for (var i = 0; i < cartItems.length; i++) {
      final item = cartItems[i];
      log("  [${i + 1}] ${item['name']} - Qty: ${item['quantity']}");

      if (item.containsKey('priceList')) {
        final priceList = item['priceList'];
        if (priceList is List && priceList.isNotEmpty) {
          log("      Price bundles: ${priceList.length}");
        }
      }
    }
  }

  /// Debug method to check price list storage
  void debugPriceList(int cartIndex) {
    if (cartIndex < cartItems.length) {
      final item = cartItems[cartIndex];
      log('🔍 DEBUG Cart Item ${cartIndex + 1}:');
      log('   Product: ${item['name']}');
      log('   Quantity: ${item['quantity']}');
      log('   Base Price: ${item['price']}');

      if (item.containsKey('priceList')) {
        final priceList = item['priceList'];

        if (priceList is List && priceList.isNotEmpty) {
          final firstItem = Map<String, dynamic>.from(priceList[0]);

          log('   🔑 All keys in first bundle: ${firstItem.keys.toList()}');
          log('   💰 Using "price" key: ${firstItem['price']}');
          log('   💰 Using "offer_price" key: ${firstItem['offer_price']}');
          log('   💰 Using "normal_price" key: ${firstItem['normal_price']}');

          // Show all values
          firstItem.forEach((key, value) {
            log('      $key: $value');
          });
        }
      }
    }
  }

  /// Calculate price for a given quantity based on priceList
  double getPriceForQuantity(
    int quantity,
    List<Map<String, dynamic>> priceList, {
    double? basePrice,
  }) {
    if (priceList.isEmpty) return basePrice ?? 0.0;

    // Sort bundles by quantity ascending
    final sortedBundles = List<Map<String, dynamic>>.from(priceList)
      ..sort((a, b) => (a['quantity'] as int).compareTo(b['quantity'] as int));

    // Find exact match
    final exactMatch = sortedBundles.firstWhere(
      (bundle) => bundle['quantity'] == quantity,
      orElse: () => {},
    );

    if (exactMatch.isNotEmpty) {
      return (exactMatch['offer_price'] as num).toDouble();
    }

    // If no exact match, multiply first bundle's offer_price by quantity
    final firstBundlePrice = (sortedBundles.first['offer_price'] as num)
        .toDouble();
    return firstBundlePrice * quantity;
  }

  ///
  Future<void> decreaseQuantityOnly({required int productId}) async {
    try {
      final index = cartItems.indexWhere((e) => e['productId'] == productId);
      if (index == -1) return;

      final item = cartItems[index];
      final int currentQuantity = item['quantity'] as int;

      final List<Map<String, dynamic>> priceList =
          List<Map<String, dynamic>>.from(item['priceList'] ?? []);

      /// Minimum bundle quantity:
      int minQuantity = 1;
      if (priceList.isNotEmpty) {
        priceList.sort(
          (a, b) => (a['quantity'] as int).compareTo(b['quantity'] as int),
        );
        minQuantity = priceList.first['quantity'] as int;
      }
      if (currentQuantity <= minQuantity || currentQuantity == 1) {
        AppToast.showError("Minimum quantity for this offer reached");
        return;
      }
      final int newQuantity = currentQuantity - 1;

      // 🔹 Recalculate all prices and discount
      final newNormalPrice = calculateNormalPrice(
        quantity: newQuantity,
        baseNormalPrice: double.tryParse(item['normalPrice'].toString()) ?? 0.0,
        priceList: priceList,
      );

      final newPrice = getPriceForQuantity(newQuantity, priceList);

      final discountData = calculateDiscountForBundles(
        quantity: newQuantity,
        priceList: priceList,
      );

      item['quantity'] = newQuantity;
      item['normalPrice'] = newNormalPrice;
      item['price'] = newPrice;
      item['discountPrice'] = discountData['discountPrice'];
      item['discountPercent'] = discountData['discountPercent'];

      await cartBox.put('items', cartItems.toList());
      cartItems.refresh();

      AppToast.showSuccess("Quantity Removed Successfully");
    } catch (e) {
      log("❌ decreaseQuantityOnly error: $e");
    }
  }

  int getQuantityByProduct({
    required int productId,
    String? size,
    String? color,
  }) {
    final index = cartItems.indexWhere(
      (e) =>
          e['productId'] == productId &&
          (size == null || e['size'] == size) &&
          (color == null || e['color'] == color),
    );

    if (index == -1) return 0;
    return cartItems[index]['quantity'] as int;
  }

  /// Delete Logic  ==== ////
  /// Selected cart item keys
  final RxSet<String> selectedKeys = <String>{}.obs;

  /// Generate unique key
  String cartKey(Map<String, dynamic> item) {
    return "${item['productId']}_${item['size']}_${item['color']}";
  }

  void toggleSelection(Map<String, dynamic> item) {
    final key = cartKey(item);
    if (selectedKeys.contains(key)) {
      selectedKeys.remove(key);
    } else {
      selectedKeys.add(key);
    }
  }

  void toggleSelectAll() {
    if (selectedKeys.length == cartItems.length) {
      selectedKeys.clear();
    } else {
      selectedKeys.assignAll(cartItems.map((e) => cartKey(e)).toSet());
    }
  }

  bool isSelected(Map<String, dynamic> item) {
    return selectedKeys.contains(cartKey(item));
  }

  bool get isAllSelected =>
      cartItems.isNotEmpty && selectedKeys.length == cartItems.length;
  Future<void> removeSelectedItems() async {
    if (selectedKeys.isEmpty) return;
    cartItems.removeWhere((item) => selectedKeys.contains(cartKey(item)));
    selectedKeys.clear();
    await cartBox.put('items', cartItems.toList());
    cartItems.refresh();
    AppToast.showSuccess("Selected items removed");
    Get.back();
  }

  /// For Cart item Selection :
  bool get isAllSelectedForCheckout =>
      cartItems.isNotEmpty &&
      cartItems.every((item) => item['isSelected'] == true);

  Future<void> toggleSelectAllForCheckout() async {
    final allSelected = isAllSelectedForCheckout;
    for (var item in cartItems) {
      item['isSelected'] = !allSelected;
    }
    await cartBox.put('items', cartItems.toList());
    cartItems.refresh();
  }
}

///Calculate Normal price :
/// 🔹 Calculate normal price based on quantity and priceList
double calculateNormalPrice({
  required int quantity,
  required double baseNormalPrice,
  required List<Map<String, dynamic>> priceList,
}) {
  if (priceList.isEmpty) {
    // No bundles, just multiply base normal price
    return baseNormalPrice * quantity;
  }

  // Sort bundles by quantity ascending
  final sortedBundles = List<Map<String, dynamic>>.from(priceList)
    ..sort((a, b) => (a['quantity'] as int).compareTo(b['quantity'] as int));

  // Find exact match
  final exactMatch = sortedBundles.firstWhere(
    (bundle) => bundle['quantity'] == quantity,
    orElse: () => {},
  );

  if (exactMatch.isNotEmpty) {
    return (exactMatch['normal_price'] as num).toDouble();
  }

  // If no exact match, use first bundle normal price multiplied by quantity
  return (sortedBundles.first['normal_price'] as num).toDouble() * quantity;
}

/// Events:

/// For Facebook , Firebase Analytics, tiktok Tracking :
void logAddToCart({
  required String productId,
  required String productName,
  required double price,
  required int quantity,
}) {
  FacebookEventService.instance.logAddToCart(
    productId: productId,
    productName: productName,
    quantity: quantity,
  );
  log("Quantity === 33333 $quantity}");
  TikTokService().handleCustomEvent(
    eventType: TTEventType.addToCart,
    contentName: productName,
    value: price,
    eventId: productId,
    quantity: quantity,
  );

  // FirebaseEventServiceController.instance.logAddToCart(
  //   productId: productId,
  //   productName: productName,
  //   quantity: quantity,
  //   price: price,
  // );
}
