import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../screens/home_screens/address_screens/add_new_address.dart';

class OrderDetailsDialog extends StatelessWidget {
  OrderDetailsDialog({super.key});
  AddressController controller = Get.put(AddressController());
  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      insetPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.w),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
      child: Container(
        width: double.maxFinite,
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Address Section:
            _buildAddressSection(context),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextWidget(
          text: 'changeAddress'.tr,
          fontSize: 15.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black87,
        ),
        SizedBox(height: 8.h),
        Container(
          width: MediaQuery.sizeOf(context).width * 0.9,
          padding: EdgeInsets.symmetric(horizontal: 15.w, vertical: 15.h),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 8.h),
              AppTextWidget(
                text:
                    controller.defaultAddress.value?.firstname.toString() ?? "",
                fontSize: 13.sp,
                color: Colors.black87,
              ),
              SizedBox(height: 10.h),
              Visibility(
                visible:
                    controller.defaultAddress.value?.address2 != null &&
                    controller.defaultAddress.value!.address2.isNotEmpty,
                child: AppTextWidget(
                  text: controller.defaultAddress.value?.address2 ?? "",
                  //'asds,- d',
                  fontSize: 13.sp,
                  color: Colors.black87,
                ),
              ),
              SizedBox(height: 8.h),
              Visibility(
                visible:
                    controller.defaultAddress.value?.address1 != null &&
                    controller.defaultAddress.value!.address1.isNotEmpty,

                child: AppTextWidget(
                  text: controller.defaultAddress.value?.address1 ?? "",
                  fontSize: 13.sp,
                  color: Colors.black87,
                ),
              ),
              SizedBox(height: 8.h),
              AppTextWidget(
                text: controller.defaultAddress.value?.country.toString() ?? "",
                fontSize: 13.sp,
                color: Colors.black87,
              ),
              SizedBox(height: 30.h),
              AppButton(
                width: 130.w,
                height: 38.h,
                onTap: () {
                  controller.nameController.value.text =
                      controller.defaultAddress.value?.firstname ?? "";
                  controller.addressControllerField.value.text =
                      controller.defaultAddress.value?.address1 ?? "";
                  Get.back();
                  Navigator.pop(context);
                  Get.to(
                    AddNewAddress(
                      id:
                          controller.defaultAddress.value?.countryId
                              .toString() ??
                          "0",
                      isEdit: true,
                    ),
                  );
                },
                textStyle: TextStyle(
                  color: Colors.white,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.bold,
                ),
                borderRadius: 30.r,
                isLoading: false.obs,
                text: "editAddress".tr,
              ),
              SizedBox(height: 10.h),
            ],
          ),
        ),
        SizedBox(height: 20.h),
        GestureDetector(
          onTap: () {
            Navigator.pop(context);
          },
          child: Align(
            alignment: Alignment.bottomRight,
            child: Container(
              height: 38.h,
              width: 80.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(50.r),
                border: Border.all(
                  color: Colors.black.withOpacity(0.8),
                  width: 1.5.w,
                ),
              ),
              child: Center(
                child: AppTextWidget(
                  text: "close".tr,
                  fontSize: 12.sp,
                  color: Colors.black.withOpacity(0.5),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: 5.h),
      ],
    );
  }
}
