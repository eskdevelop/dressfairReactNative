import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';

class FloatingCartButton extends StatelessWidget {
  const FloatingCartButton({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.find<AddToCartController>();
    final double widgetWidth = 75.w;
    final double widgetHeight = 90.h;
    return Obx(() {
      final cartCount = controller.cartItems.length ?? 0;
      log("Count == $cartCount");
      return GestureDetector(
        onTap: () {
          HapticFeedback.lightImpact();
          Get.toNamed(cartScreen);
        },
        child: Container(
          width: widgetWidth,
          height: widgetHeight,
          //color: Colors.red,
          alignment: Alignment.center,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // --- circular cart icon ---
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    height: 66.h, // smaller circle
                    width: 55.w,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(width: 5.w, color: Colors.green),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.15),
                          blurRadius: 8.r,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.shopping_cart_outlined,
                          color: Colors.green,
                          size: 20.sp,
                        ),
                        AppTextWidget(
                          text: "Cart",
                          fontSize: 9.sp,
                          fontWeight: FontWeight.w700,
                          color: Colors.green,
                        ),
                      ],
                    ),
                  ),

                  // --- cart count badge ---
                  if (cartCount > 0)
                    Positioned(
                      top: 7.h,
                      right: cartCount >= 10 ? -6 : 1.w,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 4.w,
                          vertical: 2.h,
                        ),
                        decoration: const BoxDecoration(
                          color: Colors.orange,
                          shape: BoxShape.circle,
                        ),
                        child: AppTextWidget(
                          text: "$cartCount",
                          color: Colors.white,
                          fontSize: 10.sp,
                          fontWeight: FontWeight.bold,
                          /*     style: TextStyle(
                              color: Colors.white,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.bold,
                            ),*/
                        ),
                      ),
                    ),
                  // --- “Free Shipping” label ---
                  Positioned(
                    bottom: 0,
                    right: 0,
                    left: 0,
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 4.w,
                        vertical: 2.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(12.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.12),
                            blurRadius: 4.r,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      alignment: Alignment.center,
                      child: AppTextWidget(
                        text: "Free Shipping",
                        maxLines: 1,
                        fontSize: 6.sp,
                        fontWeight: FontWeight.bold,
                        overflow: TextOverflow.ellipsis,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }
}
