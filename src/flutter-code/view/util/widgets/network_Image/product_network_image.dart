// import 'dart:developer';
//
// import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
//
// import '../../../../controller/simple_method/simple_methode.dart';
//
// class ProductCachedImage extends StatelessWidget {
//   final String? imagePath;
//   final double? height;
//   final double? width;
//   final BorderRadius? borderRadius;
//   final BoxFit fit;
//
//   const ProductCachedImage({
//     super.key,
//     required this.imagePath,
//     this.height,
//     this.width,
//     this.borderRadius,
//     this.fit = BoxFit.cover,
//   });
//
//   @override
//   Widget build(BuildContext context) {
//     final double finalHeight = height ?? 120.h;
//     final double finalWidth = width ?? double.infinity;
//     final BorderRadius finalRadius = borderRadius ?? BorderRadius.circular(8.r);
//
//     final fullUrl = (imagePath == null || imagePath!.isEmpty)
//         ? null
//         : "${SimpleMethode.imageUrl}/$imagePath";
//
//     /// ❌ If null or unsupported → placeholder
//     if (fullUrl == null || !SimpleMethode.isSupportedFormat(fullUrl)) {
//       return _placeHolder(finalHeight, finalWidth, finalRadius);
//     }
//
//     /// ✅ Auto calculate cache size based on device width
//     final int cacheSize = (ScreenUtil().screenWidth * 0.5).toInt();
//
//     return ClipRRect(
//       borderRadius: finalRadius,
//       child: CachedNetworkImage(
//         imageUrl: fullUrl,
//
//         /// ✅ Smart caching
//         memCacheWidth: cacheSize,
//         memCacheHeight: cacheSize,
//         maxWidthDiskCache: cacheSize,
//         maxHeightDiskCache: cacheSize,
//
//         height: finalHeight,
//         width: finalWidth,
//         fit: fit,
//
//         fadeInDuration: const Duration(amilliseconds: 150),
//
//         placeholder: (_, __) => Container(
//           height: finalHeight,
//           width: finalWidth,
//           color: Colors.grey.shade200,
//         ),
//
//         errorWidget: (_, __, error) {
//           log("Image Load Error => $error");
//           return _placeHolder(finalHeight, finalWidth, finalRadius);
//         },
//       ),
//     );
//   }
//
//   Widget _placeHolder(double h, double w, BorderRadius radius) {
//     return ClipRRect(
//       borderRadius: radius,
//       child: Container(
//         height: h,
//         width: w,
//         color: Colors.grey.shade200,
//         alignment: Alignment.center,
//         child: SvgPicture.asset(
//           AppImages.placeHolder,
//           height: h * 0.45,
//           color: Colors.grey.shade400,
//         ),
//       ),
//     );
//   }
// }

import 'dart:developer';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../../controller/simple_method/simple_methode.dart';
import '../../constant/app_images.dart';

class ProductCachedImage extends StatelessWidget {
  final String? imagePath;
  final double? height;
  final double? width;
  final BorderRadius? borderRadius;
  final BoxFit fit;

  const ProductCachedImage({
    super.key,
    required this.imagePath,
    this.height,
    this.width,
    this.borderRadius,
    this.fit = BoxFit.cover,
  });

  @override
  Widget build(BuildContext context) {
    final double finalHeight = height ?? 100.h;
    final double finalWidth = width ?? double.infinity;
    final BorderRadius finalRadius = borderRadius ?? BorderRadius.circular(8.r);

    final String? fullUrl = (imagePath == null || imagePath!.isEmpty)
        ? null
        : "${SimpleMethode.imageUrl}/$imagePath";

    /// If null or unsupported → placeholder
    if (fullUrl == null || !SimpleMethode.isSupportedFormat(fullUrl)) {
      return _placeHolder(finalHeight, finalWidth, finalRadius);
    }

    return ClipRRect(
      borderRadius: finalRadius,
      child: CachedNetworkImage(
        imageUrl: fullUrl,

        /// 🔴 Do NOT resize cache → prevents blur
        /// CachedNetworkImage already optimizes internally
        height: finalHeight,
        width: finalWidth,
        fit: fit,

        fadeInDuration: const Duration(milliseconds: 100),

        placeholder: (_, __) => Container(
          height: finalHeight,
          width: finalWidth,
          color: Colors.grey.shade200,
        ),

        errorWidget: (_, __, error) {
          log("Image Load Error => $error");
          return _placeHolder(finalHeight, finalWidth, finalRadius);
        },
      ),
    );
  }

  Widget _placeHolder(double h, double w, BorderRadius radius) {
    return ClipRRect(
      borderRadius: radius,
      child: Container(
        height: h,
        width: w,
        color: Colors.grey.shade200,
        alignment: Alignment.center,
        child: SvgPicture.asset(
          AppImages.placeHolder,
          height: h * 0.45,
          color: Colors.grey.shade400,
        ),
      ),
    );
  }
}
