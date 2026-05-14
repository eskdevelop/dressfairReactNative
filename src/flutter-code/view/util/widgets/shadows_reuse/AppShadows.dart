import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AppShadows {
  static List<BoxShadow> soft = [
    BoxShadow(
      color: Colors.black.withOpacity(0.01),
      spreadRadius: 1,
      blurRadius: 1,
      offset: Offset(2, 4),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.01),
      spreadRadius: 1,
      blurRadius: 1,
      offset: Offset(4, 2),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      spreadRadius: 1,
      blurRadius: 1,
      offset: Offset(-4, 2),
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      spreadRadius: 1,
      blurRadius: 1,
      offset: Offset(4, -2),
    ),
  ];
  static List<BoxShadow> softBottom = [
    BoxShadow(
      color: Colors.black.withOpacity(0.05), // shadow color
      spreadRadius: 1,
      blurRadius: 1,
      offset: Offset(0, 3),
    ),
  ];

  static List<BoxShadow> softBox = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08), // softer, brighter
      spreadRadius: 1,
      blurRadius: 8,
      offset: const Offset(0, 2), // bottom shadow
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.04), // lighter secondary layer
      spreadRadius: 1,
      blurRadius: 12,
      offset: const Offset(0, 6), // longer shadow for depth
    ),
  ];
  static List<BoxShadow> glowBox = [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      spreadRadius: 2,
      blurRadius: 8,
      offset: Offset(0, 4), // bottom shadow
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      spreadRadius: 2,
      blurRadius: 8,
      offset: Offset(0, -2), // top shadow
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      spreadRadius: 2,
      blurRadius: 8,
      offset: Offset(4, 0), // right shadow
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      spreadRadius: 2,
      blurRadius: 8,
      offset: Offset(-4, 0), // left shadow
    ),
  ];
  static List<BoxShadow> glowBoxDim = [
    BoxShadow(
      color: Colors.black.withOpacity(0.04), // softer dim shadow
      spreadRadius: 1, // smaller spread
      blurRadius: 6, // less blur
      offset: Offset(0, 3), // bottom
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      spreadRadius: 1,
      blurRadius: 5,
      offset: Offset(0, -2), // top
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      spreadRadius: 1,
      blurRadius: 5,
      offset: Offset(3, 0), // right
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      spreadRadius: 1,
      blurRadius: 5,
      offset: Offset(-3, 0), // left
    ),
  ];
  static List<BoxShadow> softCardShadow = [
    // Bottom shadow
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      blurRadius: 10,
      offset: const Offset(0, 4),
    ),
    // Top shadow
    BoxShadow(
      color: Colors.black.withOpacity(0.02),
      blurRadius: 6,
      offset: const Offset(0, -2),
    ),
  ];
  static List<BoxShadow> glowBoxMoeDim = [
    BoxShadow(
      color: Colors.black.withOpacity(0.15), // stronger dim
      spreadRadius: 2, // a little more spread
      blurRadius: 12, // bigger blur for visible glow
      offset: Offset(0, 4), // bottom shadow
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      spreadRadius: 2,
      blurRadius: 10,
      offset: Offset(0, -3), // top
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      spreadRadius: 2,
      blurRadius: 10,
      offset: Offset(4, 0), // right
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.1),
      spreadRadius: 2,
      blurRadius: 10,
      offset: Offset(-4, 0), // left
    ),
  ];
}
