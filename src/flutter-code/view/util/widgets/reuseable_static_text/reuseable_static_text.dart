import 'package:dress_fair_ecommmerce/view/util/widgets/bottom_model_sheet/available_offers_sheet.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class StaticTextContainer extends StatelessWidget {
  String text1;
  String text2;
  bool isShowIcon;
  StaticTextContainer({
    super.key,
    required this.text1,
    required this.text2,
    this.isShowIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => OfferBottomSheet.show(context),
      child: Container(
        width: MediaQuery.sizeOf(context).width,
        padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
        decoration: BoxDecoration(color: AppColors.primaryColor),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(Icons.check, color: Colors.white, size: 18.sp),
              SizedBox(width: 6.w),
              Text(
                'freeShipping'.tr,
                style: TextStyle(
                  fontSize: 10.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(width: 10.w),
              Container(
                color: Colors.white,

                ///AppColors.primaryColor.withOpacity(0.5),
                height: 16.h,
                width: 0.8.w,
              ),

              SizedBox(width: 10.w),
              Icon(Icons.check, color: AppColors.whiteColor, size: 18.sp),
              SizedBox(width: 6.w),

              Text(
                'payWhenYouReceiveYourOrder'.tr,
                style: TextStyle(
                  fontSize: 10.sp,
                  color: Colors.white,
                  //AppColors.darkGreyText,
                  fontWeight: FontWeight.w500,
                ),
              ),
              isShowIcon ? 13.w.sw : 0.w.sw,
              Visibility(
                visible: isShowIcon,
                child: Icon(
                  Icons.arrow_forward_ios,
                  size: 12.sp,
                  color: Colors.white,
                  //AppColors.primaryColor,
                ),
              ),
            ],
          ),
        ),
      ),

      // Container(
      //   width: MediaQuery.sizeOf(context).width,
      //   padding: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
      //   color: Colors.orange.shade50,
      //   child: SingleChildScrollView(
      //     scrollDirection: Axis.horizontal,
      //     physics: BouncingScrollPhysics(),
      //     child: Row(
      //       children: [
      //         Icon(
      //           Icons.check,
      //           color: Colors.green,
      //           size: 18.sp,
      //           fontWeight: FontWeight.w600,
      //         ),
      //
      //         SizedBox(width: 6.w),
      //         Text(
      //           'freeShipping'.tr,
      //           style: TextStyle(
      //             fontSize: 10.sp,
      //             color: Colors.green,
      //             fontWeight: FontWeight.w500,
      //           ),
      //         ),
      //         SizedBox(width: 8.w),
      //         Container(color: Colors.green, height: 16.h, width: 0.7.w),
      //         SizedBox(width: 6.w),
      //         Icon(
      //           Icons.check,
      //           color: Colors.green,
      //           size: 18.sp,
      //           fontWeight: FontWeight.w600,
      //         ),
      //
      //         SizedBox(width: 6.w),
      //         Text(
      //           'payWhenYouReceiveYourOrder'.tr,
      //           style: TextStyle(
      //             fontSize: 10.sp,
      //             color: Colors.green,
      //             fontWeight: FontWeight.w500,
      //           ),
      //         ),
      //         isShowIcon ? 13.w.sw : 0.w.sw,
      //         Visibility(
      //           visible: isShowIcon,
      //           child: Icon(
      //             Icons.arrow_forward_ios,
      //             size: 12.sp,
      //             color: Colors.green,
      //           ),
      //         ),
      //       ],
      //     ),
      //   ),
      // ),
    );
  }
}
