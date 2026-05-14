import 'dart:developer';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:tiktok_events_sdk/tiktok_events_sdk.dart';

class TikTokService {
  static final TikTokService _instance = TikTokService._internal();
  factory TikTokService() => _instance;
  TikTokService._internal();
  bool _isInitialized = false;
  // Initialize TikTok SDK:
  Future<void> initialize() async {
    try {
      if (kDebugMode) {
        print('Starting TikTok SDK initialization...');
      }
      final iosOptions = TikTokIosOptions(
        disableTracking: false,
        disableAutomaticTracking: true,
        disableSKAdNetworkSupport: true,
        accessToken: "TTz3kQ6zdr1iYzs9rkX1GdiWl7NHKoOs",
      );
      final androidOptions = TikTokAndroidOptions(
        disableAutoStart: false,
        enableAutoIapTrack: true,
        disableAdvertiserIDCollection: true,
      );
      if (kDebugMode) {
        print('🔧 Initializing with App ID');
      }
      //   1627667071
      //7297444425419079681
      await TikTokEventsSdk.initSdk(
        androidAppId: "com.dressfair",
        tikTokAndroidId: "7297482288085188609",
        iosAppId: "1627667071",
        tiktokIosId: "7297444425419079681",

        /// For Testing:
        // isDebugMode:
        //     //false,
        //     true,
        // logLevel: TikTokLogLevel.verbose,
        //
        // /// For Production:
        isDebugMode: false, // ← CHANGE TO FALSE for production:
        logLevel: TikTokLogLevel.info,
        iosOptions: iosOptions,
        androidOptions: androidOptions,
      );
      _isInitialized = true;
      // await TikTokEventsSdk.startTrack();
      log('TikTok Events SDK initialized successfully!');
    } catch (e, stackTrace) {
      log('❌ TikTok SDK initialization FAILED: $e');
      log('❌ Stack trace: $stackTrace');
    }
  }

  static Future<void> logEvent({
    required String eventName,
    TTEventType? eventType,
    String? eventId,
    EventProperties? properties,
  }) async {
    await TikTokEventsSdk.logEvent(
      event: TikTokEvent(
        eventName: eventName,
        eventType: eventType ?? TTEventType.none,
        eventId: eventId,
        properties: properties,
      ),
    );
  }

  ///

  Future<void> handleCustomEvent({
    required TTEventType eventType,
    required double value,
    required String contentName,
    required String eventId,
    required int quantity,
  }) async {
    try {
      final properties = EventProperties(
        value: value,
        price: value,
        contentName: contentName,
        currency: CurrencyCode.AED,
        quantity: quantity,
        //quantity == 0 ? null : quantity,
      );

      await TikTokService.logEvent(
        eventName: eventType.name.toLowerCase(),
        eventType: eventType,
        eventId: eventId,
        properties: properties,
      );

      //  _showSnackBar('${eventType.name} event logged successfully');
    } catch (e) {
      //_showSnackBar('Error: $e', isSuccess: false);
    }
  }

  Future<void> handleViewContent({
    required String contentId,
    required String contentType,
    required String contentName,
    required double price,
  }) async {
    try {
      await TikTokService.logEvent(
        eventName: 'product_viewed',
        eventType: TTEventType.viewContent,
        properties: EventProperties(
          contentId: contentId,
          contentType: contentType,
          contentName: contentName,
          price: price,
          currency: CurrencyCode.AED,
        ),
      );
      //   _showSnackBar('View Content event logged successfully');
    } catch (e) {
      log("Error == ${e.toString()}");
      //  _showSnackBar('Error: $e', isSuccess: false);
    }
  }

  Future<void> handleLogEvent() async {
    try {
      await TikTokService.logEvent(eventName: 'custom_event');
      //  _showSnackBar('Custom event logged successfully');
    } catch (e) {
      // _showSnackBar('Error: $e', isSuccess: false);
    }
  }

  Future<void> handleIdentify({
    required String email,
    required String phoneNo,
    required String userName,
    required String userID,
  }) async {
    try {
      await TikTokService.identify(
        externalId: userID,
        externalUserName: userName,
        email: email,
        phoneNumber: phoneNo,
      );

      //   _showSnackBar('User identified successfully: $username');
    } catch (e, stackTrace) {
      debugPrint('❌ Error identifying user: $e');
      debugPrint('Stack trace: $stackTrace');
      //   _showSnackBar('Error: $e', isSuccess: false);
    }
  }

  Future<void> handleStartTrack() async {
    try {
      debugPrint('🔵 Starting startTrack...');
      // await TikTokService2.startTrack();
      debugPrint('✅ startTrack completed successfully');
      // _showSnackBar('Track started successfully');
    } catch (e, stackTrace) {
      debugPrint('❌ Error in startTrack: $e');
      debugPrint('Stack trace: $stackTrace');

      // Parse the error to give a better message
      String errorMessage = 'Error: $e';
      if (e.toString().contains('CONSENT_NOT_GRANTED')) {
        errorMessage =
            'ATT permission not granted. Please check iOS Settings > Privacy & Security > Tracking and enable tracking for this app, then restart the app.';
      } else if (e.toString().contains(
        'ATT permission has not been requested yet',
      )) {
        errorMessage =
            'ATT permission not requested yet. The ATT dialog should appear automatically when you initialize the SDK. If not, restart the app.';
      }

      // _showSnackBar(errorMessage, isSuccess: false);
    }
  }

  Future<void> requestATTPermission() async {
    if (!Platform.isIOS) {
      // _showSnackBar(
      //   'ATT permission is only available on iOS',
      //   isSuccess: false,
      // );
      return;
    }

    try {
      debugPrint('🔵 Requesting ATT permission...');
      // Note: ATT permission is requested automatically when SDK initializes
      // This button is just for re-requesting if needed
      // _showSnackBar(
      //   'Please initialize the SDK first. ATT will be requested automatically.',
      //   isSuccess: true,
      // );
    } catch (e, stackTrace) {
      debugPrint('❌ Error requesting ATT permission: $e');
      debugPrint('Stack trace: $stackTrace');
      //  _showSnackBar('Could not request ATT permission: $e', isSuccess: false);
    }
  }

  ///

  static Future<void> identify({
    String? externalId,
    String? externalUserName,
    String? phoneNumber,
    String? email,
  }) async {
    if (externalId == null || externalUserName == null || email == null) {
      throw Exception('externalId, externalUserName, and email are required');
    }

    final identifier = TikTokIdentifier(
      externalId: externalId,
      externalUserName: externalUserName,
      phoneNumber: phoneNumber,
      email: email,
    );
    await TikTokEventsSdk.identify(identifier: identifier);
  }

  static Future<void> logout() async {
    await TikTokEventsSdk.logout();
  }

  ///
  //
  // handleCustomEvent(TTEventType.checkout, null, 129.98),
  //  _handleViewContent(),
}
