import 'package:flutter/gestures.dart';

import '../../../../../../util/widgets/routes/screens_library.dart';

class PermissionScreen extends StatelessWidget {
  const PermissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      // ================= APP BAR =================
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        centerTitle: true,
        leadingWidth: 40.w,
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: Padding(
            padding: EdgeInsets.only(left: 12.w),
            child: Icon(Icons.arrow_back_ios, size: 18.sp, color: Colors.black),
          ),
        ),
        title: Text(
          "Permissions",
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
      ),

      // ================= BODY =================
      body: SingleChildScrollView(
        child: Column(
          children: [
            // SizedBox(height: 20.h),

            // ================= TOP ICON =================
            _greenIcon(icon: Icons.key),

            SizedBox(height: 12.h),

            Text(
              "Access certain device features with your permission",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13.sp,
                color: Colors.green[700],
                fontWeight: FontWeight.w500,
              ),
            ),

            SizedBox(height: 24.h),

            // ================= NOTIFICATION SECTION =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          "Notifications",
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 3.h,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(4.r),
                        ),
                        child: Text(
                          "Not allowed",
                          style: TextStyle(
                            fontSize: 11.sp,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 6.h),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: Colors.grey[700],
                        height: 1.4,
                      ),
                      children: [
                        const TextSpan(
                          text:
                              "Enable notifications to get updates on your orders, "
                              "learn about promotions, etc. You can view and edit "
                              "notifications on the ",
                        ),
                        TextSpan(
                          text: "notification ",
                          style: TextStyle(
                            decoration: TextDecoration.underline,
                            color: Colors.green[700], // link color
                            fontWeight: FontWeight.w500,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              // 👉 Navigate to notification page
                              Get.toNamed(notificationScreen);
                              // OR Get.to(NotificationScreen());
                            },
                        ),
                        const TextSpan(text: " page "),
                        const TextSpan(text: "."),
                      ],
                    ),
                  ),

                  // Text(
                  //   "Enable notifications to get updates on your orders, "
                  //   "learn about promotions, etc. You can view and edit "
                  //   "notifications on the notification page.",
                  //   style: TextStyle(
                  //     fontSize: 12.sp,
                  //     color: Colors.grey[700],
                  //     height: 1.4,
                  //   ),
                  // ),
                ],
              ),
            ),

            SizedBox(height: 12.h),

            // ================= LOCK ICON =================
            _greenIcon(icon: Icons.lock),

            SizedBox(height: 12.h),

            Text(
              "We DO NOT access the following device features",
              style: TextStyle(
                fontSize: 13.sp,
                color: Colors.green[700],
                fontWeight: FontWeight.w600,
              ),
            ),

            SizedBox(height: 16.h),

            // ================= LIST =================
            _permissionTile(icon: Icons.mic, title: "Microphone"),
            _permissionTile(icon: Icons.contacts, title: "Contacts"),
            _permissionTile(icon: Icons.bluetooth, title: "Bluetooth"),
            _permissionTile(icon: Icons.content_paste, title: "Clipboard"),
            _permissionTile(
              icon: Icons.location_on,
              title: "Location",
              subtitle:
                  "In most countries/regions, such as Pakistan, the US, the UK, etc., "
                  "we do not request access to your location. We only request location "
                  "access from users in the Middle East to make it easier for users "
                  "to accurately fill in their shipping address.",
            ),
            // _permissionTile(
            //   icon: Icons.storage,
            //   title: "Storage",
            //   subtitle:
            //       "We do not request permission to access your storage. You can still use the Android system's built-in photo picker when leaving a review, searching for items, etc., without Dress Fair accessing your storage.",
            // ),
            _permissionTile(
              icon: Icons.camera_alt,
              title: "Camera",
              subtitle:
                  "We do not request permission to access your camera. You can still use the Android system's built-in camera app to take photos for leaving a review, search items, etc., without Dress Fair accessing your camera.",
            ),
            _permissionTile(
              icon: Icons.more_horiz,
              title: "Others",
              subtitle:
                  "In addition to the above device features, we will not request access to any other device features, such as your calendar, reminders, etc.",
            ),

            SizedBox(height: 30.h),
          ],
        ),
      ),
    );
  }

  // ================= GREEN ICON =================
  Widget _greenIcon({required IconData icon}) {
    return Container(
      width: 60.w,
      height: 60.w,
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.15),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Icon(icon, color: Colors.green[700], size: 28.sp),
      ),
    );
  }

  // ================= PERMISSION TILE =================
  Widget _permissionTile({
    required IconData icon,
    required String title,
    String? subtitle,
  }) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
      padding: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(color: Colors.grey.withOpacity(0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20.sp),
          SizedBox(width: 12.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (subtitle != null) ...[
                  SizedBox(height: 4.h),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11.5.sp,
                      color: Colors.grey[700],
                      height: 1.4,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(Icons.block, size: 18.sp, color: Colors.redAccent),
        ],
      ),
    );
  }
}
