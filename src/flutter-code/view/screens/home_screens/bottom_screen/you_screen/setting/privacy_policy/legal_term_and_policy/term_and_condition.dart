import 'package:dress_fair_ecommmerce/controller/privacy_controller/privacy_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:google_fonts/google_fonts.dart';

class TermAndCondition extends StatefulWidget {
  const TermAndCondition({super.key});

  @override
  State<TermAndCondition> createState() => _TermAndConditionState();
}

class _TermAndConditionState extends State<TermAndCondition> {
  PrivacyController privacyController = Get.put(PrivacyController());

  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      if (privacyController.termAndCondition.value == null) {
        privacyController.getTermAndCondition();
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
          text: "dressFair".tr,
          fontWeight: FontWeight.bold,
          color: AppColors.primaryColor,
          fontSize: 16.sp,
        ),
        leadingWidth: 40.w,
        leading: GestureDetector(
          onTap: () {
            Get.back();
          },
          child: Container(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
              child: SvgPicture.asset(
                height: 10.h,
                width: 10.w,
                AppImages.backArrow,
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
              : privacyController.termAndCondition.value == null
              ? Padding(
                  padding: EdgeInsets.only(top: 290.0.h),
                  child: Center(
                    child: AppTextWidget(text: "termAndConditionNotFound".tr),
                  ),
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    10.h.sh,
                    Padding(
                      padding: EdgeInsets.only(left: 13.0.w),
                      child: AppTextWidget(
                        text: "dressFairAndTermAndConditions".tr,
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    MediaQuery(
                      data: MediaQuery.of(
                        context,
                      ).copyWith(textScaleFactor: 0.9),
                      child: Html(
                        data:
                            privacyController
                                .termAndCondition
                                .value
                                ?.description ??
                            "",
                        style: {
                          "body": Style(
                            fontSize: FontSize(8.sp),
                            fontFamily: GoogleFonts.roboto().fontFamily,
                            color: AppColors.blackColor,
                            lineHeight: LineHeight.number(1.3),
                            textAlign: TextAlign.justify,
                          ),
                        },
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
