import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/order_sumary.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/order_sumary_checkout_bottom_sheet.dart';

import '../../../../../../controller/add_to_card_hive_controller/add_to_cart_hive_controller.dart';
import '../../../../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../../../util/widgets/dialog/address_required_dialog.dart';
import '../../../../../util/widgets/dialog/login_first_dialog.dart';
import '../../../../../util/widgets/dialog/profile_copletion_required.dart';

class CheckOutScreen extends StatefulWidget {
  List<Map<String, dynamic>> cartItem;
  CheckOutScreen({super.key, required this.cartItem});

  @override
  State<CheckOutScreen> createState() => _CheckOutScreenState();
}

class _CheckOutScreenState extends State<CheckOutScreen> {
  AddressController addressController = Get.put(AddressController());
  SessionController sessionController = Get.find<SessionController>();
  SubmitOrderController submitOrderController = Get.put(
    SubmitOrderController(),
  );
  GetProfileController getProfileController = Get.find<GetProfileController>();
  AddToCartController addToCartController = Get.find<AddToCartController>();

  Map<String, dynamic> buildPlaceOrderBody() {
    final address = getProfileController.hasDefaultAddress.value;

    final double shippingCharges = addToCartController.checkShipping(
      addToCartController.selectedTotalPrice,
    );

    final double totalPrice =
        addToCartController.selectedTotalPrice + shippingCharges;

    /// Build products array:
    final products = addToCartController.cartItems
        .where((item) => item['isSelected'] == true)
        .map((item) {
          log("Product Sku == ${item['sku'] ?? ""}");
          return {
            "product_id": item['productId'],
            "product_option_id": item['optionId'] ?? 0,
            "product_option_label": item['size'] ?? "",
            "product_option_color": item['color'] ?? "",
            "product_name": item['name'],
            "product_quantity": item['quantity'],
            "product_sku": item['sku'] ?? "",
            "product_price": item['price'],
          };
        })
        .toList();

    return {
      "customer_name":
          "${getProfileController.customerProfile.value?.firstname ?? ""} ${getProfileController.customerProfile.value?.lastname ?? ""}",
      "customer_email":
          getProfileController.customerProfile.value?.email ?? "", // optional
      "customer_mobile":
          getProfileController.customerProfile.value?.mobile ?? "",
      "customer_city_id": address?.cityId ?? "",
      "customer_area_id": address?.cityAreaId ?? "",
      "customer_city_name": address?.city?.name ?? "",
      "customer_area_name": address?.area?.name ?? "",
      "customer_address": address?.address ?? "",
      "products": products,
      "shipping_charges": shippingCharges,
      "source": "theme5",
      "total_price": totalPrice,
    };
  }

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) async {});
  }

  String selectedMethod = "cod";
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      bottomNavigationBar: Obx(
        () =>
            addToCartController.cartItems.isNotEmpty &&
                addToCartController.cartItems.isNotEmpty
            ? bottomNavWidget()
            : SizedBox(),
      ),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        centerTitle: true,
        title: Obx(
          () => AppTextWidget(
            text:
                "${AppText.checkOut} (${addToCartController.cartItems.length ?? 0})",
          ),
        ),
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Icon(
              Icons.arrow_back_ios_new,
              color: Colors.black.withOpacity(0.6),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        physics: BouncingScrollPhysics(),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            staticSlider(context),
            2.h.sh,
            addressSection(context),
            4.h.sh,
            itemDetail(),
            2.h.sh,
            allItems(context),
            2.h.sh,

            /// Dotted line at bottom:
            Visibility(
              visible: addToCartController.cartItems.isNotEmpty,
              child: dottedLine(),
            ),
            paymentMethode(),
            dividers(),
            8.h.sh,
            OrderSummaryWidget(),
            2.h.sh,
            dividers(),
            4.h.sh,
            Padding(
              padding: EdgeInsets.only(
                right: sessionController.selectedLanguageCode == "ar"
                    ? 10.0.w
                    : 0.w,
              ),
              child: shippingFee(),
            ),
            8.h.sh,
            dividers(),
            8.h.sh,
            deliveryQuarantee(
              icon: Icons.local_shipping,
              title: "deliveryGuarantee".tr,
              subtitle: "",
              context: context,
            ),
            dividers(),
            8.h.sh,
            securePayment(
              icon: Icons.lock,
              title: AppText.securePrivacy,
              subtitle: "protectingYourPrivacyIsImportant".tr,
            ),
            dividers(),
            8.h.sh,
            termAndProtection(
              icon: Icons.shopping_cart,
              title: "dressFairPurchaseProtection".tr,
              subtitle: "shopConfidentlyOnDressFair".tr,
            ),
          ],
        ),
      ),
    );
  }

  Widget paymentMethode() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.0.w),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          5.h.sh,
          AppTextWidget(
            text: AppText.paymentMethod,
            fontWeight: FontWeight.w600,
            fontSize: 12.sp,
          ),

          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Radio<String>(
                value: "cod",
                groupValue: selectedMethod,
                activeColor: AppColors.primaryColor,
                onChanged: (value) {
                  setState(() {
                    selectedMethod = value!;
                  });
                },
              ),
              SizedBox(width: 4.w),
              // Text
              AppTextWidget(
                text: AppText.cashOnDelivery,
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
              ),
            ],
          ),
        ],
      ),
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
                              addToCartController
                                  .isShowCheckoutBottomSheet
                                  .value = !addToCartController
                                  .isShowCheckoutBottomSheet
                                  .value;
                              showModalBottomSheet(
                                context: context,
                                isScrollControlled: true,
                                backgroundColor: Colors.transparent,
                                builder: (_) =>
                                    PriceDetailsCheckoutBottomSheet(),
                              );
                            },
                            child: Padding(
                              padding: EdgeInsets.only(top: 2.0.h),
                              child: Icon(
                                addToCartController
                                        .isShowCheckoutBottomSheet
                                        .value
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
                    if (sessionController.isUserLoginIn.value) {
                      log("User is Loged In == ");

                      if (getProfileController.hasDefaultAddress.value !=
                          null) {
                        log("User Has  Default Address == ");
                        final profile =
                            getProfileController.customerProfile.value;
                        if ((profile?.firstname.isEmpty ?? true) ||
                            (profile?.lastname.isEmpty ?? true) ||
                            (profile?.email.isEmpty ?? true) ||
                            (profile?.mobile.isEmpty ?? true)) {
                          log("User Profile Has Not Completed == ");
                          showCompleteProfileRequiredDialog(context);
                          AppToast.showError("Please Complete Your Profile");
                        } else {
                          log("User Profile Has  Completed == ");
                          log("User Address Has  Completed == ");
                          log("User  Has  Login In == ");
                          final body = buildPlaceOrderBody();
                          submitOrderController.confirmOrderPostReq(body: body);
                        }
                      } else {
                        if (getProfileController.hasDefaultAddress.value ==
                            null) {
                          log("User Has Not  Default Address == ");
                          showAddAddressRequiredDialog(context);
                          AppToast.showError("Please Add Address");
                        }
                      }
                    } else {
                      log("User is Not Loged In == ");
                      if (!sessionController.isUserLoginIn.value) {
                        showLoginRequiredDialog(context);
                        AppToast.showError("Please Login First");
                      }
                    }

                    // if (sessionController.isUserLoginIn.value) {
                    //   final body = buildPlaceOrderBody();
                    //   submitOrderController.confirmOrderPostReq(body: body);
                    // } else {
                    //   showLoginRequiredDialog(context);
                    //   AppToast.showError("Please Login First");
                    // }
                  },
                  textStyle: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                  borderRadius: 40.r,
                  isLoading: submitOrderController.isLoading,
                  text: AppText.submitOrder,
                ),
              ),
            ],
          ),
        ),
      );
    });
  }
}
