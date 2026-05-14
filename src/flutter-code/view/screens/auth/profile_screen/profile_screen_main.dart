import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../../controller/simple_method/simple_methode.dart';

class ProfileScreenMain extends StatelessWidget {
  ProfileScreenMain({super.key});
  GetProfileController getProfileController = Get.put(GetProfileController());
  SessionController sessionController = Get.put(SessionController());
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      /// AppBar
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: GestureDetector(
          onTap: () {
            Get.back();
          },
          child: Icon(
            Icons.arrow_back_ios_new,
            color: Colors.black,
            size: 18.sp,
          ),
        ),
        centerTitle: true,
        title: Text(
          "profile".tr,
          style: TextStyle(
            color: Colors.black,
            fontSize: 17.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.0.w),
        child: Column(
          children: [
            /// Top Profile Section:
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              child: Row(
                children: [
                  /// Profile Image + Edit Icon:
                  // Obx(() {
                  //   if (sessionController.pickedProfileImage.value != null) {
                  //     return ClipOval(
                  //       child: Image.file(
                  //         sessionController.pickedProfileImage.value!,
                  //         width: 66.r,
                  //         height: 66.r,
                  //         fit: BoxFit.cover,
                  //       ),
                  //     );
                  //   }
                  //
                  //   /// Network image:
                  //   if (getProfileController
                  //           .customerProfile
                  //           .value
                  //           ?.image
                  //           .isNotEmpty ==
                  //       true) {
                  //     return ClipOval(
                  //       child: CachedNetworkImage(
                  //         imageUrl:
                  //             "${SimpleMethode.imageUrl}/${getProfileController.customerProfile.value!.image}",
                  //         width: 66.r,
                  //         height: 66.r,
                  //         fit: BoxFit.cover,
                  //         fadeInDuration: const Duration(milliseconds: 200),
                  //         placeholder: (context, url) => Container(
                  //           width: 66.r,
                  //           height: 66.r,
                  //           alignment: Alignment.center,
                  //           child: const CircularProgressIndicator(
                  //             strokeWidth: 2,
                  //           ),
                  //         ),
                  //         errorWidget: (context, url, error) => Container(
                  //           width: 66.r,
                  //           height: 66.r,
                  //           color: Colors.grey[200],
                  //           child: const Icon(Icons.image_not_supported),
                  //         ),
                  //       ),
                  //     );
                  //   }
                  //
                  //   // Default avatar
                  //   return ClipOval(
                  //     child: Image.asset(
                  //       "assets/images/product_search/user.png",
                  //       width: 66.r,
                  //       height: 66.r,
                  //       fit: BoxFit.cover,
                  //     ),
                  //   );
                  // }),
                  // Obx(() {
                  //   return sessionController.pickedProfileImage.value != null
                  //       ? Container(
                  //           width: 55.r,
                  //           height: 55.r,
                  //           decoration: BoxDecoration(
                  //             shape: BoxShape.circle,
                  //             color: Colors.black,
                  //             //Colors.grey.shade200,
                  //           ),
                  //           alignment: Alignment.center,
                  //           child: Image.file(
                  //             sessionController.pickedProfileImage.value!,
                  //             fit: BoxFit.cover,
                  //           ),
                  //         )
                  //       : Container(
                  //           width: 55.r,
                  //           height: 55.r,
                  //           decoration: BoxDecoration(
                  //             shape: BoxShape.circle,
                  //             color: Colors.black,
                  //             //Colors.grey.shade200,
                  //           ),
                  //           alignment: Alignment.center,
                  //           child: Icon(
                  //             Icons.person,
                  //             size: 28.r,
                  //             color: Colors.black,
                  //             //Colors.grey.shade500,
                  //           ),
                  //         );
                  // }),
                  /// Profile Image + Edit Icon:
                  Obx(() {
                    final double avatarSize = 66.r;

                    // 1️⃣ Local picked image
                    if (sessionController.pickedProfileImage.value != null) {
                      return ClipOval(
                        child: Image.file(
                          sessionController.pickedProfileImage.value!,
                          width: avatarSize,
                          height: avatarSize,
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
                          width: avatarSize,
                          height: avatarSize,
                          fit: BoxFit.cover,
                          fadeInDuration: const Duration(milliseconds: 200),
                          placeholder: (context, url) => Container(
                            width: avatarSize,
                            height: avatarSize,
                            alignment: Alignment.center,
                            child: const CircularProgressIndicator(
                              strokeWidth: 2,
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
                              radius: avatarSize / 2,
                              backgroundColor: Colors.grey[300],
                              child: Text(
                                firstLetter,
                                style: TextStyle(
                                  fontSize: 22.sp,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
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
                      radius: avatarSize / 2,
                      backgroundColor: Colors.grey[300],
                      child: Text(
                        firstLetter,
                        style: TextStyle(
                          fontSize: 22.sp,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                    );
                  }),

                  SizedBox(width: 8.w),

                  /// Reviews Info:
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Padding(
                        padding: EdgeInsets.only(left: 10.0.w),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Center(
                              child: AppTextWidget(
                                text:
                                    "${getProfileController.customerProfile.value?.firstname ?? ""} ${getProfileController.customerProfile.value?.lastname ?? ""}",
                                fontWeight: FontWeight.w500,
                                fontSize: 15.sp,
                              ),
                            ),
                            SizedBox(width: 5.w),
                            GestureDetector(
                              onTap: () {
                                Get.toNamed(allInOneProfileUpdate);
                              },
                              child: Container(
                                width: 18.w,
                                height: 18.w,
                                decoration: BoxDecoration(
                                  color: Colors.transparent,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.transparent),
                                ),
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: 10.0.h),
                                  child: Icon(
                                    Icons.edit_rounded,
                                    size: 16.sp,
                                    color: AppColors.primaryColor,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      SizedBox(height: 3.h),
                      Row(
                        children: [
                          statItem("0", "totalReviews".tr),
                          SizedBox(width: 20.w),
                          Container(
                            height: 20.h,
                            width: 1.w,
                            color: Colors.grey.shade300,
                          ),
                          SizedBox(width: 20.w),
                          statItem("0", "helpful".tr),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: 8.h),

            Padding(
              padding: EdgeInsets.only(left: 8.0.w),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.lock, color: Colors.green, size: 14.sp),
                  SizedBox(width: 5.w),
                  SizedBox(
                    width: MediaQuery.sizeOf(context).width * 0.7,
                    //  color: Colors.red,
                    child: Center(
                      child: Text(
                        "yourInformationAnd".tr,
                        style: TextStyle(fontSize: 11.sp, color: Colors.green),

                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 8.h),
            Divider(height: 1.h),

            /// Empty Review Section
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long,
                    size: 80.sp,
                    color: Colors.grey.shade300,
                  ),

                  SizedBox(height: 18.h),

                  Text(
                    "reviewIsEmpty".tr,
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  SizedBox(height: 6.h),

                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 40.w),
                    child: Text(
                      "youHaveNo".tr,
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12.sp, color: Colors.grey),
                    ),
                  ),

                  SizedBox(height: 22.h),

                  /// Button
                  Container(
                    width: 170.w,
                    height: 35.h,
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius: BorderRadius.circular(20.r),
                    ),
                    child: Center(
                      child: Text(
                        "goToYourReviews".tr,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
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

  Widget statItem(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w600),
        ),
        SizedBox(height: 2.h),
        Text(
          label,
          style: TextStyle(fontSize: 11.sp, color: Colors.grey),
        ),
      ],
    );
  }
}
