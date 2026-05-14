import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/customer_profile/customer_profile_controller.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/address_screens/all_address.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/available_offers_sheet.dart';

class YouScreen extends StatefulWidget {
  const YouScreen({super.key});

  @override
  State<YouScreen> createState() => _YouScreenState();
}

class _YouScreenState extends State<YouScreen>
    with AutomaticKeepAliveClientMixin {
  final GetAddToCartController getAddToCartController =
      Get.find<GetAddToCartController>();
  final SessionController sessionController = Get.find<SessionController>();
  final ProductController productController = Get.find<ProductController>();
  final GetProfileController getProfileController = Get.put(
    GetProfileController(),
  );
  late final ScrollController _scrollController;
  final RxBool hasReachedBottom = false.obs;

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;

    /// Detect end of MAIN page:
    if (position.extentAfter < 600) {
      log("Reached to Extend After==");
      hasReachedBottom.value = true;
      if (!productController.isMoreLoading.value &&
          productController.getHasMoreData("")) {
        productController.requestNextPage("");
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            /// --- Top user section:
            Obx(() {
              return sessionController.isUserLoginIn.value
                  ? SliverToBoxAdapter(child: topSection())
                  : SliverToBoxAdapter(child: withoutLogin());
            }),
            SliverToBoxAdapter(child: couponsPrice()),
            SliverToBoxAdapter(child: listTiles()),
            SliverPadding(padding: EdgeInsets.only(top: 8.h)),

            /// --- New Arrivals Grid (pagination):
            SliverToBoxAdapter(child: newArrivals()),

            Obx(
              () => SliverToBoxAdapter(
                child: productController.isMoreLoading.value
                    ? Padding(
                        padding: EdgeInsets.symmetric(vertical: 20.h),
                        child: SpinKitFadingCircle(
                          color: AppColors.greyColor,
                          size: 30.sp,
                        ),
                      )
                    : SizedBox(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// ✅ New Arrivals Grid
  Widget newArrivals() {
    return Obx(() {
      if (productController.isLoading.value) {
        return SizedBox(height: 200.h, child: ProductCardShimmer());
      }
      if (productController.allProducts.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 30.h),
            child: AppTextWidget(text: AppText.noDataFound),
          ),
        );
      }

      return Padding(
        padding: EdgeInsets.symmetric(horizontal: 0.w),
        child: GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          cacheExtent: 3000,
          padding: EdgeInsets.zero,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 3,
            mainAxisExtent: MediaQuery.sizeOf(context).height * 0.288,
          ),
          itemCount: productController.allProducts.length,
          itemBuilder: (context, index) {
            final item = productController.allProducts[index];
            return ProductCard(
              item: item,
              sessionController: sessionController,
              fakeRating: 4.5,
              fakeReviews: 4,
            );
          },
        ),
      );
    });
  }

  /// ✅ Top user info:
  Widget topSection() {
    return Obx(
      () => Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        child: Row(
          children: [
            GestureDetector(
              onTap: () {
                Get.toNamed(profileScreenMain);
              },
              child: Row(
                children: [
                  // Visibility(
                  //   visible: true,
                  //   child: GestureDetector(
                  //     onTap: () {
                  //       Get.toNamed(profileScreenMain);
                  //     },
                  //     child: Obx(() {
                  //       if (sessionController.pickedProfileImage.value !=
                  //           null) {
                  //         return ClipOval(
                  //           child: Image.file(
                  //             sessionController.pickedProfileImage.value!,
                  //             width: 56.r,
                  //             height: 56.r,
                  //             fit: BoxFit.cover,
                  //           ),
                  //         );
                  //       }
                  //
                  //       /// Network image:
                  //       if (getProfileController
                  //               .customerProfile
                  //               .value
                  //               ?.image
                  //               .isNotEmpty ==
                  //           true) {
                  //         return ClipOval(
                  //           child: CachedNetworkImage(
                  //             imageUrl:
                  //                 "${SimpleMethode.imageUrl}/${getProfileController.customerProfile.value!.image}",
                  //             width: 56.r,
                  //             height: 56.r,
                  //             fit: BoxFit.cover,
                  //             fadeInDuration: const Duration(milliseconds: 200),
                  //             placeholder: (context, url) => Container(
                  //               width: 56.r,
                  //               height: 56.r,
                  //               alignment: Alignment.center,
                  //               child: const CircularProgressIndicator(
                  //                 strokeWidth: 2,
                  //               ),
                  //             ),
                  //             errorWidget: (context, url, error) => Container(
                  //               width: 56.r,
                  //               height: 56.r,
                  //               color: Colors.grey[200],
                  //               child: const Icon(Icons.image_not_supported),
                  //             ),
                  //           ),
                  //         );
                  //       }
                  //
                  //       /// Default avatar:
                  //       return ClipOval(
                  //         child: Image.asset(
                  //           "assets/images/product_search/user.png",
                  //           width: 56.r,
                  //           height: 56.r,
                  //           fit: BoxFit.cover,
                  //         ),
                  //       );
                  //     }),
                  //
                  //     // CircleAvatar(
                  //     //   radius: 24.r,
                  //     //   backgroundColor: Colors.grey.shade200,
                  //     //   child:
                  //     //       (getProfileController
                  //     //               .customerProfile
                  //     //               .value
                  //     //               ?.firstname
                  //     //               ?.isEmpty ??
                  //     //           true)
                  //     //       ? Center(
                  //     //           child: Icon(Icons.person, color: Colors.black),
                  //     //         )
                  //     //       : Center(
                  //     //           child: AppTextWidget(
                  //     //             text:
                  //     //                 (getProfileController
                  //     //                         .customerProfile
                  //     //                         .value
                  //     //                         ?.firstname
                  //     //                         ?.isNotEmpty ??
                  //     //                     false)
                  //     //                 ? getProfileController
                  //     //                       .customerProfile
                  //     //                       .value!
                  //     //                       .firstname![0]
                  //     //                       .toUpperCase()
                  //     //                 : '',
                  //     //             fontSize: 16.sp,
                  //     //             color: Colors.black,
                  //     //           ),
                  //     //         ),
                  //     // ),
                  //   ),
                  // ),
                  Visibility(
                    visible: true,
                    child: GestureDetector(
                      onTap: () {
                        Get.toNamed(profileScreenMain);
                      },
                      child: Obx(() {
                        // 1️⃣ Local picked image
                        if (sessionController.pickedProfileImage.value !=
                            null) {
                          return ClipOval(
                            child: Image.file(
                              sessionController.pickedProfileImage.value!,
                              width: 56.r,
                              height: 56.r,
                              fit: BoxFit.cover,
                            ),
                          );
                        }

                        // 2️⃣ Network image
                        if (getProfileController
                                .customerProfile
                                .value
                                ?.image
                                .isNotEmpty ==
                            true) {
                          return ClipOval(
                            child: CachedNetworkImage(
                              imageUrl:
                                  "${SimpleMethode.imageUrl}/${getProfileController.customerProfile.value!.image}",
                              width: 56.r,
                              height: 56.r,
                              fit: BoxFit.cover,
                              fadeInDuration: const Duration(milliseconds: 200),
                              placeholder: (context, url) => Container(
                                width: 56.r,
                                height: 56.r,
                                alignment: Alignment.center,
                                child: Padding(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 4.0.w,
                                    vertical: 4.h,
                                  ),
                                  child: CircularProgressIndicator(
                                    strokeWidth: 1.w,
                                    color: AppColors.primaryColor,
                                  ),
                                ),
                              ),
                              errorWidget: (context, url, error) {
                                // Fallback to first letter if network fails
                                final firstLetter =
                                    getProfileController
                                            .customerProfile
                                            .value
                                            ?.firstname
                                            .isNotEmpty ==
                                        true
                                    ? getProfileController
                                          .customerProfile
                                          .value!
                                          .firstname[0]
                                          .toUpperCase()
                                    : '?';
                                return CircleAvatar(
                                  radius: 28.r,
                                  backgroundColor: Colors.grey[300],
                                  child: Text(
                                    firstLetter,
                                    style: TextStyle(
                                      fontSize: 20.sp,
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                );
                              },
                            ),
                          );
                        }
                        // 3️⃣ Default avatar with first letter or placeholder icon
                        final firstLetter =
                            getProfileController
                                    .customerProfile
                                    .value
                                    ?.firstname
                                    .isNotEmpty ==
                                true
                            ? getProfileController
                                  .customerProfile
                                  .value!
                                  .firstname[0]
                                  .toUpperCase()
                            : '?';

                        return CircleAvatar(
                          radius: 28.r,
                          backgroundColor: Colors.grey[300],
                          child: Text(
                            firstLetter,
                            style: TextStyle(
                              fontSize: 20.sp,
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      }),
                    ),
                  ),

                  SizedBox(width: 12.w),
                  AppTextWidget(
                    text:
                        "${getProfileController.customerProfile.value?.firstname ?? ""} ${getProfileController.customerProfile.value?.lastname ?? ""}",
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ],
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: () {
                Get.toNamed(settingsScreen);
              },
              child: Icon(Icons.settings, size: 24.sp),
            ),
          ],
        ),
      ),
    );
  }

  /// Without Login
  Widget withoutLogin() {
    return Container(
      child: Column(
        children: [
          SizedBox(height: 10.h),
          AppTextWidget(
            text: "signInForTheBestExperience".tr,
            fontSize: 15.sp,
            fontWeight: FontWeight.w600,
          ),

          SizedBox(height: 10.h),
          ShippingReturnsRow(),
          AppButton(
            width: 300.w,
            height: 38.h,
            onTap: () {
              Get.toNamed(loginScreen);
            },
            textStyle: TextStyle(color: Colors.white),
            borderRadius: 50.r,
            isLoading: false.obs,
            text: "signInRegister".tr,
          ),

          SizedBox(height: 10.h),
        ],
      ),
    );
  }

  /// Coupon and credit section:
  Widget couponsPrice() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 16.h),
      decoration: const BoxDecoration(
        border: Border(
          top: BorderSide(color: Colors.black12),
          bottom: BorderSide(color: Colors.black12),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              children: [
                AppTextWidget(
                  text: AppText.aED06,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
                SizedBox(height: 4.h),
                AppTextWidget(text: AppText.creditBalance, fontSize: 12.sp),
              ],
            ),
          ),
          Container(width: 1.w, height: 30.h, color: Colors.black12),
          Expanded(
            child: Column(
              children: [
                AppTextWidget(
                  text: AppText.nae0,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
                SizedBox(height: 4.h),
                AppTextWidget(text: AppText.couponsOffers, fontSize: 12.sp),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Options and shortcuts:
  Widget listTiles() {
    return Column(
      children: [
        SizedBox(
          height: sessionController.isUserLoginIn.value ? 114.h : 170.h,
          width: MediaQuery.sizeOf(context).width,
          child: ListView(
            physics: NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            children: [
              Visibility(
                visible: !sessionController.isUserLoginIn.value,
                child: ListTile(
                  onTap: () {
                    Get.toNamed(settingsScreen);
                  },
                  leading: const Icon(Icons.settings),
                  title: Text(
                    "setting".tr,
                    style: TextStyle(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                ),
              ),
              Visibility(
                visible: !sessionController.isUserLoginIn.value,
                child: Divider(height: 0.5.h),
              ),
              ListTile(
                onTap: () {
                  if (sessionController.isUserLoginIn.value) {
                    Get.toNamed(trackOrderScreen);
                  } else {
                    AppToast.showInfo(AppText.pleaseLoginForFullFeaturesAccess);
                  }
                },
                leading: const Icon(Icons.list_alt_outlined),
                title: Text(
                  AppText.yourOrders,
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right),
              ),
              Divider(height: 0.5.h),
              ListTile(
                onTap: () {
                  if (sessionController.isUserLoginIn.value) {
                    Get.to(AllAddress());
                  } else {
                    AppToast.showInfo(AppText.pleaseLoginForFullFeaturesAccess);
                  }
                },
                leading: const Icon(Icons.location_on_outlined),
                title: Text(
                  "addresses".tr,
                  style: TextStyle(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                trailing: const Icon(Icons.chevron_right),
              ),
              Divider(height: 0.5.h),
            ],
          ),
        ),

        GestureDetector(
          onTap: () => OfferBottomSheet.show(context),
          child: Container(
            width: MediaQuery.sizeOf(context).width,
            padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
            color: Colors.orange.shade50,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: [
                  Icon(Icons.check, color: Colors.green, size: 18.sp),
                  SizedBox(width: 6.w),
                  Text(
                    AppText.freeShipping,
                    style: TextStyle(fontSize: 10.sp, color: Colors.green),
                  ),
                  SizedBox(width: 12.w),
                  Icon(Icons.check, color: Colors.green, size: 18.sp),
                  SizedBox(width: 6.w),
                  Text(
                    AppText.payWhenYouReceiveYourOrder,
                    style: TextStyle(fontSize: 10.sp, color: Colors.green),
                  ),
                  15.w.sw,
                  Icon(
                    Icons.arrow_forward_ios,
                    size: 12.sp,
                    color: Colors.green,
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  bool get wantKeepAlive => true;
}

class ShippingReturnsRow extends StatelessWidget {
  const ShippingReturnsRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 20.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          /// Free Shipping
          Column(
            children: [
              Container(
                height: 50.h,
                width: 50.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.local_shipping,
                  color: AppColors.primaryColor,
                  size: 28.sp,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'freeShipping'.tr,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
              ),
              SizedBox(height: 2.h),
              Text(
                'onLimitedOrders'.tr,
                style: TextStyle(fontSize: 12.sp, color: Colors.grey.shade600),
              ),
            ],
          ),

          // Free Returns
          Column(
            children: [
              Container(
                height: 50.h,
                width: 50.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.assignment_return,
                  color: AppColors.primaryColor,
                  size: 28.sp,
                ),
              ),
              SizedBox(height: 8.h),
              Text(
                'easyReturns'.tr,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
              ),
              SizedBox(height: 2.h),
              Text(
                'upToDays'.tr,
                style: TextStyle(fontSize: 12.sp, color: Colors.grey.shade600),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
