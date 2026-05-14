import 'package:flutter_html/flutter_html.dart';

import '../../../../../controller/product_controller/product_detail_controller.dart';
import '../../../../../controller/session_controller/session_controller.dart';
import '../../../../util/widgets/routes/screens_library.dart';

class TitleSection extends StatelessWidget {
  TitleSection({super.key});
  SessionController sessionController = Get.find<SessionController>();
  ProductDetailController productDetailController =
      Get.find<ProductDetailController>();
  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Padding(
        padding: EdgeInsets.symmetric(horizontal: 10.w),
        child: Container(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Theme(
                data: Theme.of(context).copyWith(
                  dividerColor: Colors.transparent,
                  splashColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                ),
                child: Container(
                  margin: EdgeInsets.zero,
                  padding: EdgeInsets.zero,
                  child: ExpansionTile(
                    dense: true,
                    visualDensity: const VisualDensity(
                      horizontal: 0,
                      vertical: -4,
                    ), // ⬅️ reduces tile height
                    tilePadding: EdgeInsets.zero,
                    childrenPadding: EdgeInsets.only(
                      top: 0,
                      bottom: 4.h,
                    ), // ⬅️ control content spacing
                    iconColor: Colors.black,
                    collapsedIconColor: Colors.black,
                    title: AppTextWidget(
                      text: sessionController.selectedLanguageCode == "ar"
                          ? productDetailController
                                    .productDetail
                                    .value
                                    ?.nameAr ??
                                ""
                          : productDetailController.productDetail.value?.name ??
                                "",

                      fontSize: 12.sp,
                      fontWeight: FontWeight.normal,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    trailing: Icon(
                      Icons.expand_more,
                      size: 16.sp,
                      color: Colors.black,
                    ),
                    children: [
                      Padding(
                        padding: EdgeInsets.only(top: 2.h),
                        child: Html(
                          data: sessionController.selectedLanguageCode == "ar"
                              ? productDetailController
                                        .productDetail
                                        .value
                                        ?.descriptionAr ??
                                    "<p>No description available.</p>"
                              : productDetailController
                                        .productDetail
                                        .value
                                        ?.description ??
                                    "<p>No description available.</p>",
                          shrinkWrap: true,
                          style: {
                            "body": Style(
                              margin: Margins.zero,
                              padding: HtmlPaddings.zero,
                              fontSize: FontSize(11.sp),
                              color: Colors.black,
                              fontFamily: 'Inter',
                            ),
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 8.w,
                      vertical: 3.h,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor.withOpacity(0.10),
                      borderRadius: BorderRadius.circular(20.r),
                      border: Border.all(
                        color: AppColors.primaryColor.withOpacity(0.35),
                        width: 0.6.w,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.local_fire_department_rounded,
                          color: AppColors.primaryColor,
                          size: 13.sp,
                        ),
                        SizedBox(width: 3.w),
                        AppTextWidget(
                          text: "Trending",
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryColor,
                        ),
                      ],
                    ),
                  ),

                  Row(
                    children: [
                      /// Rating:
                      Padding(
                        padding: EdgeInsets.only(
                          left: 1.0.w,
                          right: sessionController.selectedLanguageCode == "ar"
                              ? 4.w
                              : 0.w,
                        ),
                        child: Row(
                          children: List.generate(5, (index) {
                            if (4.5 >= index + 1) {
                              return Icon(
                                Icons.star,
                                color: Colors.black,
                                size: 15.sp,
                              );
                            } else if (4.5 > index && 4.5 < index + 1) {
                              return Icon(
                                Icons.star_half,
                                color: Colors.black,
                                size: 15.sp,
                              );
                            } else {
                              return Icon(
                                Icons.star_border,
                                color: Colors.grey,
                                size: 15.sp,
                              );
                            }
                          }),
                        ),
                      ),
                      4.w.sw,
                      Padding(
                        padding: EdgeInsets.only(
                          right: sessionController.selectedLanguageCode == "ar"
                              ? 4.w
                              : 0.w,
                        ),
                        child: AppTextWidget(
                          text: 4.5.toStringAsFixed(1),
                          fontSize: 10.sp,
                          maxLines: 1,
                        ),
                      ),
                      8.w.sw,
                      AppTextWidget(
                        text: "(${4})",
                        fontSize: 10.sp,
                        maxLines: 1,
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
