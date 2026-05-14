import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_orders_status_controller/get_order_status_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_static_text/marguee_reuable_text.dart';

import '../../../../../../controller/simple_method/simple_methode.dart';

class DetailTrackingScreen extends StatefulWidget {
  String id;
  DetailTrackingScreen({super.key, required this.id});

  @override
  State<DetailTrackingScreen> createState() => _DetailTrackingScreenState();
}

class _DetailTrackingScreenState extends State<DetailTrackingScreen> {
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
          text: "viewTracking".tr,
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
                    SizedBox(height: 10.h),
                    staticTractOrderSlider(context),
                    SizedBox(height: 5.h),
                    // Order Processing Status:
                    Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: 16.w,
                        vertical: 16.h,
                      ),
                      child: _buildProcessingStatus(),
                    ),
                    // SizedBox(height: 10.h),
                    // Delivery Timeline:
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.w),
                      child: _buildDeliveryTimeline(context),
                    ),
                    SizedBox(height: 40.h),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildProcessingStatus() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
      decoration: BoxDecoration(
        color: Colors.green,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.blue.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppTextWidget(
            text: 'yourOrderIsCurrentlyBeing'.tr,
            fontSize: 13.sp,
            fontWeight: FontWeight.w500,
            color: Colors.white,
          ),
        ],
      ),
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
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextWidget(
                  text: 'Delivery:',
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black,
                ),
                SizedBox(height: 4.h),
                AppTextWidget(
                  text: 'yourOrderIsExpected'.tr,
                  fontSize: 12.sp,
                  color: Colors.black.withOpacity(0.7),
                  fontWeight: FontWeight.w400,
                ),
                SizedBox(height: 20.h),
                AppTextWidget(
                  text: 'packageInfo'.tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black.withOpacity(0.9),
                ),
                SizedBox(height: 10.h),
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
                SizedBox(height: 10.h),
                AppTextWidget(
                  text: 'shipTo'.tr,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.black.withOpacity(0.9),
                ),
                SizedBox(height: 10.h),
                AppTextWidget(
                  text:
                      "Name : ${controller.orderByID.value?.firstname.toString() ?? ""}",
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
                SizedBox(height: 10.h),

                AppTextWidget(
                  text:
                      "Order Id : ${controller.orderByID.value?.orderId ?? ""}",
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
                SizedBox(height: 10.h),
                AppTextWidget(
                  text:
                      "Total : ${controller.orderByID.value?.currencyCode ?? ""} ${controller.orderByID.value?.total ?? ""}",
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black,
                ),
                SizedBox(height: 20.h),
                Divider(thickness: 0.7, color: Colors.black.withOpacity(0.2)),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: AppTextWidget(
              text: 'shippingDetails'.tr,
              fontSize: 14.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
          ),
          SizedBox(height: 15.h),

          // Shipping Timeline
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: _buildTimelineItem(
              title: 'delivered'.tr,
              isCompleted: false,
              isLast: false,
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: _buildTimelineItem(
              title: 'orderShipped'.tr,
              isCompleted: false,
              isLast: false,
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: _buildTimelineItem(
              title: 'orderSubmitted'.tr,
              isCompleted: true,
              isLast: true,
            ),
          ),
          SizedBox(height: 20.h),
        ],
      ),
    );
  }

  Widget _buildTimelineItem({
    required String title,
    required bool isCompleted,
    required bool isLast,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 12.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline dot
          Container(
            width: 18.w,
            height: 18.h,
            margin: EdgeInsets.only(right: 12.w),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCompleted ? Colors.red : Colors.grey.shade300,
              border: Border.all(
                color: isCompleted ? Colors.red : Colors.grey.shade400,
                width: 2.w,
              ),
            ),
            child: isCompleted
                ? Icon(Icons.check, size: 12.w, color: Colors.white)
                : null,
          ),

          // Timeline content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextWidget(
                  text: title,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                  color: isCompleted ? Colors.red : Colors.grey.shade600,
                ),
                // Timeline connector line (except for last item):
                if (!isLast)
                  Container(
                    width: 1.w,
                    height: 12.h,
                    margin: EdgeInsets.only(left: 10.w, top: 4.h),
                    color: Colors.grey.shade300,
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
