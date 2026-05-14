import '../../../../../../util/widgets/routes/screens_library.dart';

class AccountSetting extends StatelessWidget {
  const AccountSetting({super.key});

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
          text: "Account Setting",
          fontSize: 15.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black,
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 8.h),
            // ===== STATUS HEADER =====
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36.w,
                    height: 36.w,
                    decoration: const BoxDecoration(
                      color: Color(0xFFE8F5E9),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.verified_user,
                      color: Colors.green,
                      size: 20.sp,
                    ),
                  ),
                  SizedBox(width: 12.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Your account is protected',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w600,
                            color: Colors.green,
                          ),
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          'Your Dress Fair account is protected by advanced security. '
                          'Keeping this information up-to-date safeguards your account even more.',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey[700],
                            height: 1.3.h,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 8.h),
            _divider(),
            SizedBox(height: 7.h),
            // ===== SECURITY LIST =====
            _settingRow(
              title: 'Mobile phone number',
              actionText: 'Add',
              onTap: () {},
            ),
            SizedBox(height: 2.h),
            _divider(),

            _settingRow(
              title: 'Email',
              subtitle: "",
              //'amjad11nawaz@gmail.com',
              actionText: 'Edit',
              onTap: () {},
            ),
            _divider(),
            SizedBox(height: 7.h),
            _settingRow(title: 'Password', actionText: 'Add', onTap: () {}),
            SizedBox(height: 2.h),
            _divider(),
            _settingRow(
              title: 'Two-factor authentication: Off',
              subtitle:
                  'Protect your account by adding an extra layer of security.',
              actionText: 'Turn on',
              onTap: () {},
            ),
            Divider(
              thickness: 4,
              //height: 10,
              color: Colors.grey.shade200,
            ),
            SizedBox(height: 10.h),
            // ===== THIRD PARTY =====
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              child: AppTextWidget(
                text: 'Third-party accounts',
                fontSize: 13.sp,
                fontWeight: FontWeight.w500,
              ),
            ),
            SizedBox(height: 5.h),
            _thirdPartyRow(
              icon: Icons.g_translate,
              title: 'Google',
              status: 'Linked',
              isLinked: true,
            ),
            SizedBox(height: 4.h),
            _divider(),
            SizedBox(height: 5.h),
            _thirdPartyRow(
              icon: Icons.facebook,
              title: 'Facebook',
              status: 'Link',
              isLinked: false,
            ),
            SizedBox(height: 4.h),
            Divider(thickness: 4, color: Colors.grey.shade200),

            // ===== FOOTER OPTIONS =====
            _simpleNavRow(title: 'Sign in activity', onTap: () {}),

            _divider(),

            _simpleNavRow(
              title: 'Delete your Dress Fair account',
              isDanger: true,
              onTap: () {},
            ),
            _divider(),
          ],
        ),
      ),
    );
  }

  Widget _divider() => Divider(height: 1, color: Colors.grey.shade200);

  Widget _settingRow({
    required String title,
    String? subtitle,
    required String actionText,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 5.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AppTextWidget(
                  text: title,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                ),
                if (subtitle != null) ...[
                  SizedBox(height: 4.h),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 11.sp, color: Colors.grey[600]),
                  ),
                ],
              ],
            ),
          ),
          _orangeButton(actionText, onTap),
        ],
      ),
    );
  }

  Widget _thirdPartyRow({
    required IconData icon,
    required String title,
    required String status,
    required bool isLinked,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 20.sp),
          SizedBox(width: 12.w),
          Expanded(
            child: AppTextWidget(
              text: title,
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              // style: TextStyle(fontSize: 14.sp)
            ),
          ),
          _orangeButton(status, () {}),
        ],
      ),
    );
  }

  Widget _simpleNavRow({
    required String title,
    bool isDanger = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        child: Row(
          children: [
            Expanded(
              child: AppTextWidget(
                text: title,
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
                color: isDanger ? Colors.red : Colors.black,
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDanger ? Colors.red : Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _orangeButton(String text, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 5.h),
        decoration: BoxDecoration(
          color: AppColors.primaryColor,
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 9.sp,
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
