import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_orders_status_controller/get_order_status_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/widgets/track_more_product_deatils.dart';

import '../../../../../../controller/simple_method/simple_methode.dart';

class TrackMoreDescribedOrderDetail extends StatefulWidget {
  final String status;
  String id;
  TrackMoreDescribedOrderDetail({
    super.key,
    required this.status,
    required this.id,
  });

  @override
  State<TrackMoreDescribedOrderDetail> createState() =>
      _TrackMoreDescribedOrderDetailState();
}

class _TrackMoreDescribedOrderDetailState
    extends State<TrackMoreDescribedOrderDetail> {
  GetOrderStatusController controller = Get.put(GetOrderStatusController());
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      await controller.getOrderByID(widget.id);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: AppTextWidget(
          text: "View Details",
          color: AppColors.blackColor,
          fontWeight: FontWeight.w500,
          fontSize: 15.sp,
        ),
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back_ios_new,
              size: 20.sp,
              color: Colors.black.withOpacity(0.6),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        child: Obx(
          () => controller.isLoading.value
              ? Padding(
                  padding: EdgeInsets.only(
                    top: MediaQuery.sizeOf(context).height * 0.4,
                  ),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primaryColor,
                    ),
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Order Time and ID:
                    _buildOrderHeader(),
                    SizedBox(height: 16.h),
                    _buildDeliveryTimeline(context),
                    SizedBox(height: 16.h),
                    _paymentDetails(context),
                    SizedBox(height: 16.h),
                    _paymentProtect(context),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildOrderHeader() {
    var item = controller.orderByID.value;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextWidget(
          text: widget.status ?? "",
          fontSize: 14.sp,
          color: Colors.black,
          fontWeight: FontWeight.w500,
        ),
        SizedBox(height: 5.h),
        AppTextWidget(
          text: 'Order Time : ${item?.dateAdded ?? ""}',
          fontSize: 12.sp,
          color: Colors.black87,
        ),
        SizedBox(height: 4.h),
        AppTextWidget(
          text: 'Order ID : ${item?.orderId ?? ""}',
          fontSize: 12.sp,
          color: Colors.black87,
        ),
      ],
    );
  }

  Widget _buildShippingAddress() {
    var item = controller.orderByID.value;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextWidget(
          text: 'Shipping to',
          fontSize: 14.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black87,
        ),
        SizedBox(height: 8.h),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppTextWidget(
                text: item?.firstname ?? "",
                fontSize: 13.sp,
                color: Colors.black87,
                fontWeight: FontWeight.w400,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDeliveryTimeline(BuildContext context) {
    return Container(
      width: double.infinity,

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4.r,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                color: Colors.black.withOpacity(0.1),
                child: Padding(
                  padding: EdgeInsets.only(left: 16.w, top: 16.h, bottom: 16.h),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          AppTextWidget(
                            text: 'Shipping to :',
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                            color: Colors.black,
                          ),
                          SizedBox(height: 6.h),
                          AppTextWidget(
                            text:
                                controller.orderByID.value?.firstname
                                    .toString() ??
                                "",
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w400,
                            color: Colors.black.withOpacity(0.8),
                          ),
                          SizedBox(height: 2.h),
                          AppTextWidget(
                            text:
                                controller.orderByID.value?.shippingAddress1 ??
                                "",
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w400,
                            color: Colors.black.withOpacity(0.8),
                          ),
                          SizedBox(height: 2.h),
                          SizedBox(
                            width: MediaQuery.sizeOf(context).width * 0.41,
                            child: AppTextWidget(
                              maxLines: 3,
                              text: controller.cleanText(
                                controller.orderByID.value?.shippingAddress ??
                                    "",
                              ),
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w400,
                              color: Colors.black.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: EdgeInsets.only(right: 10.0.w),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            8.h.sh,
                            GestureDetector(
                              onTap: () {
                                Get.off(DetailTrackingScreen(id: widget.id));
                              },
                              child: Container(
                                width: 100.w,
                                height: 33.h,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  border: Border.all(
                                    color: Colors.black,
                                    width: 0.5,
                                  ),
                                  borderRadius: BorderRadius.circular(30.r),
                                ),
                                child: Center(
                                  child: AppTextWidget(
                                    text: "track".tr,
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.black.withOpacity(0.6),
                                  ),
                                ),
                              ),
                            ),
                            10.h.sh,
                            Container(
                              width: 100.w,
                              height: 33.h,
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(
                                  color: Colors.black,
                                  width: 0.5,
                                ),
                                borderRadius: BorderRadius.circular(30.r),
                              ),
                              child: Center(
                                child: AppTextWidget(
                                  text: "View Receipt",
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black.withOpacity(0.6),
                                ),
                              ),
                            ),
                            10.h.sh,

                            // Visibility(
                            //   visible: (widget.status != "Pending"),
                            //   child: AppButton(
                            //     width: 100.w,
                            //     height: 33.h,
                            //     onTap: () {
                            //       Get.off(DetailTrackingScreen(id: widget.id));
                            //     },
                            //     textStyle: TextStyle(
                            //       color: Colors.white,
                            //       fontSize: 10.sp,
                            //       fontWeight: FontWeight.w600,
                            //     ),
                            //     borderRadius: 30.r,
                            //     isLoading: false.obs,
                            //     text: "Buy this again",
                            //   ),
                            // ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(height: 10.h),

              Padding(
                padding: EdgeInsets.only(left: 16.w, top: 2.h, bottom: 16.h),
                child: Container(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2.r),
                        child:
                            SimpleMethode.isSupportedFormat(
                              "${SimpleMethode.imageUrl}/${controller.orderByID.value?.products?.first.image ?? ""}",
                            )
                            ? CachedNetworkImage(
                                memCacheWidth: 300,
                                fadeInDuration: Duration(milliseconds: 100),
                                imageUrl:
                                    "${SimpleMethode.imageUrl}/${controller.orderByID.value?.products?.first.image ?? ""}",
                                width: 90.w,
                                height: 90.w,
                                fit: BoxFit.cover,
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
                      SizedBox(width: 10.w),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              SizedBox(
                                width: MediaQuery.sizeOf(context).width * 0.28,
                                child: AppTextWidget(
                                  text:
                                      controller
                                          .orderByID
                                          .value
                                          ?.products
                                          ?.first
                                          .name ??
                                      "",
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w400,
                                  color: Colors.black,
                                  maxLines: 1,
                                  softWrap: true,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              SizedBox(width: 3.w),
                              SizedBox(
                                width: MediaQuery.sizeOf(context).width * 0.28,
                                child: AppTextWidget(
                                  text:
                                      "${controller.orderByID.value?.currencyCode ?? ""} ${controller.orderByID.value?.total ?? ""}",
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black,
                                  maxLines: 1,
                                  softWrap: true,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 5.w),
                          AppTextWidget(
                            text:
                                "${controller.orderByID.value?.products?.first.model ?? ""}  x${controller.orderByID.value?.products?.first.quantity ?? ""}",
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.black.withOpacity(0.5),
                            maxLines: 1,
                            softWrap: true,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),

                      SizedBox(height: 10.h),
                      Divider(
                        thickness: 0.7,
                        color: Colors.black.withOpacity(0.2),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _paymentDetails(BuildContext context) {
    return Container(
      width: double.infinity,

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4.r,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            color: Colors.white,
            child: Padding(
              padding: EdgeInsets.only(left: 16.w, top: 16.h, bottom: 16.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppTextWidget(
                    text: 'Payment Details',
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                    color: Colors.black,
                  ),

                  SizedBox(height: 6.h),
                  AppTextWidget(
                    text: "Order Summary",
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                    color: Colors.green,
                  ),
                  SizedBox(height: 6.h),
                  AppTextWidget(
                    text:
                        "${controller.orderByID.value?.currencyCode.toString() ?? ""} ${controller.orderByID.value?.total.toString() ?? ""}",
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                  SizedBox(height: 14.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "Sub-Total",
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.black,
                      ),
                      Padding(
                        padding: EdgeInsets.only(right: 2.0.w),
                        child: AppTextWidget(
                          text:
                              "${controller.orderByID.value?.currencyCode.toString() ?? ""} ${controller.orderByID.value?.products?.first.totalRaw ?? ""}",
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        ),
                      ),
                      10.h.sh,
                    ],
                  ),
                  SizedBox(height: 8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "Quantity",
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                        color: Colors.black,
                      ),
                      Padding(
                        padding: EdgeInsets.only(right: 2.0.w),
                        child: AppTextWidget(
                          text:
                              controller
                                  .orderByID
                                  .value
                                  ?.products
                                  ?.first
                                  .quantity ??
                              "",
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.black,
                        ),
                      ),
                      10.h.sh,
                    ],
                  ),
                  SizedBox(height: 8.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      AppTextWidget(
                        text: "Total",
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                      Padding(
                        padding: EdgeInsets.only(right: 2.0.w),
                        child: AppTextWidget(
                          text:
                              "${controller.orderByID.value?.currencyCode.toString() ?? ""} ${controller.orderByID.value?.total ?? ""}",
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                        ),
                      ),
                      10.h.sh,
                    ],
                  ),
                  SizedBox(height: 15.h),
                  AppTextWidget(
                    text: "Payment Methode ",
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                  SizedBox(height: 10.h),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.0.w),
                    child: Divider(
                      thickness: 0.7,
                      color: Colors.black.withOpacity(0.2),
                    ),
                  ),
                  SizedBox(height: 10.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentProtect(BuildContext context) {
    return Container(
      width: double.infinity,

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4.r,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            color: Colors.white,
            child: Padding(
              padding: EdgeInsets.only(left: 16.w, top: 16.h, bottom: 16.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  SizedBox(height: 4.h),
                  AppTextWidget(
                    text: "Protection",
                    maxLines: 4,
                    softWrap: true,
                    overflow: TextOverflow.ellipsis,
                    fontSize: 14.sp,
                    color: Colors.black,
                    fontWeight: FontWeight.w600,
                  ),
                  SizedBox(height: 10.h),
                  AppTextWidget(
                    text:
                        "Dress Fair is committed to protecting your payment information  ",
                    maxLines: 4,
                    softWrap: true,
                    overflow: TextOverflow.ellipsis,
                    fontSize: 12.sp,
                    color: Colors.green,
                    fontWeight: FontWeight.w400,
                  ),
                  SizedBox(height: 5.h),
                  AppTextWidget(
                    text:
                        "We follow PCI DSS standards, use strong encryption, and perform regular reviews of its system to protect your privacy.",
                    maxLines: 4,
                    softWrap: true,
                    overflow: TextOverflow.ellipsis,
                    fontSize: 12.sp,
                    color: Colors.black.withOpacity(0.8),
                    fontWeight: FontWeight.w400,
                  ),
                  SizedBox(height: 5.h),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
