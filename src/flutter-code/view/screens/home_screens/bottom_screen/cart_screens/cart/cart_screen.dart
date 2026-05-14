import 'package:dress_fair_ecommmerce/controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_add_to_cart_controller/get_add_to_cart_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/available_offers_sheet.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/dialog/delete_dialog.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shadows_reuse/AppShadows.dart';

import '../../../../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../../../../controller/simple_method/simple_methode.dart';
import '../../../../../util/widgets/bottom_model_sheet/cart_delete_moddle_bottom_sheet.dart';
import '../../../../../util/widgets/bottom_model_sheet/order_summary_bottom_sheet.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen>
    with SingleTickerProviderStateMixin {
  final GetAddToCartController getAddToCartController = Get.put(
    GetAddToCartController(),
  );
  final AddToCartController addToCartController = Get.put(
    AddToCartController(),
  );
  RxBool isSelectedAll = false.obs;
  final GetProfileController getProfileController =
      Get.find<GetProfileController>();

  SessionController sessionController = Get.find<SessionController>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      getAddToCartController.label.value =
          SimpleMethode().getUrgencyLabel() ?? "";
    });

    if (getAddToCartController.tabController.value == null) {
      getAddToCartController.tabController.value = TabController(
        length: getAddToCartController.tabs.length,
        vsync: this,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        surfaceTintColor: Colors.white,
        leadingWidth: 100.w,
        leading: Obx(
          () => Visibility(
            visible: addToCartController.cartItems.isNotEmpty,
            child: Container(
              child: Row(
                children: [
                  Obx(() {
                    return Checkbox(
                      activeColor: AppColors.primaryColor,
                      value: addToCartController.isAllSelectedForCheckout,
                      onChanged: (_) {
                        addToCartController.toggleSelectAllForCheckout();
                      },
                    );
                  }),

                  AppTextWidget(text: "all".tr, fontWeight: FontWeight.w400),
                ],
              ),
            ),
          ),
        ),
        actions: [
          Obx(
            () => addToCartController.cartItems.isNotEmpty
                ? Padding(
                    padding: EdgeInsets.only(right: 14.0.w),
                    child: GestureDetector(
                      onTap: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(16.r),
                            ),
                          ),
                          builder: (_) => ManageCartBottomSheet(),
                        );
                      },
                      child: Container(
                        height: 30.h,
                        width: 60.w,
                        color: Colors.transparent,
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: 8.0.w,
                            vertical: 8.0.h,
                          ),
                          child: Align(
                            alignment: AlignmentGeometry.centerRight,
                            child: SvgPicture.asset(
                              height: 12.h,
                              AppImages.moreArrow,
                              color: Colors.black.withOpacity(0.8),
                            ),
                          ),
                        ),
                      ),
                    ),
                  )
                : SizedBox(),
          ),
        ],
        centerTitle: true,
        title: Obx(() {
          final products = getAddToCartController.allCarts.value?.products;
          final isEmpty = products == null || products.isEmpty;
          return isEmpty
              ? AppTextWidget(
                  text: "cart".tr,
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                )
              : AppTextWidget(
                  text: "${'cart'.tr} (${products.length})",
                  fontSize: 15.sp,
                  fontWeight: FontWeight.w500,
                );
        }),
      ),
      bottomNavigationBar: bottomNavWidget(),

      body: Obx(() {
        final controller = getAddToCartController;
        final cart = controller.allCarts.value;
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 10.0.w),
                child: staticContainer(),
              ),
              20.h.sh,

              ///   Cart Items :
              (addToCartController.cartItems.isEmpty)
                  ? SizedBox(
                      height: 50.h,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          SvgPicture.asset(
                            color: Colors.black.withOpacity(0.1),
                            height: 60.h,
                            AppImages.shopIcon,
                          ),
                          10.w.sw,
                          Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AppTextWidget(
                                text: "yourShippingCartIsEmpty".tr,
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w600,
                                color: Colors.black.withOpacity(0.7),
                              ),
                              5.h.sh,
                              AppTextWidget(
                                text: "addYourFavouriteItemsInIt".tr,
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w500,
                                color: Colors.black.withOpacity(0.5),
                              ),
                            ],
                          ),
                        ],
                      ),
                    )
                  : Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.0.w),
                      child: ListView.builder(
                        cacheExtent: 3000,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        padding: EdgeInsets.zero,
                        itemCount: addToCartController.cartItems.length ?? 0,
                        itemBuilder: (context, index) {
                          final item = addToCartController.cartItems[index];
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: EdgeInsets.only(
                                  right: 8.0.w,
                                  top: 8.0.h,
                                  bottom: 8.0.h,
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Obx(() {
                                      final item =
                                          addToCartController.cartItems[index];
                                      return Checkbox(
                                        activeColor: AppColors.primaryColor,
                                        value: item['isSelected'] ?? true,
                                        onChanged: (_) async {
                                          item['isSelected'] =
                                              !(item['isSelected'] ?? true);

                                          await addToCartController.cartBox.put(
                                            'items',
                                            addToCartController.cartItems
                                                .toList(),
                                          );

                                          /// Refresh UI:
                                          addToCartController.cartItems
                                              .refresh();
                                        },
                                      );
                                    }),

                                    /// Add Portion:
                                    Stack(
                                      children: [
                                        SimpleMethode.isSupportedFormat(
                                              "${SimpleMethode.imageUrl}/${item['image']}",
                                            )
                                            ? CachedNetworkImage(
                                                memCacheWidth: 300,
                                                fadeInDuration: Duration(
                                                  milliseconds: 100,
                                                ),
                                                imageUrl:
                                                    "${SimpleMethode.imageUrl}/${item['image']}",
                                                fit: BoxFit.cover,
                                                width: 90.w,
                                                height: 90.h,
                                              )
                                            : Container(
                                                color: Colors.grey[200],
                                                child: const Icon(
                                                  Icons.image_not_supported,
                                                  color: Colors.grey,
                                                ),
                                              ),

                                        Builder(
                                          builder: (_) {
                                            if (getAddToCartController
                                                    .label
                                                    .value
                                                    .isEmpty) {
                                              return SizedBox.shrink();
                                            }
                                            return Positioned(
                                              bottom: 4.h,
                                              left: 0,
                                              right: 0,
                                              child: Center(
                                                child: Container(
                                                  padding: EdgeInsets.symmetric(
                                                    horizontal: 6.w,
                                                    vertical: 2.h,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: Colors.black.withOpacity(
                                                      0.6,
                                                    ), // semi-transparent black
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          4.r,
                                                        ),
                                                  ),
                                                  child: Text(
                                                    getAddToCartController
                                                            .label
                                                            .value ??
                                                        "",
                                                    style: TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 8.sp,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            );
                                          },
                                        ),
                                      ],
                                    ),

                                    SizedBox(width: 8.w),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Expanded(
                                                child: AppTextWidget(
                                                  text:
                                                      sessionController
                                                              .selectedLanguageCode ==
                                                          "ar"
                                                      ? item['nameAr'] ?? ""
                                                      : item['name'] ?? "",
                                                  maxLines: 2,
                                                  fontSize: 10.sp,
                                                  color: Colors.black
                                                      .withOpacity(0.9),
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () async {
                                                  showDeleteAddressDialog(
                                                    context: context,
                                                    onDelete: () {
                                                      addToCartController
                                                          .removeItem(index);
                                                      Get.back();
                                                    },
                                                  );
                                                },
                                                child: Icon(
                                                  Icons.delete,
                                                  color: Colors.grey,
                                                  size: 20.sp,
                                                ),
                                              ),
                                            ],
                                          ),
                                          SizedBox(height: 2.h),
                                          Row(
                                            children: [
                                              AppTextWidget(
                                                text:
                                                    //"Size : ${item['size']} "
                                                    " Color : ${item['color']}",

                                                fontSize: 10.sp,
                                                color: Colors.black.withOpacity(
                                                  0.9,
                                                ),
                                                fontWeight: FontWeight.w400,
                                              ),
                                            ],
                                          ),

                                          ///Stars Reviews:
                                          Row(
                                            children: [
                                              /// Rating:
                                              Padding(
                                                padding: EdgeInsets.only(
                                                  left: 1.0.w,
                                                  right:
                                                      sessionController
                                                              .selectedLanguageCode ==
                                                          "ar"
                                                      ? 4.w
                                                      : 0.w,
                                                ),
                                                child: Row(
                                                  children: List.generate(5, (
                                                    index,
                                                  ) {
                                                    if (4.5 >= index + 1) {
                                                      return Icon(
                                                        Icons.star,
                                                        color: Colors.black,
                                                        size: 12.sp,
                                                      );
                                                    } else if (4.5 > index &&
                                                        4.5 < index + 1) {
                                                      return Icon(
                                                        Icons.star_half,
                                                        color: Colors.black,
                                                        size: 12.sp,
                                                      );
                                                    } else {
                                                      return Icon(
                                                        Icons.star_border,
                                                        color: Colors.grey,
                                                        size: 12.sp,
                                                      );
                                                    }
                                                  }),
                                                ),
                                              ),
                                              4.w.sw,
                                              Padding(
                                                padding: EdgeInsets.only(
                                                  right:
                                                      sessionController
                                                              .selectedLanguageCode ==
                                                          "ar"
                                                      ? 4.w
                                                      : 0.w,
                                                ),
                                                child: AppTextWidget(
                                                  text: 4.5.toStringAsFixed(1),
                                                  fontSize: 10.sp,
                                                  maxLines: 1,
                                                ),
                                              ),
                                              8.w.sw,
                                              AppTextWidget(
                                                text: "(${4})",
                                                fontSize: 10.sp,
                                                maxLines: 1,
                                              ),
                                            ],
                                          ),
                                          SizedBox(height: 2.h),

                                          ///
                                          (item['normalPrice'] == 0 ||
                                                  item['normalPrice'] == 0.0 ||
                                                  item['normalPrice'] ==
                                                      item['price'])
                                              ? SizedBox(height: 0)
                                              : AnimatedLineThrough(
                                                  color: Colors.grey.shade500,
                                                  duration: const Duration(
                                                    milliseconds: 500,
                                                  ),
                                                  isCrossed: true,
                                                  strokeWidth: 2,
                                                  child: AppTextWidget(
                                                    text:
                                                        "${item['normalPrice']}"
                                                        "${sessionController.countryConfig.value?.currencyCode}",
                                                    // text: cutPrice.toStringAsFixed(2),
                                                    fontSize: 11.sp,
                                                    color: Colors.grey.shade500,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),

                                          ///
                                          Container(
                                            // color: Colors.red,
                                            child: Row(
                                              children: [
                                                AppTextWidget(
                                                  text:
                                                      "${item['price']}"
                                                      "${sessionController.countryConfig.value?.currencyCode}",
                                                  fontSize: 14.sp,
                                                  color: AppColors.primaryColor,
                                                ),

                                                SizedBox(width: 5.w),

                                                if (item['discountPercent'] > 0)
                                                  Container(
                                                    padding:
                                                        EdgeInsets.symmetric(
                                                          horizontal: 3.w,
                                                          vertical: 1.h,
                                                        ),
                                                    decoration: BoxDecoration(
                                                      color: Colors.white,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                            1.r,
                                                          ),
                                                      border: Border.all(
                                                        width: 0.5.w,
                                                        color: AppColors
                                                            .primaryColor,
                                                      ),
                                                    ),
                                                    child: Center(
                                                      child: AppTextWidget(
                                                        text:
                                                            "-${item['discountPercent']}%",
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        fontSize: 9.sp,
                                                        color: AppColors
                                                            .primaryColor,
                                                      ),
                                                    ),
                                                  ),
                                                Spacer(),
                                                Container(
                                                  height: 19.h,
                                                  width: 19.w,
                                                  decoration: BoxDecoration(
                                                    border: Border.all(
                                                      color: Colors.black
                                                          .withOpacity(0.3),
                                                    ),
                                                  ),
                                                  child: Center(
                                                    child: AppTextWidget(
                                                      text:
                                                          item['quantity']
                                                              .toString() ??
                                                          "",
                                                      fontSize: 10.sp,
                                                      fontWeight:
                                                          FontWeight.w400,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Divider(
                                color: Colors.grey.shade300,
                                thickness: 1.w,
                                height: 1.h,
                              ),
                            ],
                          );
                        },
                      ),
                    ),
              tabBarContainer(),
              tabBarView(),
              20.h.sh,
            ],
          ),
        );
      }),
    );
  }

  Widget bottomNavWidget() {
    return Obx(() {
      return Padding(
        padding: EdgeInsets.only(bottom: 8.0.h, left: 8.w, right: 8.w),
        child: Container(
          width: MediaQuery.sizeOf(context).width,
          height: 55.h,
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: AppShadows.glowBox,
            borderRadius: BorderRadius.circular(50.r),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: 4.h),
                  addToCartController.selectedTotalNormalPrice == 0 ||
                          addToCartController.selectedTotalNormalPrice == 0.0 ||
                          addToCartController.selectedTotalNormalPrice ==
                              0.00 ||
                          addToCartController.selectedTotalNormalPrice ==
                              addToCartController.selectedTotalPrice
                      ? SizedBox()
                      : AnimatedLineThrough(
                          color: Colors.black,
                          duration: const Duration(milliseconds: 500),
                          isCrossed: true,
                          strokeWidth: 2.w,
                          child: AppTextWidget(
                            text:
                                "${sessionController.countryConfig.value?.currencyCode ?? ""}"
                                " ${addToCartController.selectedTotalNormalPrice.toString()}",
                            fontSize: 12.sp,
                            color: Colors.black.withOpacity(0.8),
                            fontWeight: FontWeight.w500,
                          ),
                        ),

                  Padding(
                    padding: EdgeInsets.only(
                      left: 20.0.w,
                      right: sessionController.selectedLanguageCode == "ar"
                          ? 15.w
                          : 0,
                    ),
                    child: Row(
                      children: [
                        AppTextWidget(
                          text:
                              "${sessionController.countryConfig.value?.currencyCode ?? ""}"
                              " ${addToCartController.totalWithShippingCharges.toStringAsFixed(2)}",
                          fontSize: 15.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryColor,
                        ),
                        Obx(
                          () => GestureDetector(
                            onTap: () {
                              addToCartController.isShowBottomSheet.value =
                                  !addToCartController.isShowBottomSheet.value;
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) => PriceDetailsCartBottomSheet(),
                              );
                            },
                            child: Padding(
                              padding: EdgeInsets.only(top: 2.0.h),
                              child: Icon(
                                addToCartController.isShowBottomSheet.value
                                    ? Icons.keyboard_arrow_down_sharp
                                    : Icons.keyboard_arrow_up,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 4.h),
                ],
              ),
              Padding(
                padding: EdgeInsets.only(
                  right: 8.0.w,
                  left: 8.0.w,
                  bottom: 5.h,
                  top: 5.h,
                ),
                child: AppButton(
                  width: MediaQuery.sizeOf(context).width * 0.4,
                  height: 40.h,
                  onTap: () {
                    if (addToCartController.cartItems.isEmpty) {
                      AppToast.showError("pleaseAddAtToCartFirst".tr);
                      return;
                    }

                    if (!addToCartController.hasSelectedItems) {
                      AppToast.showError("pleaseSelectProductForOrderPlace".tr);
                      return;
                    }
                    Get.toNamed(
                      checkOutScreen,
                      arguments: addToCartController.cartItems,
                    );
                  },
                  textStyle: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                  borderRadius: 40.r,
                  isLoading: false.obs,
                  text:
                      getAddToCartController.allCarts.value?.products == null ||
                          getAddToCartController
                              .allCarts
                              .value!
                              .products
                              .isEmpty
                      ? "checkOut".tr
                      : "${"checkOut".tr} (${getAddToCartController.allCarts.value?.products.length ?? 0})",
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget staticContainer() {
    return GestureDetector(
      onTap: () => OfferBottomSheet.show(context),
      child: Container(
        height: 30.h,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5.r),
          border: Border.all(
            width: 0.2.w,
            color: Colors.black.withOpacity(0.5),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                10.w.sw,
                Icon(Icons.check, color: Colors.green, size: 20.sp),
                10.w.sw,
                AppTextWidget(
                  text: "freeShippingAndFreeReturns".tr,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w500,
                  color: Colors.green,
                ),
              ],
            ),
            Padding(
              padding: EdgeInsets.only(right: 10.0.w, left: 8.w),
              child: AppTextWidget(
                text: "limitedTime".tr,
                fontSize: 10.sp,
                fontWeight: FontWeight.w400,
                color: Colors.black.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget tabBarContainer() {
    return Obx(() {
      return Container(
        padding: EdgeInsets.zero,
        color: Colors.white,
        child: TabBar(
          controller: getAddToCartController.tabController.value,
          isScrollable: true,
          indicatorColor: AppColors.primaryColor,
          padding: EdgeInsets.zero,
          dividerColor: Colors.transparent,
          tabAlignment: TabAlignment.start,
          indicator: const BoxDecoration(),
          labelColor: AppColors.primaryColor,
          unselectedLabelColor: Colors.grey,
          labelPadding: EdgeInsets.symmetric(horizontal: 10.w),
          labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp),
          unselectedLabelStyle: TextStyle(
            fontSize: 13.sp,
            fontWeight: FontWeight.w400,
          ),
          tabs: getAddToCartController.tabs
              .map((keys) => Tab(text: keys.tr))
              .toList(),
          indicatorSize: TabBarIndicatorSize.label,
        ),
      );
    });
  }

  Widget tabBarView() {
    return Obx(() {
      return SizedBox(
        height: 450.h,
        width: double.infinity,
        child: TabBarView(
          controller: getAddToCartController.tabController.value,
          children: getAddToCartController.cartScreens,
        ),
      );
    });
  }
}
