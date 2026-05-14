import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/get_orders_status_controller/get_order_status_controller.dart';
import '../../../../../../../controller/simple_method/simple_methode.dart';

class ShippedScreen extends StatefulWidget {
  const ShippedScreen({super.key});
  @override
  State<ShippedScreen> createState() => _ShippedScreenState();
}

class _ShippedScreenState extends State<ShippedScreen>
    with AutomaticKeepAliveClientMixin {
  final GetOrderStatusController controller = Get.put(
    GetOrderStatusController(),
  );

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      body: Obx(() {
        if (controller.shipped.isEmpty) {
          return Center(child: Text("noDataFound".tr));
        }

        return ListView.builder(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
          physics: const BouncingScrollPhysics(),
          itemCount: controller.shipped.length,
          itemBuilder: (context, index) {
            final order = controller.shipped[index];

            return Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.r),
              ),
              elevation: 2,
              margin: EdgeInsets.only(bottom: 12.h),
              child: ExpansionTile(
                tilePadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 12.h,
                ),
                childrenPadding: EdgeInsets.symmetric(
                  horizontal: 16.w,
                  vertical: 8.h,
                ),
                backgroundColor: Colors.white,
                collapsedBackgroundColor: Colors.white,
                collapsedShape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  side: BorderSide(color: Colors.grey.shade200),
                ),
                // --------------------------
                // Collapsed view
                // --------------------------
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Status + Order ID
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          order.orderStatus.toUpperCase(),
                          style: TextStyle(
                            color: Colors.orange,
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          "ID: ${order.orderId}",
                          style: TextStyle(
                            fontSize: 10.sp,
                            color: Colors.grey[700],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 4.h),
                    // Customer Name
                    Text(
                      "Customer: ${controller.orderStatuses.value?.customer.customerName ?? "-"}",
                      style: TextStyle(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 2.h),
                    // Customer Address
                    Text(
                      "Address: ${controller.orderStatuses.value?.customer.customerArea ?? "-"}, ${controller.orderStatuses.value?.customer.customerCity ?? "-"}",
                      style: TextStyle(
                        fontSize: 10.sp,
                        color: Colors.grey[700],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
                // --------------------------
                // Expanded view
                // --------------------------
                children: List.generate(order.orderProducts.length, (
                  productIndex,
                ) {
                  final product = order.orderProducts[productIndex];

                  return Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.h),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Product image
                        SizedBox(
                          height: 80.w,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: product.images.length,
                            itemBuilder: (context, imgIndex) {
                              final img = product.images[imgIndex];
                              return Padding(
                                padding: EdgeInsets.only(right: 8.w),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(6.r),
                                  child:
                                      SimpleMethode.isSupportedFormat(
                                        "${SimpleMethode.imageUrl}/${img.url}",
                                      )
                                      ? CachedNetworkImage(
                                          imageUrl:
                                              "${SimpleMethode.imageUrl}/${img.url}",
                                          width: 80.w,
                                          height: 80.w,
                                          fit: BoxFit.cover,
                                        )
                                      : Container(
                                          height: 130.h,
                                          color: Colors.grey[200],
                                          child: const Center(
                                            child: Icon(
                                              Icons.image_not_supported,
                                            ),
                                          ),
                                        ),
                                ),
                              );
                            },
                          ),
                        ),

                        SizedBox(height: 6.h),
                        // Product Name
                        Text(
                          product.productName,
                          style: TextStyle(
                            fontSize: 11.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 2.h),
                        // Quantity + Price for LAST product of THIS order
                        if (productIndex == order.orderProducts.length - 1)
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Qty: ${product.orderProductQuantity}",
                                style: TextStyle(fontSize: 10.sp),
                              ),
                              Row(
                                children: [
                                  Icon(
                                    Icons.account_balance_wallet_rounded,
                                    size: 14.sp,
                                    color: AppColors.primaryColor,
                                  ),
                                  SizedBox(width: 4.w),
                                  Text(
                                    "${order.orderTotalAmount} ${order.currency.code}",
                                    style: TextStyle(
                                      fontSize: 11.sp,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primaryColor,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        Divider(color: Colors.grey.shade300),
                      ],
                    ),
                  );
                }),
              ),
            );
          },
        );
      }),
    );
  }
}
