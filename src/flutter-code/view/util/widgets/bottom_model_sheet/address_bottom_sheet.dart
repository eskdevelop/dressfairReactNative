import 'package:dress_fair_ecommmerce/controller/address_controller/address_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shadows_reuse/AppShadows.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';
import '../dialog/delete_dialog.dart';

class AddressBottomSheet extends StatefulWidget {
  const AddressBottomSheet({super.key});

  @override
  State<AddressBottomSheet> createState() => _AddressBottomSheetState();
}

class _AddressBottomSheetState extends State<AddressBottomSheet> {
  AddressController addressController = Get.put(AddressController());
  GetProfileController getProfileController = Get.find<GetProfileController>();
  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final controller = getProfileController;

      // if (controller.customerProfile.value == null
      // // &&
      // // !controller.isLoading.value
      // ) {
      await controller.getCustomerProfile(false);
      //  }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Container(
        color: Colors.white70,
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 12.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AppTextWidget(
                  text: "addresses".tr,
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),

                SizedBox(width: MediaQuery.sizeOf(context).width * 0.21),
                Align(
                  alignment: Alignment.centerRight,
                  child: IconButton(
                    icon: Icon(Icons.close),
                    onPressed: () => Get.back(),
                  ),
                ),
              ],
            ),
            // SizedBox(height: 8.h),
            Divider(thickness: 0.5),
            // Address list
            // getProfileController.customerProfile.value..value
            //     ? Container(
            //         height: addressController.allAddress.length == 1
            //             ? MediaQuery.sizeOf(context).height * 0.24
            //             : addressController.allAddress.length == 2
            //             ? MediaQuery.sizeOf(context).height * 0.45
            //             : MediaQuery.sizeOf(context).height * 0.7,
            //         child: Center(
            //           child: CircularProgressIndicator(
            //             color: AppColors.primaryColor,
            //           ),
            //         ),
            //       )
            //     :
            SizedBox(
              //color: Colors.red,
              height: MediaQuery.sizeOf(context).height * 0.45,
              // height: addressController.allAddress.length == 1
              //     ? MediaQuery.sizeOf(context).height * 0.24
              //     : addressController.allAddress.length == 2
              //     ? MediaQuery.sizeOf(context).height * 0.45
              //     : MediaQuery.sizeOf(context).height * 0.7,
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
                    padding: EdgeInsets.symmetric(vertical: 8.h),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: AppShadows.glowBoxDim,
                      ),
                      child: Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 6.0.w,
                          vertical: 8.h,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Name and phone
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                AppTextWidget(
                                  text: item?.address ?? "",
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.w600,
                                ),

                                // SizedBox(width: 10.w),
                                // AppTextWidget(
                                //   text: "",
                                //   //text: "+92 330 9189520",
                                //   fontSize: 13.sp,
                                //   fontWeight: FontWeight.normal,
                                //   color: Colors.black.withOpacity(0.6),
                                // ),
                                // Spacer(),
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
                            SizedBox(height: 8.h),
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
                                  onPressed: () {
                                    // addressController
                                    //         .nameController
                                    //         .value
                                    //         .text =
                                    //     item.address;
                                    // addressController
                                    //         .addressControllerField
                                    //         .value
                                    //         .text =
                                    //     item.address1;
                                    Get.back();
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
            ),
            SizedBox(height: 10.h),
            // Add new address button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24.r),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                ),
                onPressed: () {
                  Get.back();
                  Get.toNamed(
                    addNewAddress,
                    arguments: {'id': "", 'isEdit': false},
                  );
                },
                child: Text(
                  "addANewAddress".tr,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
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
