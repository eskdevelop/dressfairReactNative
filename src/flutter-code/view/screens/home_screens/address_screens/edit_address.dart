import 'package:dress_fair_ecommmerce/controller/address_controller/address_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/get_area_city/get_area_city.dart';
import 'package:dress_fair_ecommmerce/model/get_zone_model/get_zone_model.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../util/widgets/reuseable_textfield/reuseable_textfield.dart';

class EditAddress extends StatefulWidget {
  String id;
  bool isEdit;
  String fullName;
  String mobileNo;
  String province;
  String area;
  String address;
  EditAddress({
    super.key,
    required this.id,
    required this.isEdit,
    required this.fullName,
    required this.mobileNo,
    required this.province,
    required this.area,
    required this.address,
  });
  @override
  State<EditAddress> createState() => _EditAddressState();
}

class _EditAddressState extends State<EditAddress> {
  SessionController sessionController = Get.find<SessionController>();
  AddressController addressController = Get.put(AddressController());
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      addressController.nameController.value.clear();
      addressController.addressControllerField.value.clear();
      addressController.phoneController.value.clear();
      if (addressController.cities.isEmpty) {
        await addressController.getCities();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: Padding(
          padding: EdgeInsets.only(right: 50.0.w),
          child: Column(
            children: [
              AppTextWidget(
                text: AppText.addAddress,
                color: AppColors.blackColor,
                fontWeight: FontWeight.w500,
                fontSize: 16.sp,
              ),
              5.h.sh,
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: EdgeInsets.only(bottom: 4.0.h),
                      child: SvgPicture.asset(
                        color: AppColors.greenColor,
                        height: 12.h,
                        AppImages.lockIcon,
                      ),
                    ),
                    5.w.sw,
                    AppTextWidget(
                      text: "safeguard".tr,
                      color: AppColors.greenColor,
                      fontWeight: FontWeight.normal,
                      fontSize: 10.sp,
                    ),
                  ],
                ),
              ),
            ],
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
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Info Banner:
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 6.h),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(6.r),
              ),
              child: Row(
                children: [
                  Icon(Icons.lock, color: Colors.green, size: 16.sp),
                  SizedBox(width: 6.w),
                  Expanded(
                    child: Text(
                      "allDataIsSafeguard".tr,
                      style: TextStyle(color: Colors.green, fontSize: 12.sp),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 8.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 8.h),
              color: Colors.orange.shade50,
              child: Row(
                children: [
                  Icon(Icons.check, color: Colors.green, size: 14.sp),
                  SizedBox(width: 4.w),
                  AppTextWidget(
                    text: "freeShippingOverShopping150AED".tr,
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w400,
                  ),
                ],
              ),
            ),
            SizedBox(height: 20.h),
            // Country:
            Text("countryRegion".tr, style: labelStyle),
            SizedBox(height: 16.h),
            // Full Name:
            Text("Full Name".tr, style: labelStyle),
            SizedBox(height: 2.h),

            // Container(
            //
            //   child: TextField(
            //
            //     controller: addressController.nameController.value,
            //     decoration: inputDecoration(AppText.enterYourFullName),
            //   ),
            // ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 0.0.w),
              child: ValidatedTextField(
                controller: addressController.nameController.value,
                labelText: 'First Name',
                hintText: 'First Name',
                emptyErrorText: 'Required First name',
              ),
            ),
            SizedBox(height: 8.h),

            Text("phoneNumber".tr, style: labelStyle),
            SizedBox(height: 3.h),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 0.0.w),
              child: Row(
                children: [
                  // Country code box:
                  Container(
                    height: 47.h,
                    width: 50.w,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.black.withOpacity(0.6),
                        width: 1.w,
                      ),
                      borderRadius: BorderRadius.circular(6.r),
                    ),
                    child: Center(
                      child: Text(
                        sessionController.countryConfig.value?.mobileCode ??
                            "971",
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                  // WhatsApp number input:
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(left: 5.w),
                      child: ValidatedTextField(
                        controller: addressController.phoneController.value,
                        labelText: 'Mobile No',
                        hintText: 'Mobile No',
                        emptyErrorText: 'Required Mobile No',
                      ),
                    ),
                  ),

                  // Expanded(
                  //   child: TextField(
                  //     controller: registerController.mobileController.value,
                  //     keyboardType: TextInputType.phone,
                  //     maxLength: 15,
                  //
                  //     // sessionController
                  //     //     .countryConfig
                  //     //     .value
                  //     //     ?.mobileLength ??
                  //     // 10,
                  //     decoration: InputDecoration(
                  //       hintText: "Enter WhatsApp Number",
                  //       counterText: '',
                  //       contentPadding: EdgeInsets.symmetric(
                  //         horizontal: 12.w,
                  //         vertical: 10.h,
                  //       ),
                  //       hintStyle: TextStyle(
                  //         color: Colors.black.withOpacity(0.3),
                  //         fontSize: 14.sp,
                  //       ),
                  //       border: OutlineInputBorder(
                  //         borderRadius: BorderRadius.circular(6.r),
                  //         borderSide: BorderSide(
                  //           color: Colors.black.withOpacity(0.6),
                  //           width: 1.w,
                  //         ),
                  //       ),
                  //       focusedBorder: OutlineInputBorder(
                  //         borderRadius: BorderRadius.circular(6.r),
                  //         borderSide: BorderSide(
                  //           color: AppColors.primaryColor,
                  //           width: 1.w,
                  //         ),
                  //       ),
                  //     ),
                  //     inputFormatters: [
                  //       FilteringTextInputFormatter
                  //           .digitsOnly, // only numbers
                  //     ],
                  //   ),
                  // ),
                ],
              ),
            ),

            // Phone Number:
            // Text("phoneNumber".tr, style: labelStyle),
            // SizedBox(height: 6.h),
            //
            // Row(
            //   children: [
            //     Container(
            //       padding: EdgeInsets.symmetric(
            //         horizontal: 12.w,
            //         vertical: 14.h,
            //       ),
            //       decoration: boxDecoration,
            //       child: Text(
            //         sessionController.countryConfig.value?.mobileCode ?? '',
            //       ),
            //     ),
            //     SizedBox(width: 8.w),
            //     Expanded(
            //       child: TextField(
            //         controller: addressController.phoneController.value,
            //         keyboardType: TextInputType.phone,
            //         maxLength:
            //             sessionController.countryConfig.value?.mobileLength ??
            //             10,
            //         inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            //         decoration: inputDecoration(
            //           AppText.enterMobileNumber,
            //         ).copyWith(counterText: ""),
            //       ),
            //     ),
            //   ],
            // ),
            SizedBox(height: 8.h),
            Text("province".tr, style: labelStyle),
            SizedBox(height: 3.h),

            // Province Dropdown
            Obx(() {
              if (addressController.isLoading.value) {
                return
                //SizedBox();
                const Center(child: CircularProgressIndicator());
              }
              if (addressController.cities.isEmpty) {
                return Text(AppText.noCitiesAvailable);
              }
              return DropdownButtonFormField<CityModel>(
                decoration: _dropdownDecoration(AppText.selectProvince),
                value: addressController.selectedCity.value,
                style: TextStyle(
                  // 👇 makes selected text normal instead of bold
                  fontWeight: FontWeight.normal,
                  fontSize: 14.sp,
                  color: Colors.black,
                ),
                hint: Text("selectProvince".tr),
                items: addressController.cities.map((city) {
                  return DropdownMenuItem(
                    value: city,
                    child: Text(city.name ?? ""),
                  );
                }).toList(),
                onChanged: (value) async {
                  if (value != null) {
                    addressController.selectedCity.value = value;
                    await addressController.getAreas(id: value.id.toString());
                  }
                },
              );
            }),

            SizedBox(height: 8.h),

            // City Label
            Obx(() {
              return Visibility(
                visible: addressController.area.isNotEmpty,
                child: Text(AppText.city, style: labelStyle),
              );
            }),
            Obx(() {
              return Visibility(
                visible: addressController.area.isNotEmpty,
                child: SizedBox(height: 3.h),
              );
            }),

            // City / Area Dropdown:
            Obx(() {
              return Visibility(
                visible: addressController.area.isNotEmpty,
                child: DropdownButtonFormField<AreaModel>(
                  isExpanded: true,
                  decoration: _dropdownDecoration("selectCityOrArea".tr),
                  value: addressController.selectedArea.value,
                  style: TextStyle(
                    fontWeight: FontWeight.normal,
                    fontSize: 14.sp,
                    color: Colors.black,
                  ),
                  hint: Text("selectCityOrArea".tr),
                  items: addressController.area.map((a) {
                    return DropdownMenuItem(
                      value: a,
                      child: Text(a.name ?? ""),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      addressController.selectedArea.value = value;
                    }
                  },
                ),
              );
            }),

            SizedBox(height: 8.h),

            // Street Address
            Text("buildStreetAndArea".tr, style: labelStyle),
            SizedBox(height: 6.h),
            TextField(
              controller: addressController.addressControllerField.value,
              maxLines: 2,
              decoration: inputDecoration("enterFullAddress".tr),
            ),

            SizedBox(height: 20.h),

            AppButton(
              width: MediaQuery.sizeOf(context).width,
              height: 50.h,
              onTap: () async {
                String errorMsg = "";
                if (addressController.nameController.value.text
                    .trim()
                    .isEmpty) {
                  errorMsg = AppText.fullNameIsRequired;
                } else if (addressController.phoneController.value.text
                    .trim()
                    .isEmpty) {
                  errorMsg = AppText.phoneNoIsRequired;
                } else if (addressController.selectedCity.value == null) {
                  errorMsg = AppText.pleaseSelectAProvince;
                } else if (addressController.area.isNotEmpty &&
                    addressController.selectedArea.value == null) {
                  errorMsg = AppText.pleaseSelectACityArea;
                } else if (addressController.addressControllerField.value.text
                    .trim()
                    .isEmpty) {
                  errorMsg = AppText.addressIsRequired;
                }

                if (errorMsg.isNotEmpty) {
                  AppToast.showError(errorMsg);
                  return;
                }
                await addressController.saveAddress(context);
              },
              textStyle: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w500,
              ),
              borderRadius: 25.r,
              isLoading: addressController.isLoadingButton,
              text: "saveAndUse".tr,
            ),
          ],
        ),
      ),
    );
  }

  // Styles
  final labelStyle = TextStyle(fontWeight: FontWeight.w400, fontSize: 10.sp);

  final boxDecoration = BoxDecoration(
    border: Border.all(color: Colors.grey.shade400),
    borderRadius: BorderRadius.circular(6.r),
  );

  InputDecoration inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(
        fontSize: 14.sp,
        color: AppColors.blackColor.withOpacity(0.5),
      ),
      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 14.h),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6.r),
        borderSide: BorderSide(color: Colors.grey.shade400),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6.r),
        borderSide: BorderSide(color: Colors.grey.shade400),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(6.r),
        borderSide: BorderSide(color: AppColors.greenColor, width: 1.5),
      ),
    );
  }

  InputDecoration _dropdownDecoration(String label) {
    return InputDecoration(
      //labelText: label,
      //labelStyle: const TextStyle(color: Colors.grey),
      contentPadding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.r),
        borderSide: const BorderSide(
          color: Colors.grey,
          width: 1,
        ), // thin border
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8.r),
        borderSide: const BorderSide(
          color: Colors.green,
          width: 1.2,
        ), // green on focus
      ),
    );
  }
}
