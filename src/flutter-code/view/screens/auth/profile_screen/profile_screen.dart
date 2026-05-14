import 'package:dress_fair_ecommmerce/view/screens/home_screens/address_screens/add_new_address.dart';

import '../../../../controller/session_controller/session_controller.dart';
import '../../../util/widgets/routes/screens_library.dart';
import 'add_email_bottom_sheet.dart';
import 'add_name_bottom_sheet.dart';
import 'add_phone_no_bottom_sheet.dart';

class ProfileScreen extends StatelessWidget {
  ProfileScreen({super.key});
  SessionController sessionController = Get.put(SessionController());
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Text(
          "profile".tr,
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.w500),
        ),
        centerTitle: true,
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: Container(
            child: Icon(
              Icons.arrow_back_ios_new,
              color: Colors.black.withOpacity(0.6),
            ),
          ),
        ),
      ),

      /// 🔥 FIX: Scrollable body
      body: SingleChildScrollView(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Column(
          children: [
            _profileTile(
              title: "photo".tr,
              trailing: Obx(() {
                final imageFile = sessionController.pickedProfileImage.value;
                return Container(
                  width: 42.r,
                  height: 42.r,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey.shade200,
                    image: imageFile != null
                        ? DecorationImage(
                            image: FileImage(imageFile),
                            fit: BoxFit.cover,
                          )
                        : null,
                  ),
                  alignment: Alignment.center,
                  child: imageFile == null
                      ? Icon(
                          Icons.person,
                          size: 28.r,
                          color: Colors.grey.shade500,
                        )
                      : null,
                );
              }),
              onTap: () {
                sessionController.pickProfileImageFromGallery();
              },
            ),
            _divider(),
            _profileTile(
              title: "name".tr,
              trailing: Icon(Icons.arrow_forward_ios_rounded, size: 16.sp),
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => const UpdateNameBottomSheet(),
                );
              },
            ),
            _divider(),
            _profileTile(
              title: "email".tr,
              subtitle: "abc123@gmail.com",
              //"amjad11nawaz@gmail.com",
              trailing: _orangeButton("add".tr),
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => UpdateEmailBottomSheet(),
                );
              },
            ),
            _divider(),
            _profileTile(
              title: "mobilePhoneNumber".tr,
              subtitle: "addAPhoneNumber".tr,
              trailing: _orangeButton("add".tr),
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => const UpdatePhoneBottomSheet(),
                );
              },
            ),
            _divider(),
            _profileTile(
              title: "address".tr,
              subtitle: "addAAddress".tr,
              trailing: _orangeButton("add".tr),
              onTap: () {
                Get.to(AddNewAddress(id: '0', isEdit: false));
              },
            ),

            _divider(),

            20.h.verticalSpace,

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.lock, color: Colors.green, size: 20.r),
                  8.w.horizontalSpace,
                  Expanded(
                    child: Text(
                      "dressFairProtect".tr,
                      style: TextStyle(fontSize: 12.sp, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),

            30.h.verticalSpace,

            Padding(
              padding: EdgeInsets.all(20.w),
              child: Text(
                "howWeUseYourProfileAvatarAnd".tr,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11.sp, color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _divider() {
    return Divider(height: 1.h, color: Colors.grey.shade300);
  }

  Widget _profileTile({
    required String title,
    String? subtitle,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontSize: 14.sp)),
                  if (subtitle != null)
                    Padding(
                      padding: EdgeInsets.only(top: 4.h),
                      child: Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 12.sp,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }

  Widget _orangeButton(String text) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: AppColors.primaryColor,
        borderRadius: BorderRadius.circular(20.r),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: Colors.white,
          fontSize: 12.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
