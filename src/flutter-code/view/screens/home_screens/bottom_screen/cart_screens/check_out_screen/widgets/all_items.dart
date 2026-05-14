import 'package:dress_fair_ecommmerce/controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

Widget allItems(BuildContext context) {
  final AddToCartController addToCartController = Get.find();

  return Obx(() {
    // 🔥 FILTER ONLY SELECTED ITEMS:
    final selectedItems = addToCartController.cartItems
        .where((item) => item['isSelected'] == true)
        .toList();

    return Visibility(
      visible: selectedItems.isNotEmpty,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 5.0.w),
        child: SizedBox(
          height: 106.h,
          width: MediaQuery.sizeOf(context).width,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: selectedItems.length,
            itemBuilder: (context, index) {
              final item = selectedItems[index];

              return Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 5.0.w,
                  vertical: 5.0.h,
                ),
                child: Column(
                  children: [
                    CachedNetworkImage(
                      height: 70.h,
                      imageUrl: "${SimpleMethode.imageUrl}/${item['image']}",
                      fit: BoxFit.cover,
                    ),
                    5.h.sh,
                    AppTextWidget(
                      text:
                          "${Get.find<SessionController>().countryConfig.value?.currencyCode} "
                          "${(item['price'] as num).toDouble().toStringAsFixed(2)}",
                      fontSize: 12.sp,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  });
}

Widget itemDetail() {
  final AddToCartController addToCartController = Get.find();

  return Obx(() {
    // 🔥 COUNT ONLY SELECTED ITEMS:
    final selectedCount = addToCartController.cartItems
        .where((item) => item['isSelected'] == true)
        .length;

    return Visibility(
      visible: selectedCount > 0,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 10.0.w),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            AppTextWidget(
              text: "${"itemDetails".tr} ($selectedCount)",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
            ),
            Row(
              children: [
                AppTextWidget(
                  text: "viewDetails".tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.transparent,
                ),
                4.w.sw,
                Icon(
                  Icons.arrow_forward_ios,
                  size: 12.sp,
                  color: Colors.transparent,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  });
}
