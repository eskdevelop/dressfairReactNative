import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/contact_us_page/contact_us_page.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/legal_term_and_policy/about_us.dart';

class AboutUsMainScreen extends StatelessWidget {
  const AboutUsMainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xfff3f3f3),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        foregroundColor: Colors.white,
        elevation: 0,
        leadingWidth: 38.w,
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: Padding(
            padding: EdgeInsets.only(right: 8.0.w),
            child: GestureDetector(
              onTap: () {
                Get.back();
              },
              child: Padding(
                padding: EdgeInsets.only(left: 10.0.w),
                child: SvgPicture.asset(
                  AppImages.backArrow,
                  color: Colors.black,
                ),
              ),
            ),
          ),
        ),
        title: AppTextWidget(
          text: "language".tr,
          fontWeight: FontWeight.w600,
          fontSize: 16.sp,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Container(
            height: 160.h,
            width: MediaQuery.sizeOf(context).width,
            decoration: BoxDecoration(
              color: Colors.white,
              // border: Border.all(color: Colors.black.withOpacity(0.05)),
            ),
            child: Column(
              children: [
                20.h.sh,
                SvgPicture.asset(height: 65.h, AppImages.logo),
                10.h.sh,
                AppTextWidget(
                  text: "Dress Fair",
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
                1.h.sh,
                AppTextWidget(
                  text: AppText.appVersion,
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                  color: Colors.black.withOpacity(0.5),
                ),
              ],
            ),
          ),

          GestureDetector(
            onTap: () {
              Get.to(AboutUs());
            },
            child: _languageTile("aboutDressFair".tr),
          ),
          GestureDetector(
            onTap: () {
              Get.to(ContactUsPage());
            },
            child: _languageTile("contactUs".tr),
          ),
        ],
      ),
    );
  }

  Widget _languageTile(String name) {
    return Container(
      color: Colors.white,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Divider(thickness: 0.5, color: Colors.black.withOpacity(0.2)),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.0.w, vertical: 8.0.h),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AppTextWidget(
                  text: name,
                  fontSize: 13.5.sp,
                  fontWeight: FontWeight.w400,
                ),

                Icon(
                  Icons.arrow_forward_ios_outlined,
                  color: Colors.black.withOpacity(0.5),
                  size: 16.sp,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
