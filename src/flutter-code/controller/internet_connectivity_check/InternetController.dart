import 'dart:io';

class InternetController {
  static Future<bool> checkUserConnection() async {
    try {
      final result = await InternetAddress.lookup('google.com');
      if (result.isNotEmpty && result[0].rawAddress.isNotEmpty) {
        return true; // Internet connected
      }
      return false;
    } on SocketException catch (_) {
      return false; // No Internet
    }
  }
}
