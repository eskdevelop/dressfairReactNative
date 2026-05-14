// import 'package:firebase_analytics/firebase_analytics.dart';
//
// class FirebaseEventServiceController {
//   // Singleton:
//   FirebaseEventServiceController._privateConstructor();
//   static final FirebaseEventServiceController instance =
//       FirebaseEventServiceController._privateConstructor();
//
//   final FirebaseAnalytics _analytics = FirebaseAnalytics.instance;
//
//   // ✅ Call in main():
//   Future<void> initialize() async {
//     print('🔥 Initializing Firebase Analytics...');
//     await _analytics.setAnalyticsCollectionEnabled(true);
//     print('✅ Firebase Analytics Enabled');
//   }
//
//   // ==================== STANDARD EVENTS ==================== //
//
//   // 📱 PRODUCT DETAIL SCREEN - View Content
//   Future<void> logViewContent({
//     required String productId,
//     required String productName,
//     required double price,
//     required String sku,
//   }) async {
//     await _analytics.logEvent(
//       name: 'view_content',
//       parameters: {
//         'item_id': productId,
//         'item_name': productName,
//         'price': price,
//         'sku': sku,
//         'content_type': 'product',
//       },
//     );
//     print('🔥 Firebase View Content: $productName - $price');
//   }
//
//   // 🛒 ADD TO CART
//   Future<void> logAddToCart({
//     required String productId,
//     required String productName,
//     required double price,
//     int quantity = 1,
//   }) async {
//     await _analytics.logAddToCart(
//       items: [
//         AnalyticsEventItem(
//           itemId: productId,
//           itemName: productName,
//           price: price,
//           quantity: quantity,
//         ),
//       ],
//       value: quantity.toDouble(),
//       currency: 'AED',
//     );
//
//     print('🛒 Firebase AddToCart: $productName x$quantity');
//   }
//
//   // 🛍️ CHECKOUT START
//   Future<void> logInitiateCheckout({
//     required double totalValue,
//     required int itemCount,
//     List<String>? productIds,
//   }) async {
//     await _analytics.logBeginCheckout(
//       value: totalValue,
//       currency: 'AED',
//       items: productIds?.map((id) => AnalyticsEventItem(itemId: id)).toList(),
//     );
//
//     print('🛍️ Firebase InitiateCheckout: $totalValue AED - $itemCount items');
//   }
//
//   // 💳 ADD PAYMENT INFO
//   // 💳 ADD PAYMENT INFO
//   Future<void> logAddPaymentInfo({required bool success}) async {
//     await _analytics.logEvent(
//       name: 'add_payment_info',
//       parameters: {'success': success ? 1 : 0, 'currency': 'AED'},
//     );
//
//     print('💳 Firebase AddPaymentInfo: $success');
//   }
//
//   // CUSTOM EVENT
//   Future<void> logEvent(String name, {Map<String, Object>? parameters}) async {
//     await _analytics.logEvent(name: name, parameters: parameters);
//
//     print('📱 Firebase Custom Event: $name');
//     print('📱 Parameters: $parameters');
//   }
//
//   // ✅ PURCHASE
//   Future<void> logPurchase({
//     required double amount,
//     required String productId,
//     String? productName,
//     String? orderId,
//   }) async {
//     await _analytics.logPurchase(
//       value: amount,
//       currency: 'AED',
//       transactionId: orderId,
//       items: [
//         AnalyticsEventItem(itemId: productId, itemName: productName ?? ''),
//       ],
//     );
//
//     print('✅ Firebase Purchase: $amount AED - Order: $orderId');
//   }
//
//   // 🔍 SEARCH
//   Future<void> logSearch({required String searchString}) async {
//     await _analytics.logSearch(searchTerm: searchString);
//     print('🔍 Firebase Search: $searchString');
//   }
//
//   // ==================== USER DATA ==================== //
//   Future<void> setUserData({
//     String? userId,
//     String? email,
//     String? city,
//     String? country,
//   }) async {
//     if (userId != null) await _analytics.setUserId(id: userId);
//
//     if (email != null)
//       await _analytics.setUserProperty(name: 'email', value: email);
//     if (city != null)
//       await _analytics.setUserProperty(name: 'city', value: city);
//     if (country != null)
//       await _analytics.setUserProperty(name: 'country', value: country);
//
//     print('👤 Firebase User Data Updated');
//   }
// }
