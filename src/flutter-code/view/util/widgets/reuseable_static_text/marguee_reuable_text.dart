import 'package:marquee/marquee.dart';

import '../routes/screens_library.dart';

Widget staticTractOrderSlider(BuildContext context) {
  return Padding(
    padding: EdgeInsets.symmetric(horizontal: 12.0.w),
    child: Container(
      width: MediaQuery.sizeOf(context).width,
      height: 35.h,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.green, width: 1.w),
      ),
      child: Center(
        child: Marquee(
          text: "forAnyInquiryCallUs".tr,

          style: TextStyle(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
            color: Colors.green,
          ),
          scrollAxis: Axis.horizontal,
          crossAxisAlignment: CrossAxisAlignment.center,
          blankSpace: 50.0, // space after text before it repeats
          velocity: 50.0, // speed
          pauseAfterRound: Duration(seconds: 1), // pause before repeating
          startPadding: 10.0,
          accelerationDuration: Duration(seconds: 1),
          accelerationCurve: Curves.linear,
          decelerationDuration: Duration(milliseconds: 900),
          decelerationCurve: Curves.easeOut,
        ),
      ),
    ),
  );
}
