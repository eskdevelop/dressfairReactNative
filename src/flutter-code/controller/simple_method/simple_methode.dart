import 'dart:math';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:share_plus/share_plus.dart';

import '../../view/util/widgets/routes/screens_library.dart';

class SimpleMethode {
  Random random = Random();

  String? getUrgencyLabel() {
    int rand = random.nextInt(10);
    if (rand < 2) return "Only 3 Left";
    // 20% chance
    if (rand < 5) return "Few Items Left";

    return "Almost Sold Out";
  }

  static String imageUrl =
      "https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com";

  SessionController sessionController = Get.find<SessionController>();

  static String alternativeBanner = "https://97112.ecomplug.com";
  shareWebLink(String productModel) async {
    String halfUrl = sessionController.baseUrl.split('/index').first;
    await SharePlus.instance.share(
      ShareParams(
        title: 'Check Out This Product',
        text: '$halfUrl/p/$productModel',
      ),
    );
  }

  static bool isSupportedFormat(String url) {
    /// Define only the formats you want to allow
    final supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

    /// Convert to lowercase to ensure 'IMAGE.JPG' also works
    final lowerUrl = url.toLowerCase();

    return supportedExtensions.any((ext) => lowerUrl.endsWith(ext));
  }

  void shareApp() async {
    const String appUrl =
        "https://play.google.com/store/apps/details?id=com.dressfairpk&hl=en";

    await Share.share(
      "🎉 Check out the Dress Fair app!\n\nDownload it here:\n$appUrl",
      subject: "Dress Fair App",
    );
  }

  double getRandomRating() {
    final random = Random();
    // Random rating between 3.0 and 5.0
    return 3.0 + random.nextDouble() * 2.0;
  }

  int getRandomReviews() {
    final random = Random();
    // Random reviews between 20 and 200
    return 20 + random.nextInt(180);
  }
}
