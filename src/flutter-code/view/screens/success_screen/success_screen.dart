import 'package:dress_fair_ecommmerce/controller/get_add_to_cart_controller/get_add_to_cart_controller.dart';
import 'package:dress_fair_ecommmerce/controller/home_controller/home_controller.dart';
import 'package:dress_fair_ecommmerce/controller/submit_order_controller/submit_order_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../controller/session_controller/session_controller.dart';

class SuccessScreen extends StatefulWidget {
  final String orderId;

  const SuccessScreen({super.key, required this.orderId});

  @override
  State<SuccessScreen> createState() => _SuccessScreenState();
}

class _SuccessScreenState extends State<SuccessScreen> {
  SubmitOrderController submitOrderController = Get.put(
    SubmitOrderController(),
  );
  SessionController sessionController = Get.find<SessionController>();

  final GetAddToCartController getAddToCartController =
      Get.find<GetAddToCartController>();
  BottomNavController bottomNavController = Get.put(BottomNavController());

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      submitOrderController.getSuccessOrder(orderId: widget.orderId);
      getAddToCartController.allCarts.value = null;
      bottomNavController.currentIndex.value = 0;
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Get.offAllNamed(homeScreen);
        return false;
      },

      child: Scaffold(
        appBar: AppBar(
          leadingWidth: 35.w,
          leading: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Padding(
              padding: EdgeInsets.only(left: 10.0.w),
              child: SvgPicture.asset(height: 20.h, AppImages.backArrow),
            ),
          ),
          backgroundColor: Colors.white,
          centerTitle: true,
          title: Text(
            "orderConfirmation".tr,
            style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w400),
          ),
        ),
        backgroundColor: Colors.white,
        extendBody: true,
        bottomNavigationBar: Padding(
          padding: EdgeInsets.only(left: 20.w, right: 20.w, bottom: 30.h),
          child: SizedBox(
            width: double.infinity,
            height: 50.h,
            child: Obx(
              () => Visibility(
                visible: !submitOrderController.isLoadingSuccess.value,
                child: AppButton(
                  onTap: () {
                    Get.offNamed(trackOrderScreen);
                  },
                  text: "trackOrder".tr,
                  containerColor: AppColors.primaryColor,
                  borderRadius: 30.r,
                  isLoading: false.obs,
                  width: MediaQuery.sizeOf(context).width,
                  textStyle: TextStyle(color: Colors.white),
                  height: 50.h,
                ),
              ),
            ),
          ),
        ),
        body: SingleChildScrollView(
          child: Obx(() {
            if (submitOrderController.isLoadingSuccess.value) {
              return Center(
                child: Padding(
                  padding: EdgeInsets.only(top: 220.0.h),
                  child: CircularProgressIndicator(
                    color: AppColors.primaryColor,
                  ),
                ),
              );
            }
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                60.h.sh,

                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFFf0f7f0), Color(0xFFe8f5e8)],
                    ),
                  ),
                  child: Center(
                    child: Container(
                      width: MediaQuery.of(context).size.width * 0.9,
                      constraints: BoxConstraints(maxWidth: 800.w),
                      margin: EdgeInsets.symmetric(
                        horizontal: 20.w,
                        vertical: 20.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12.r),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12,
                            blurRadius: 10.r,
                            offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            // Header Section:
                            _buildHeader(),
                            // Order Summary Section:
                            _buildOrderSummary(context),
                            // Products Section:
                            _buildProductsSection(),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  Widget _buildProductDetail(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "$label : ",
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
              fontSize: 12.sp,
            ),
          ),

          SizedBox(
            width: MediaQuery.sizeOf(context).width * 0.21,
            //color: Colors.red,
            child: Text(
              value,
              maxLines: 1,
              softWrap: true,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(color: Colors.grey.shade900, fontSize: 12.sp),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductItem({
    required int productNumber,
    required String title,
    // required String price,
    required String quantity,
    // required String color,
    // required String size,
    // required String model,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8.r),
        border: Border(
          left: BorderSide(color: AppColors.primaryColor, width: 4.w),
        ),
      ),
      padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 0.h),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product header with title and price:
          AppTextWidget(
            text: '# $productNumber ${"product".tr} $title',
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.primaryColor,
          ),
          12.h.sh,
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [_buildProductDetail(AppText.quantity, quantity)],
          ),
          // Row(
          //   mainAxisAlignment: MainAxisAlignment.start,
          //   children: [
          //     _buildProductDetail(AppText.sizes, size),
          //
          //     if (model.isNotEmpty) _buildProductDetail(AppText.model, model),
          //   ],
          // ),

          // Row(
          //   mainAxisAlignment: MainAxisAlignment.start,
          //   children: [_buildProductDetail(AppText.price, price)],
          // ),

          // Divider
          Container(
            height: 1,
            color: Colors.grey.shade200,
            margin: EdgeInsets.symmetric(vertical: 15.h),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(BuildContext context) {
    return Obx(
      () => Container(
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 10.h),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: Colors.grey.shade200, width: 1.w),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppTextWidget(
              text: "orderSummary".tr,
              fontSize: 16.sp,
              fontWeight: FontWeight.bold,
              color: AppColors.primaryColor,
            ),

            SizedBox(height: 10.h),
            Container(height: 2.h, color: Colors.grey.shade200),
            SizedBox(height: 10.h),
            // Responsive layout for order details:
            SizedBox(
              width: MediaQuery.sizeOf(context).width,
              child: Row(
                children: [
                  AppTextWidget(
                    text: "name".tr,
                    color: Colors.grey.shade600,
                    fontSize: 14.sp,
                  ),

                  AppTextWidget(
                    text:
                        '  ${submitOrderController.successOrder.value?.customerName ?? ""}',
                    fontSize: 14.sp,

                    color: Colors.grey.shade900,
                  ),
                ],
              ),
            ),
            5.h.sh,
            SizedBox(
              width: MediaQuery.sizeOf(context).width,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppTextWidget(
                    text: "address".tr,
                    color: Colors.grey.shade600,
                    fontSize: 14.sp,
                  ),
                  SizedBox(width: 4.w),
                  SizedBox(
                    //color: Colors.red,
                    width: MediaQuery.sizeOf(context).width * 0.6,
                    child: AppTextWidget(
                      text:
                          '  ${submitOrderController.successOrder.value?.customerCity ?? ""}  ${submitOrderController.successOrder.value?.customerArea}',
                      fontSize: 14.sp,
                      color: Colors.grey.shade900,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),

            5.h.sh,
            SizedBox(
              width: MediaQuery.sizeOf(context).width,
              child: Row(
                children: [
                  AppTextWidget(
                    text: "contact".tr,
                    color: Colors.grey.shade600,
                    fontSize: 14.sp,
                  ),

                  SizedBox(
                    width: MediaQuery.sizeOf(context).width * 0.62,
                    child: AppTextWidget(
                      text:
                          '  ${submitOrderController.successOrder.value?.customerMobile ?? ""}',
                      color: Colors.grey.shade900,
                      fontSize: 14.sp,
                      maxLines: 1,
                      softWrap: true,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsSection() {
    return Obx(() {
      return Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 25.h),
        child: ListView.builder(
          cacheExtent: 3000,
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          physics: NeverScrollableScrollPhysics(),
          itemCount:
              submitOrderController.successOrder.value?.orderProducts.length ??
              0,
          itemBuilder: (context, index) {
            var item =
                submitOrderController.successOrder.value?.orderProducts[0];
            return Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0.w),
              child: _buildProductItem(
                productNumber: 1,
                title: sessionController.selectedLanguageCode == "ar"
                    ? item?.productNameAr ?? ""
                    : item?.productName ?? "",
                quantity: item?.orderProductQuantity.toString() ?? "",
                // color: item?.option != null && item!.option?.length != 0
                //     ? item.option?.first.name ?? ""
                //     : "",
                //AppText.nA,
                // size: (item?.option?.length == 1)
                //     ? item?.option?.first.value?.toString() ?? AppText.nA
                //     : "",
                //AppText.nA,
                // model: item?.model ?? "",
              ),
            );
          },
        ),
      );
    });
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(
        left: 10.w,
        top: 10.h,
        right: 10.w,
        bottom: 10.h,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: const [
            Color(0xFFF08A4B), // lighter orange
            Color(0xFFE56B2A), // primary
            Color(0xFFD85C1A), // darker orange
          ],

          //[Color(0xFF4CAF50), Color(0xFF2E7D32)],
        ),
      ),
      child: Column(
        children: [
          AppTextWidget(
            text: "orderConfirmation".tr,
            color: Colors.white,
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
          ),
          SizedBox(height: 10.h),
          AppTextWidget(
            text: '${"yourOrderId".tr}  #${widget.orderId.toString()}',
            color: Colors.white.withOpacity(0.9),
            fontSize: 14.sp,
          ),
        ],
      ),
    );
  }
}
