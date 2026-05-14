import 'package:dress_fair_ecommmerce/controller/address_controller/address_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/address_bottom_sheet.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/customer_profile/customer_profile_controller.dart';
import 'dotted_lines.dart';

Widget addressSection(BuildContext context) {
  AddressController addressController = Get.put(AddressController());
  GetProfileController getProfileController = Get.put(GetProfileController());
  SessionController sessionController = Get.find<SessionController>();

  return Obx(() {
    getProfileController.updateDefaultFlag();
    if (getProfileController.hasDefault.value == false) {
      return !sessionController.isUserLoginIn.value
          ? SizedBox()
          : Padding(
              padding: EdgeInsets.only(top: 8.0.h, bottom: 0.h),
              child: SizedBox(
                width: MediaQuery.sizeOf(context).width,
                child: Column(
                  children: [
                    SvgPicture.asset(
                      height: 40.h,
                      AppImages.locationIcon,
                      color: Colors.grey,
                    ),
                    10.h.sh,
                    AppTextWidget(
                      text: "YouDontHaveAnyDefaultAddressesAdded".tr,
                      fontWeight: FontWeight.w400,
                      fontSize: 12.sp,
                      color: Colors.black.withOpacity(0.5),
                    ),
                    10.h.sh,
                    AppButton(
                      width: 200.w,
                      height: 40.h,
                      onTap: () {
                        Get.toNamed(
                          addNewAddress,
                          arguments: {'id': "0", 'isEdit': false},
                        );
                      },
                      textStyle: TextStyle(color: Colors.white),
                      borderRadius: 50.r,
                      isLoading: false.obs,
                      text: "addDefaultAddress".tr,
                    ),
                    15.h.sh,
                  ],
                ),
              ),
            );
    }

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
          ),
          builder: (context) {
            return AddressBottomSheet();
          },
        );
      },
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12.0.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top dotted line
            Padding(
              padding: EdgeInsets.symmetric(vertical: 4.h),
              child: dottedLine(),
            ),

            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                10.w.sw,
                Icon(
                  Icons.maps_home_work_sharp,
                  size: 20.sp,
                  color: Colors.grey,
                ),
                10.w.sw,
                Expanded(
                  child: AppTextWidget(
                    text:
                        getProfileController.hasDefaultAddress.value?.address ??
                        "",
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            2.h.sh,
            Padding(
              padding: EdgeInsets.only(left: 32.0.w),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Container(
                      // color: Colors.red.withOpacity(0.2),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              AppTextWidget(
                                text:
                                    getProfileController
                                        .hasDefaultAddress
                                        .value
                                        ?.city
                                        ?.name ??
                                    "",
                                fontSize: 12.sp,
                                color: Colors.red,
                                fontWeight: FontWeight.w400,
                              ),
                              SizedBox(width: 6.w),
                              Expanded(
                                child: AppTextWidget(
                                  text:
                                      getProfileController
                                          .hasDefaultAddress
                                          .value
                                          ?.area
                                          ?.name ??
                                      "",
                                  fontSize: 12.sp,
                                  color: Colors.red,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Arrow icon on right, vertically centered
                  //  Icon(Icons.arrow_forward_ios, size: 16.sp),
                ],
              ),
            ),

            ///
            Padding(
              padding: EdgeInsets.symmetric(vertical: 2.h),
              child: dottedLine(),
            ),
          ],
        ),
      ),
    );
  });
}
