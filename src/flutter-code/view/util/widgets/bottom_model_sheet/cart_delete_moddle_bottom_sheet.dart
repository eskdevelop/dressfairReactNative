import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import '../../../../controller/simple_method/simple_methode.dart';

class ManageCartBottomSheet extends StatelessWidget {
  ManageCartBottomSheet({super.key});

  final AddToCartController addToCartController =
      Get.find<AddToCartController>();
  final SessionController sessionController = Get.find<SessionController>();

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _header(context),
              Divider(height: 1.h),

              /// ================= CART ITEMS =================
              if (addToCartController.cartItems.isNotEmpty)
                ListView.separated(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 16.h,
                  ),
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  itemCount: addToCartController.cartItems.length,
                  separatorBuilder: (_, __) => SizedBox(height: 10.h),
                  itemBuilder: (context, index) {
                    final item = addToCartController.cartItems[index];
                    return _cartItem(item);
                  },
                )
              else
                Padding(
                  padding: EdgeInsets.symmetric(vertical: 40.h),
                  child: Text(
                    "Your cart is empty",
                    style: TextStyle(fontSize: 14.sp, color: Colors.grey),
                  ),
                ),

              if (addToCartController.cartItems.isNotEmpty)
                Divider(height: 1.h),

              /// ================= BOTTOM ACTION =================
              if (addToCartController.cartItems.isNotEmpty) _bottomActions(),
            ],
          ),
        ),
      ),
    );
  }

  // ================= HEADER =================
  Widget _header(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      child: Row(
        children: [
          Expanded(
            child: AppTextWidget(
              text: "Manage Cart",
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const Icon(Icons.close),
          ),
        ],
      ),
    );
  }

  // ================= BEAUTIFIED CART ITEM =================
  Widget _cartItem(Map<String, dynamic> item) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey.withOpacity(0.15)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(top: 6.h),
            child: Checkbox(
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
              activeColor: AppColors.primaryColor,
              value: addToCartController.isSelected(item),
              onChanged: (_) => addToCartController.toggleSelection(item),
            ),
          ),

          ClipRRect(
            borderRadius: BorderRadius.circular(8.r),
            child: CachedNetworkImage(
              imageUrl: "${SimpleMethode.imageUrl}/${item['image']}",
              width: 70.w,
              height: 70.h,
              fit: BoxFit.cover,
              errorWidget: (_, __, ___) => Container(
                width: 70.w,
                height: 70.h,
                color: Colors.grey[200],
                child: Icon(Icons.image_not_supported, size: 20.sp),
              ),
            ),
          ),

          SizedBox(width: 10.w),

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
                    height: 1.3.h,
                  ),
                ),
                SizedBox(height: 6.h),
                Row(
                  children: [
                    Text(
                      "${item['price']} ${sessionController.countryConfig.value?.currencyCode ?? ''}",
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.orange,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 8.w,
                        vertical: 3.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        "Qty ${item['quantity']}",
                        style: TextStyle(
                          fontSize: 11.sp,
                          color: Colors.black87,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ================= BOTTOM ACTION =================
  Widget _bottomActions() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 16.h),
      child: Row(
        children: [
          Checkbox(
            activeColor: AppColors.primaryColor,
            value: addToCartController.isAllSelected,
            onChanged: (_) => addToCartController.toggleSelectAll(),
          ),
          const Text("All"),
          const Spacer(),
          GestureDetector(
            onTap: () => addToCartController.removeSelectedItems(),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 22.w, vertical: 12.h),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24.r),
                border: Border.all(color: AppColors.primaryColor, width: 1.w),
              ),
              child: Text(
                "Remove",
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
