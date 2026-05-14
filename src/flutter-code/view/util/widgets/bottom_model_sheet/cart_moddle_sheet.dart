import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';

import '../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import '../../../screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

void showCartBottomSheet(BuildContext context) {
  final AddToCartController cartController = Get.find();
  final SessionController sessionController = Get.find();

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) {
      return DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (_, scrollController) {
          cartController.debugPriceList(0);
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
            ),
            child: Column(
              children: [
                AppTextWidget(
                  text:
                      cartController.cartItems.first['priceList']?[0]['price']
                          ?.toString() ??
                      '0',
                ),

                /// HEADER:
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 14.h,
                  ),
                  child: Row(
                    children: [
                      Obx(
                        () => Text(
                          "Cart • ${cartController.totalPrice1} items",
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const Spacer(),
                      GestureDetector(
                        onTap: () => Get.back(),
                        child: Icon(Icons.close, size: 24.sp),
                      ),
                    ],
                  ),
                ),

                Divider(height: 1.h),

                /// CART LIST
                Expanded(
                  child: Obx(() {
                    if (cartController.cartItems.isEmpty) {
                      return const Center(child: Text("Your cart is empty"));
                    }
                    return ListView.builder(
                      controller: scrollController,
                      itemCount: cartController.cartItems.length,
                      itemBuilder: (_, index) {
                        final item = cartController.cartItems[index];
                        return _CartItemTile(
                          item: item,
                          onIncrease: () {
                            //int quanity = item['quantity'];
                            // ///
                            // log("Refresh == 364");
                            // log("Quantity 111 == ${quanity}");
                            // cartController.updateQuantity1(
                            //   index: index,
                            //   newQuantity: quanity++,
                            //);
                            ///
                          },
                          onDecrease: () {
                            // int quanity = item['quantity'];
                            // log("Quantity 111 == ${quanity}");
                            // cartController.updateQuantity1(
                            //   index: index,
                            //   newQuantity: quanity--,
                            // );
                          },
                          onDelete: () {
                            cartController.removeItem(index);
                          },
                        );
                      },
                    );
                  }),
                ),

                /// FOOTER
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    border: Border(top: BorderSide(color: Colors.grey)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Text(
                            "Grand total",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const Spacer(),
                          Obx(
                            () => Text(
                              "${sessionController.countryConfig.value?.currencyCode ?? ""} ${cartController.totalPrice1.toStringAsFixed(2)}",
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primaryColor,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 12.h),
                      AppButton(
                        width: 300.w,
                        height: 50.h,
                        onTap: () {
                          Get.back();
                          Get.toNamed(cartScreen);
                        },
                        textStyle: TextStyle(color: Colors.white),
                        borderRadius: 30.r,
                        isLoading: false.obs,
                        text: "CheckOut",
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

class _CartItemTile extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback onIncrease;
  final VoidCallback onDecrease;
  final VoidCallback onDelete;

  _CartItemTile({
    required this.item,
    required this.onIncrease,
    required this.onDecrease,
    required this.onDelete,
  });
  final SessionController sessionController = Get.find();
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          /// IMAGE
          ClipRRect(
            borderRadius: BorderRadius.circular(8.r),
            child:
                SimpleMethode.isSupportedFormat(
                  "${SimpleMethode.imageUrl}/${item['image']}",
                )
                ? CachedNetworkImage(
                    memCacheWidth: 300,
                    fadeInDuration: Duration(milliseconds: 100),
                    imageUrl: "${SimpleMethode.imageUrl}/${item['image']}",
                    fit: BoxFit.cover,
                    width: 110.w,
                    height: 110.h,
                    errorWidget: (context, url, error) {
                      log("Error == ${error.toString()}");
                      return Center(
                        child: SvgPicture.asset(
                          color: Colors.red,
                          height: 80.h,
                          AppImages.placeHolder,
                        ),
                      );
                    },
                  )
                : Container(
                    color: Colors.grey[200],
                    child: const Icon(
                      Icons.image_not_supported,
                      color: Colors.grey,
                    ),
                  ),
          ),
          SizedBox(width: 12.w),

          /// DETAILS
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'],
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                SizedBox(height: 6.h),
                Text(
                  "${item['price']}"
                  "${sessionController.countryConfig.value?.currencyCode.toString()}",
                  style: TextStyle(fontSize: 14.sp, color: Colors.grey),
                ),
                SizedBox(height: 4.h),
                Text(
                  "Size: ${item['size']}  Color: ${item['color']}",
                  style: TextStyle(fontSize: 12.sp),
                ),
              ],
            ),
          ),

          /// ACTIONS
          Column(
            children: [
              GestureDetector(
                onTap: onDelete,
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 8.h),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                  child: Icon(Icons.delete, color: Colors.red, size: 16.sp),
                ),
              ),
              SizedBox(height: 12.h),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.8),
                  //const Color(0xFF9C3B4A),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Row(
                  children: [
                    _qtyButton(Icons.remove, onDecrease),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w),
                      color: Colors.white,
                      child: Text(
                        item['quantity'].toString(),
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    _qtyButton(Icons.add, onIncrease),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _qtyButton(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
        child: Icon(icon, color: Colors.white, size: 18.sp),
      ),
    );
  }
}
