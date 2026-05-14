import 'package:dress_fair_ecommmerce/view/util/widgets/dialog/static_text_info_dialog/static_text_info_dialog.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class StaticTextContainerWithColor extends StatelessWidget {
  String text1;
  String text2;
  bool isShowIcon;
  StaticTextContainerWithColor({
    super.key,
    required this.text1,
    required this.text2,
    this.isShowIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => showInfoDialog(context),
      child: Container(
        width: MediaQuery.sizeOf(context).width,
        padding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 12.w),
        color: AppColors.primaryColor,
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: BouncingScrollPhysics(),
          child: Row(
            children: [
              Icon(
                Icons.check,
                color: Colors.white,
                size: 18.sp,
                fontWeight: FontWeight.w600,
              ),
              SizedBox(width: 6.w),
              Text(
                "freeShipping".tr,
                style: TextStyle(
                  fontSize: 10.sp,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              SizedBox(width: 8.w),
              Container(color: Colors.white, height: 16.h, width: 0.7.w),
              SizedBox(width: 6.w),
              Icon(
                Icons.check,
                color: Colors.white,
                size: 18.sp,
                fontWeight: FontWeight.w600,
              ),
              SizedBox(width: 6.w),
              Text(
                "payWhenYouReceiveYourOrder".tr,
                style: TextStyle(
                  fontSize: 10.sp,
                  color: Colors.white,
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
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
