// class HomeBanner extends StatelessWidget {
//   HomeBanner({super.key});
//
//   final GetBannerController controller = Get.put(GetBannerController());
//
//   @override
//   Widget build(BuildContext context) {
//     return Obx(() {
//       if (controller.banners.isEmpty) {
//         return const SizedBox();
//       }
//
//       /// Get the top-position banner:
//       if (controller.banners.isEmpty) return const SizedBox();
//
//       final BannerModel topBanner = controller.banners.firstWhere(
//         (b) => b.position.toLowerCase() == "top",
//         orElse: () => controller.banners[0],
//       );
//       final imageUrl = topBanner.image;
//       final fullUrl = "${SimpleMethode.imageUrl}/$imageUrl";
//       if (topBanner == null) return const SizedBox();
//       return CarouselSlider(
//         options: CarouselOptions(
//           autoPlay: false,
//           viewportFraction: 0.9,
//           aspectRatio: 0.5,
//         ),
//         items: [
//           SimpleMethode.isSupportedFormat(fullUrl)
//               ? CachedNetworkImage(
//                   key: ValueKey(imageUrl),
//                   fadeInDuration: Duration.zero,
//                   imageUrl: fullUrl,
//                   fit: BoxFit.cover,
//                   placeholder: (context, url) => Image.asset(
//                     AppImages.bannerPlaceHolder,
//                     fit: BoxFit.cover,
//                   ),
//                   errorWidget: (context, url, error) {
//                     log("Banner image error: $error");
//                     return Image.network(
//                       fit: BoxFit.cover,
//                       "${SimpleMethode.alternativeBanner}/$imageUrl",
//                     );
//                   },
//                 )
//               : Container(
//                   color: Colors.grey[200],
//                   child: const Icon(
//                     Icons.image_not_supported,
//                     color: Colors.grey,
//                   ),
//                 ),
//         ],
//       );
//     });
//   }
// }

import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';
import 'package:dress_fair_ecommmerce/model/banner_model/banner_model.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/simple_method/simple_methode.dart';

class HomeBanner extends StatelessWidget {
  HomeBanner({super.key});

  final GetBannerController controller = Get.put(GetBannerController());

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.banners.isEmpty) {
        return const SizedBox();
      }

      /// ✅ Get top-position banner (fallback to first)
      final BannerModel topBanner = controller.banners.firstWhere(
        (b) => b.position.toLowerCase() == "top",
        orElse: () => controller.banners.first,
      );

      final String imageUrl = topBanner.image;
      final String fullUrl = "${SimpleMethode.imageUrl}/$imageUrl";

      if (imageUrl.isEmpty) return const SizedBox();

      return SizedBox(
        width: double.infinity,
        child: SimpleMethode.isSupportedFormat(fullUrl)
            ? CachedNetworkImage(
                key: ValueKey(imageUrl),
                imageUrl: fullUrl,
                fit: BoxFit.cover,
                fadeInDuration: Duration.zero,
                placeholder: (context, url) =>
                    Image.asset(AppImages.bannerPlaceHolder, fit: BoxFit.cover),
                errorWidget: (context, url, error) {
                  log("Banner image error: $error");
                  return Image.network(
                    "${SimpleMethode.alternativeBanner}/$imageUrl",
                    fit: BoxFit.cover,
                  );
                },
              )
            : Container(
                height: 200,
                color: Colors.grey[200],
                child: const Icon(
                  Icons.image_not_supported,
                  color: Colors.grey,
                ),
              ),
      );
    });
  }
}
