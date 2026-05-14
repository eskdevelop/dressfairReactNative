import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../util/widgets/dialog/delete_dialog.dart';

class AllAddress extends StatefulWidget {
  const AllAddress({super.key});

  @override
  State<AllAddress> createState() => _AllAddressState();
}

class _AllAddressState extends State<AllAddress> {
  AddressController addressController = Get.put(AddressController());
  GetProfileController getProfileController = Get.find<GetProfileController>();
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final controller = getProfileController;
      await controller.getCustomerProfile(false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        title: Text(
          "allAddress".tr,
          style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500),
        ),
      ),
      body: Container(
        color: Colors.white70,
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 12.h),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Obx(() {
              if (getProfileController.isLoading.value) {
                return Center(
                  child: Padding(
                    padding: EdgeInsets.only(
                      top: MediaQuery.sizeOf(context).height * 0.35,
                    ),
                    child: SpinKitCircle(
                      color: AppColors.primaryColor,
                      size: 50.0.sp,
                    ),
                  ),
                );
              }

              return Expanded(
                child: ListView.builder(
                  cacheExtent: 3000,
                  shrinkWrap: true,
                  itemCount:
                      getProfileController
                          .customerProfile
                          .value
                          ?.addresses
                          .length ??
                      0,
                  itemBuilder: (context, index) {
                    var item = getProfileController
                        .customerProfile
                        .value
                        ?.addresses[index];
                    return Padding(
                      padding: EdgeInsets.symmetric(
                        vertical: 2.h,
                        horizontal: 10.w,
                      ),
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4.r),
                          boxShadow: AppShadows.glowBoxDim,
                        ),
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: 8.0.w,
                            vertical: 4.h,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(height: 3.h),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  AppTextWidget(
                                    text: item?.address ?? "",
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.w600,
                                  ),

                                  item?.isDefault == 1
                                      ? Icon(Icons.check, color: Colors.orange)
                                      : SizedBox(),
                                ],
                              ),
                              SizedBox(height: 4.h),
                              AppTextWidget(
                                text: item?.city?.name ?? "",
                                fontSize: 13.sp,
                                fontWeight: FontWeight.normal,
                                color: Colors.black,
                              ),
                              SizedBox(height: 3.h),
                              AppTextWidget(
                                text: item?.area?.name ?? "",
                                fontSize: 12.sp,
                                fontWeight: FontWeight.normal,
                                color: Colors.black,
                              ),
                              SizedBox(height: 4.h),
                              Divider(thickness: 0.5),
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      // Only call if not already default
                                      if (item?.isDefault != 1) {
                                        final addressController =
                                            Get.find<AddressController>();

                                        addressController.makeDefaultAddress(
                                          id: item?.id.toString() ?? "-1",
                                          context: context,
                                        );
                                      }
                                    },
                                    child: Icon(
                                      item?.isDefault == 1
                                          ? Icons.radio_button_checked
                                          : Icons.radio_button_off,
                                      color: item?.isDefault == 1
                                          ? Colors.orange
                                          : Colors.grey,
                                      size: 18.sp,
                                    ),
                                  ),
                                  SizedBox(width: 6.w),
                                  AppTextWidget(
                                    text: item?.isDefault == 1
                                        ? "default".tr
                                        : "setAsDefault".tr,
                                    fontSize: 12.sp,
                                    fontWeight: FontWeight.w400,
                                    color: Colors.black.withOpacity(0.5),
                                  ),
                                  Spacer(),
                                  TextButton(
                                    onPressed: () async {
                                      showDeleteAddressDialog(
                                        context: context,
                                        onDelete: () async {
                                          await addressController.deleteAddress(
                                            id: item?.id.toString() ?? "",
                                            context: context,
                                          );
                                          Get.back();
                                        },
                                      );
                                    },
                                    child: AppTextWidget(
                                      text: "delete".tr,
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.black.withOpacity(0.5),
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () async {
                                      addressController
                                              .addressControllerField
                                              .value
                                              .text =
                                          item?.address ?? "";

                                      addressController.selectedCity.value =
                                          addressController.cities
                                              .firstWhereOrNull(
                                                (c) => c.id == item?.city?.id,
                                              );

                                      // LOAD AREAS FIRST
                                      if (addressController
                                              .selectedCity
                                              .value !=
                                          null) {
                                        await addressController.getAreas(
                                          id: addressController
                                              .selectedCity
                                              .value!
                                              .id
                                              .toString(),
                                        );
                                      }

                                      // SET AREA
                                      addressController.selectedArea.value =
                                          addressController.area
                                              .firstWhereOrNull(
                                                (a) => a.id == item?.area?.id,
                                              );

                                      Get.toNamed(
                                        addNewAddress,
                                        arguments: {
                                          'id': item?.id.toString() ?? "",
                                          'isEdit': true,
                                        },
                                      );
                                    },
                                    child: AppTextWidget(
                                      text: "edit".tr,
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.black.withOpacity(0.5),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              );
            }),
            SizedBox(height: 6.h),
            // Add new address button:
            Obx(
              () => Visibility(
                visible: !getProfileController.isLoading.value,
                child: AppButton(
                  width: MediaQuery.sizeOf(context).width,
                  height: 50.h,
                  onTap: () {
                    Get.toNamed(
                      addNewAddress,
                      arguments: {'id': "", 'isEdit': false},
                    );
                  },
                  textStyle: TextStyle(color: Colors.white),
                  borderRadius: 30.r,
                  isLoading: false.obs,
                  text: "addNewAddress".tr,
                ),
              ),
            ),

            SizedBox(height: 10.h),
          ],
        ),
      ),
    );
  }
}
