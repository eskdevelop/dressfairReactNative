import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../controller/customer_profile/customer_profile_controller.dart';

class AllInOneProfileUpdate extends StatefulWidget {
  const AllInOneProfileUpdate({super.key});

  @override
  State<AllInOneProfileUpdate> createState() => _AllInOneProfileUpdateState();
}

class _AllInOneProfileUpdateState extends State<AllInOneProfileUpdate> {
  final controller = Get.put(GetProfileController());
  final sessionController = Get.find<SessionController>();
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      controller.firstNameController.value.text =
          controller.customerProfile.value?.firstname ?? "";
      controller.lastNameController.value.text =
          controller.customerProfile.value?.lastname ?? "";
      controller.emailController.value.text =
          controller.customerProfile.value?.email ?? "";
      controller.mobileNoController.value.text =
          controller.customerProfile.value?.mobile ?? "";
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
        centerTitle: true,
        title: AppTextWidget(
          text: "profile".tr,
          fontSize: 16.sp,
          fontWeight: FontWeight.w500,
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

      body: Obx(
        () => controller.isLoading.value
            ? Center(
                child: SpinKitCircle(color: Colors.grey, size: 40.sp),
              )
            : SingleChildScrollView(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: Column(
                  children: [
                    10.verticalSpace,

                    // /// PROFILE IMAGE:
                    // GestureDetector(
                    //   onTap: () async {
                    //     log(
                    //       "IMAGE == ${SimpleMethode.imageUrl}/"
                    //       "${controller.customerProfile.value!.image}",
                    //     );
                    //     await sessionController.pickProfileImageFromGallery();
                    //   },
                    //   child: Stack(
                    //     clipBehavior: Clip.none,
                    //     children: [
                    //       Obx(() {
                    //         if (sessionController.pickedProfileImage.value !=
                    //             null) {
                    //           return ClipOval(
                    //             child: Image.file(
                    //               sessionController.pickedProfileImage.value!,
                    //               width: 96.r,
                    //               height: 96.r,
                    //               fit: BoxFit.cover,
                    //             ),
                    //           );
                    //         }
                    //
                    //         /// Network image:
                    //         if (controller
                    //                 .customerProfile
                    //                 .value
                    //                 ?.image
                    //                 .isNotEmpty ==
                    //             true) {
                    //           return ClipOval(
                    //             child: CachedNetworkImage(
                    //               imageUrl:
                    //                   "${SimpleMethode.imageUrl}/${controller.customerProfile.value!.image}",
                    //               width: 96.r,
                    //               height: 96.r,
                    //               fit: BoxFit.cover,
                    //               fadeInDuration: const Duration(
                    //                 milliseconds: 200,
                    //               ),
                    //               placeholder: (context, url) => Container(
                    //                 width: 96.r,
                    //                 height: 96.r,
                    //                 alignment: Alignment.center,
                    //                 child: const CircularProgressIndicator(
                    //                   strokeWidth: 2,
                    //                 ),
                    //               ),
                    //               errorWidget: (context, url, error) =>
                    //                   Container(
                    //                     width: 96.r,
                    //                     height: 96.r,
                    //                     color: Colors.grey[200],
                    //                     child: const Icon(
                    //                       Icons.image_not_supported,
                    //                     ),
                    //                   ),
                    //             ),
                    //           );
                    //         }
                    //
                    //         // Default avatar
                    //         return ClipOval(
                    //           child: Image.asset(
                    //             "assets/images/product_search/user.png",
                    //             width: 96.r,
                    //             height: 96.r,
                    //             fit: BoxFit.cover,
                    //           ),
                    //         );
                    //       }),
                    //
                    //       // sessionController.pickedProfileImage.value == null
                    //       //     ? CircleAvatar(
                    //       //         radius: 48.r,
                    //       //         backgroundColor: Colors.black,
                    //       //         backgroundImage: AssetImage(
                    //       //           "assets/images/product_search/user.png",
                    //       //         ),
                    //       //       )
                    //       //     : Container(
                    //       //         width: 96.r, // radius * 2
                    //       //         height: 96.r,
                    //       //         decoration: BoxDecoration(
                    //       //           color: Colors.black,
                    //       //           shape: BoxShape.circle,
                    //       //           image: DecorationImage(
                    //       //             image: FileImage(
                    //       //               sessionController
                    //       //                   .pickedProfileImage
                    //       //                   .value!,
                    //       //             ),
                    //       //             fit: BoxFit.cover,
                    //       //           ),
                    //       //         ),
                    //       //       ),
                    //       Positioned(
                    //         bottom: -2.r,
                    //         right: -2.r,
                    //         child: Container(
                    //           padding: EdgeInsets.all(6.sp),
                    //           decoration: const BoxDecoration(
                    //             color: Colors.white,
                    //             shape: BoxShape.circle,
                    //           ),
                    //           child: const Icon(
                    //             Icons.camera_alt,
                    //             size: 18,
                    //             color: Colors.black,
                    //           ),
                    //         ),
                    //       ),
                    //     ],
                    //   ),
                    // ),
                    /// PROFILE IMAGE:
                    GestureDetector(
                      onTap: () async {
                        log(
                          "IMAGE == ${SimpleMethode.imageUrl}/${controller.customerProfile.value!.image}",
                        );
                        await sessionController.pickProfileImageFromGallery();
                      },
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Obx(() {
                            final double avatarSize = 96.r;

                            // 1️⃣ Local picked image
                            if (sessionController.pickedProfileImage.value !=
                                null) {
                              return ClipOval(
                                child: Image.file(
                                  sessionController.pickedProfileImage.value!,
                                  width: avatarSize,
                                  height: avatarSize,
                                  fit: BoxFit.cover,
                                ),
                              );
                            }

                            /// Network image
                            if (controller
                                    .customerProfile
                                    .value
                                    ?.image
                                    .isNotEmpty ==
                                true) {
                              return ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl:
                                      "${SimpleMethode.imageUrl}/${controller.customerProfile.value!.image}",
                                  width: avatarSize,
                                  height: avatarSize,
                                  fit: BoxFit.cover,
                                  fadeInDuration: const Duration(
                                    milliseconds: 200,
                                  ),
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
                                        controller
                                                .customerProfile
                                                .value
                                                ?.firstname
                                                .isNotEmpty ==
                                            true
                                        ? controller
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
                                          fontSize: 28.sp,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              );
                            }

                            ///  Default avatar with first letter or placeholder icon :
                            final firstLetter =
                                controller
                                        .customerProfile
                                        .value
                                        ?.firstname
                                        .isNotEmpty ==
                                    true
                                ? controller.customerProfile.value!.firstname[0]
                                      .toUpperCase()
                                : '?';

                            return CircleAvatar(
                              radius: avatarSize / 2,
                              backgroundColor: Colors.grey[300],
                              child: Text(
                                firstLetter,
                                style: TextStyle(
                                  fontSize: 28.sp,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                            );
                          }),

                          /// Camera icon
                          Positioned(
                            bottom: -2.r,
                            right: -2.r,
                            child: Container(
                              padding: EdgeInsets.all(6.sp),
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                size: 18,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    10.verticalSpace,

                    /// FIRST NAME
                    _buildTextField(
                      label: "firstName".tr,
                      controller: controller.firstNameController.value,
                    ),

                    5.verticalSpace,

                    /// LAST NAME
                    _buildTextField(
                      label: "lastName".tr,
                      controller: controller.lastNameController.value,
                    ),

                    5.verticalSpace,

                    /// EMAIL
                    _buildTextField(
                      label: "email".tr,
                      controller: controller.emailController.value,
                      keyboardType: TextInputType.emailAddress,
                    ),

                    5.verticalSpace,

                    /// WHATSAPP NUMBER
                    _buildTextField(
                      label: "whatsAppNumber".tr,
                      controller: controller.mobileNoController.value,
                      keyboardType: TextInputType.phone,
                    ),

                    14.verticalSpace,

                    /// PRIVACY TEXT
                    Row(
                      children: [
                        Icon(Icons.lock, color: Colors.green, size: 18.sp),
                        8.horizontalSpace,
                        Expanded(
                          child: Text(
                            "yourInformation".tr,
                            style: TextStyle(
                              fontSize: 12.sp,
                              color: Colors.green,
                            ),
                          ),
                        ),
                      ],
                    ),
                    40.verticalSpace,
                    AppButton(
                      width: 300.w,
                      height: 55.h,
                      containerColor: AppColors.primaryColor,
                      onTap: () async {
                        if (controller.firstNameController.value.text.isEmpty) {
                          AppToast.showError("firstNameIsRequired".tr);
                        } else if (controller
                            .lastNameController
                            .value
                            .text
                            .isEmpty) {
                          AppToast.showError("lastNameIsRequired".tr);
                        } else if (controller
                            .emailController
                            .value
                            .text
                            .isEmpty) {
                          AppToast.showError("emailIsRequired".tr);
                        } else if (controller
                            .mobileNoController
                            .value
                            .text
                            .isEmpty) {
                          AppToast.showError("mobileNoIsRequired".tr);
                        } else {
                          await controller.updateCustomerProfile();
                        }
                      },
                      textStyle: TextStyle(color: Colors.white),
                      borderRadius: 50.r,
                      isLoading: controller.isLoading,
                      text: "save".tr,
                    ),

                    30.verticalSpace,
                  ],
                ),
              ),
      ),
    );
  }

  /// REUSABLE TEXT FIELD
  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextWidget(
          text: label,
          fontSize: 12.sp,
          fontWeight: FontWeight.w400,
        ),
        3.verticalSpace,
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            contentPadding: EdgeInsets.symmetric(
              horizontal: 10.w,
              vertical: 10.h,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5.r),
              borderSide: BorderSide(color: Colors.grey.shade400),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(5.r),
              borderSide: BorderSide(color: AppColors.primaryColor),
            ),
          ),
        ),
      ],
    );
  }
}
