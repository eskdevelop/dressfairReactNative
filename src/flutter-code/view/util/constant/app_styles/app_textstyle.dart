// import 'package:dress_fair_ecommmerce/view/util/constant/app_colors/appcolors.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
//
// class AppTextWidget extends StatelessWidget {
//   final String text;
//   final FontWeight fontWeight;
//   final double fontSize;
//   final Color color;
//   final int maxLines;
//   final TextOverflow overflow;
//   final bool softWrap;
//   final TextAlign textAlign;
//
//   AppTextWidget({
//     super.key,
//     required this.text,
//     this.fontWeight = FontWeight.w500,
//     this.fontSize = 16,
//     this.color = AppColors.blackColor,
//     this.maxLines = 3,
//     this.overflow = TextOverflow.ellipsis,
//     this.softWrap = true,
//     this.textAlign = TextAlign.start,
//   });
//
//   @override
//   Widget build(BuildContext context) {
//     return Text(
//       text,
//       softWrap: softWrap,
//       maxLines: maxLines,
//       overflow: overflow,
//       textAlign: textAlign,
//       style: TextStyle(
//         fontFamily: 'Inter',
//         fontSize: fontSize.sp,
//         fontWeight: fontWeight,
//         color: color,
//       ),
//     );
//   }
// }
//
// class AppFonts {
//   // Regular font styles
//   static TextStyle regular(double size, {Color? color}) {
//     return TextStyle(
//       fontFamily: 'Inter',
//       fontSize: size,
//       fontWeight: FontWeight.w400,
//       color: color,
//     );
//   }
//
//   static TextStyle medium(double size, {Color? color}) {
//     return TextStyle(
//       fontFamily: 'Inter',
//       fontSize: size,
//       fontWeight: FontWeight.w500,
//       color: color,
//     );
//   }
//
//   static TextStyle semiBold(double size, {Color? color}) {
//     return TextStyle(
//       fontFamily: 'Inter',
//       fontSize: size,
//       fontWeight: FontWeight.w600,
//       color: color,
//     );
//   }
//
//   static TextStyle bold(double size, {Color? color}) {
//     return TextStyle(
//       fontFamily: 'Inter',
//       fontSize: size,
//       fontWeight: FontWeight.w700,
//       color: color,
//     );
//   }
//
//   // Italic styles
//   static TextStyle italic(double size, {Color? color}) {
//     return TextStyle(
//       fontFamily: 'Inter',
//       fontSize: size,
//       fontWeight: FontWeight.w400,
//       fontStyle: FontStyle.italic,
//       color: color,
//     );
//   }
// }

import 'package:dress_fair_ecommmerce/view/util/constant/app_colors/appcolors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTextWidget extends StatelessWidget {
  final String text;
  final FontWeight fontWeight;
  final double fontSize;
  final Color color;
  final int maxLines;
  final TextOverflow overflow;
  final bool softWrap;
  final TextAlign textAlign;

  const AppTextWidget({
    super.key,
    required this.text,
    this.fontWeight = FontWeight.w500,
    this.fontSize = 13.5,
    this.color = AppColors.blackColor,
    this.maxLines = 3,
    this.overflow = TextOverflow.ellipsis,
    this.softWrap = true,
    this.textAlign = TextAlign.start,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      softWrap: softWrap,
      maxLines: maxLines,
      overflow: overflow,
      textAlign: textAlign,
      style: GoogleFonts.roboto(
        fontSize: fontSize.sp,
        fontWeight: fontWeight,
        color: color,
      ),
    );
  }
}

class AppFonts {
  static TextStyle regular(double size, {Color? color}) {
    return GoogleFonts.roboto(
      fontSize: size.sp,
      fontWeight: FontWeight.w400,
      color: color,
    );
  }

  static TextStyle medium(double size, {Color? color}) {
    return GoogleFonts.roboto(
      fontSize: size.sp,
      fontWeight: FontWeight.w500,
      color: color,
    );
  }

  static TextStyle semiBold(double size, {Color? color}) {
    return GoogleFonts.roboto(
      fontSize: size.sp,
      fontWeight: FontWeight.w600,
      color: color,
    );
  }

  static TextStyle bold(double size, {Color? color}) {
    return GoogleFonts.roboto(
      fontSize: size.sp,
      fontWeight: FontWeight.w700,
      color: color,
    );
  }

  static TextStyle italic(double size, {Color? color}) {
    return GoogleFonts.roboto(
      fontSize: size.sp,
      fontWeight: FontWeight.w400,
      fontStyle: FontStyle.italic,
      color: color,
    );
  }
}
