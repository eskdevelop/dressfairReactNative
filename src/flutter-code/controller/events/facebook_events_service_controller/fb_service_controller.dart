import 'package:facebook_app_events/facebook_app_events.dart';

class FacebookEventService {
  // Singleton pattern:
  FacebookEventService._privateConstructor();
  static final FacebookEventService instance =
      FacebookEventService._privateConstructor();

  final FacebookAppEvents _facebookAppEvents = FacebookAppEvents();
  void forceDeviceRegistration() {
    print('🔄 Forcing Facebook Device Registration...');

    // These specific events trigger device registration
    _facebookAppEvents.logEvent(name: 'fb_mobile_activate_app');
    _facebookAppEvents.logEvent(name: 'fb_sdk_initialized');
    _facebookAppEvents.logEvent(name: 'MobileAppInstall');

    print('✅ Check Facebook for device registration prompt');
  }

  // Call this in main() method
  void initializeForTesting() {
    _facebookAppEvents.setAutoLogAppEventsEnabled(true);
    _facebookAppEvents.setAdvertiserTracking(enabled: true);
    //Log initial events to trigger device registration:
    _facebookAppEvents.logEvent(
      name: 'fb_mobile_activate_app',
      parameters: {'fb_sdk_version': 'flutter_0.21.0', 'test_device': 'true'},
    );

    print('🔧 Facebook Test Mode Enabled - Check device registration');
  }

  // ==================== STANDARD FACEBOOK EVENTS ====================

  // 📱 PRODUCT DETAIL SCREEN - View Content
  void logViewContent({
    required String productId,
    required String productName,
    required double price,
    required String sku,
  }) {
    _facebookAppEvents.logEvent(
      name: 'fb_mobile_content_view',
      parameters: {
        'fb_content_type': 'product',
        'productName': productName,
        'fb_content_id': productId,
        'fb_price': price,
        'sku': sku,
      },
    );
    print('📱 Facebook View Content: $productName - \$$price');
  }

  // 🛒 ADD TO CART EVENT:
  void logAddToCart({
    required String productId,
    required String productName,
    int quantity = 1,
  }) {
    _facebookAppEvents.logEvent(
      name: 'AddToCart',
      parameters: {
        'fb_content_id': productId,
        'fb_content_type': 'product',
        'product_name': productName,
        'quantity': quantity,
      },
    );
    print('🛒 Facebook AddToCart: $productName x$quantity - \$$productName');
  }

  // 🛍️ CART SCREEN - Initiate Checkout
  void logInitiateCheckout({
    required double totalValue,
    required String currency,
    required int itemCount,
    List<String>? productIds,
  }) {
    _facebookAppEvents.logEvent(
      name: 'InitiateCheckout',
      parameters: {
        'fb_currency': currency,
        'fb_price': totalValue,
        'fb_num_items': itemCount,
        if (productIds != null && productIds.isNotEmpty)
          'fb_content_ids': productIds,
        'fb_content_type': 'product',
      },
    );
    print('🛍️ Facebook InitiateCheckout: \$$totalValue - $itemCount items');
  }

  // 💳 CHECKOUT SCREEN - Add Payment Info
  void logAddPaymentInfo({required bool success, required String currency}) {
    _facebookAppEvents.logEvent(
      name: 'AddPaymentInfo',
      parameters: {'fb_currency': currency, 'fb_success': success ? 1 : 0},
    );
    print('💳 Facebook AddPaymentInfo: Success - $success');
  }

  // ✅ PLACE ORDER SCREEN - Purchase
  void logPurchase({
    required double amount,
    required String currency,
    required String price,
    required String productId,
    String? productName,
    String? orderId,
  }) {
    _facebookAppEvents.logEvent(
      name: 'Purchase',
      parameters: {
        'fb_currency': currency,
        'fb_price': amount,
        'fb_num_price': price,
        'fb_content_id': productId,
        'fb_content_type': 'product',
        if (productName != null) 'product_name': productName,
        if (orderId != null) 'fb_order_id': orderId,
      },
    );
    print('✅ Facebook Purchase: \$$amount - Order: $orderId');
  }

  // 🔍 SEARCH EVENT
  void logSearch({required String searchString}) {
    _facebookAppEvents.logEvent(
      name: 'Search',
      parameters: {'fb_search_string': searchString},
    );
    print('🔍 Facebook Search: "$searchString"');
  }

  // ==================== BACKWARD COMPATIBILITY ==================== //

  // Legacy method for general events (use standard events above instead)
  void logEvent(String name, {Map<String, dynamic>? parameters}) {
    print('📱 Facebook Custom Event: $name');
    print('📱 Parameters: $parameters');
    _facebookAppEvents.logEvent(name: name, parameters: parameters);
  }

  // Legacy purchase method
  void logPurchaseLegacy(double amount, String currency) {
    _facebookAppEvents.logPurchase(amount: amount, currency: currency);
  }

  // Set user data (optional):
  void setUserData({
    String? email,
    String? firstName,
    String? lastName,
    String? city,
    String? country,
  }) {
    _facebookAppEvents.setUserData(
      email: email,
      firstName: firstName,
      lastName: lastName,
      city: city,
      country: country,
    );
  }

  // Enable / Disable advertiser tracking:
  void setAdvertiserTracking(bool enabled) {
    _facebookAppEvents.setAdvertiserTracking(enabled: enabled);
  }
}
