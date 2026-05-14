import 'package:dress_fair_ecommmerce/controller/privacy_controller/privacy_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:google_fonts/google_fonts.dart';

class AboutUs extends StatefulWidget {
  const AboutUs({super.key});

  @override
  State<AboutUs> createState() => _AboutUsState();
}

class _AboutUsState extends State<AboutUs> {
  PrivacyController privacyController = Get.put(PrivacyController());

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      if (privacyController.aboutUs.value == null) {
        privacyController.getAboutUs();
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
        iconTheme: const IconThemeData(color: Colors.black),
        title: AppTextWidget(
          text: "aboutUs".tr,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryColor,
          fontSize: 16.sp,
        ),
        leadingWidth: 40.w,
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Container(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: 8.0.w,
                  vertical: 8.0.h,
                ),
                child: SvgPicture.asset(
                  height: 10.h,
                  width: 10.w,
                  AppImages.backArrow,
                ),
              ),
            ),
          ),
        ),
      ),

      body: Obx(
        () => SingleChildScrollView(
          physics: BouncingScrollPhysics(),
          child: privacyController.isLoading.value
              ? Padding(
                  padding: EdgeInsets.only(top: 290.0.h),
                  child: Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primaryColor,
                    ),
                  ),
                )
              : privacyController.aboutUs.value == null
              ? Padding(
                  padding: EdgeInsets.only(top: 290.0.h),
                  child: Center(
                    child: AppTextWidget(text: "aboutUsNotFound".tr),
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    10.h.sh,
                    Padding(
                      padding: EdgeInsets.only(left: 10.0.w, right: 10.0.h),
                      child: MediaQuery(
                        data: MediaQuery.of(
                          context,
                        ).copyWith(textScaleFactor: 1.4),
                        child: Html(
                          data:
                              privacyController.aboutUs.value?.description ??
                              "",
                          style: {
                            "*": Style(
                              fontSize: FontSize(
                                9.sp,
                              ), // compact and readable on mobile
                              fontFamily: GoogleFonts.roboto().fontFamily,
                              color: AppColors.blackColor,
                              lineHeight: LineHeight.number(
                                1.2.h,
                              ), // tighten spacing
                              textAlign: TextAlign.justify,
                              margin: Margins.zero,
                              padding: HtmlPaddings.zero,
                            ),
                            "p": Style(
                              margin: Margins.only(
                                bottom: 4,
                              ), // reduce space between paragraphs
                            ),
                            "li": Style(
                              margin: Margins.only(bottom: 2.w),
                              padding: HtmlPaddings.only(left: 8.w),
                            ),
                            "ol": Style(padding: HtmlPaddings.only(left: 16.w)),
                          },
                        ),
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
