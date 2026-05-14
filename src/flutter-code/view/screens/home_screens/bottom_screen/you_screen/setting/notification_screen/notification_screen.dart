import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/other_updated_bottom_sheet.dart';

import '../../../../../../util/widgets/bottom_model_sheet/avatar_username_sharing_moddle_sheet.dart';
import '../../../../../../util/widgets/bottom_model_sheet/chat_messages_moddle_sheet.dart';
import '../../../../../../util/widgets/bottom_model_sheet/customer_activities_model_sheet.dart';
import '../../../../../../util/widgets/bottom_model_sheet/promotion_notification_bottom_sheet.dart';
import '../../../../../../util/widgets/routes/screens_library.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        foregroundColor: Colors.white70,
        backgroundColor: Colors.white,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, size: 18.sp, color: Colors.black),
          onPressed: () => Get.back(),
        ),
        title: AppTextWidget(
          text: "Notifications",
          fontSize: 15.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black,
          // style: TextStyle(
          //   fontSize: 16.sp,
          //   fontWeight: FontWeight.w500,
          //   color: Colors.black,
          // ),
        ),
      ),

      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ================= GREEN INFO BAR =================
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              color: Colors.green[700],
              child: Row(
                children: [
                  Icon(Icons.verified, color: Colors.white, size: 16.sp),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: AppTextWidget(
                      text:
                          "Dress Fair does not ask customers for additional fees via SMS or email.",
                      fontSize: 12.sp,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 10.h),

            // ================= ENABLE PUSH =================
            Center(
              child: Column(
                children: [
                  AppTextWidget(
                    text: "Receive push notifications",
                    fontSize: 15.sp,
                    fontWeight: FontWeight.w600,
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    "Please enable Dress Fair notifications in your\ndevice's Settings.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.sp, color: Colors.grey[600]),
                  ),
                  SizedBox(height: 10.h),
                  // ENABLE BUTTON:
                  Container(
                    width: 150.w,
                    height: 40.h,
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius: BorderRadius.circular(30.r),
                    ),
                    child: Center(
                      child: AppTextWidget(
                        text: "Enable now",
                        fontSize: 13.sp,
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 13.h),
            Divider(height: 1.h),
            // ================= NOTIFICATION LIST ================= //
            _notificationTile(
              title: "Promotions",
              subtitle:
                  "Be the first to learn about promotions, daily deals, and other exclusive savings.",
              status: "On: Email; Off: Push, In-app notifications",
              onTap: () {
                showPromotionSettingsBottomSheet(context);
              },
            ),

            /// Order Updates :
            _notificationTile(
              title: "Order updates",
              subtitle:
                  "Receive notifications about order confirmations and shipment updates.",
              status: "On: Email; Off: Push",
              onTap: () {
                showOrderUpdatesBottomSheet(context);
              },
            ),

            /// Chat message:
            _notificationTile(
              title: "Chat messages",
              subtitle: "Never miss important messages from sellers.",
              status: "On: Email; Off: Push, SMS",
              onTap: () {
                showChatMessagesBottomSheet(context);
              },
            ),
            _notificationTile(
              title: "Customers' activity",
              subtitle: "Keep up with the latest shopping trends.",
              status: "On: Showing others' shopping activities.",
              onTap: () {
                showCustomersActivityBottomSheet(context);
              },
            ),
            _notificationTile(
              title: "Avatar and username sharing",
              subtitle:
                  "Share your profile avatar and username with other users when you add a product to cart, purchase or ....",
              status: "On: Share",
              onTap: () {
                showAvatarUsernameSharingBottomSheet(context);
              },
            ),

            SizedBox(height: 20.h),
          ],
        ),
      ),
    );
  }

  // ================= TILE =================
  Widget _notificationTile({
    required String title,
    required String subtitle,
    required String status,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey.withOpacity(0.2))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              GestureDetector(
                onTap: onTap,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 10.w,
                    vertical: 4.h,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor,
                    borderRadius: BorderRadius.circular(20.r),
                  ),
                  child: Text(
                    "Edit",
                    style: TextStyle(fontSize: 11.sp, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 6.h),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 12.sp,
              color: Colors.grey[600],
              height: 1.4,
            ),
          ),

          SizedBox(height: 6.h),

          Text(
            status,
            style: TextStyle(fontSize: 11.5.sp, color: Colors.grey[700]),
          ),
        ],
      ),
    );
  }
}
