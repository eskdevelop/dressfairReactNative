import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:marquee/marquee.dart';

Widget staticSlider(BuildContext context) {
  return Padding(
    padding: EdgeInsets.symmetric(horizontal: 12.0.w),
    child: Container(
      width: MediaQuery.sizeOf(context).width,
      height: 25.h,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: Colors.green, width: 1.w),
      ),
      child: Center(
        child: Marquee(
          text: "allDataIsSafeGuarded".tr,

          style: TextStyle(
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            color: Colors.green,
          ),
          scrollAxis: Axis.horizontal,
          crossAxisAlignment: CrossAxisAlignment.center,
          blankSpace: 50.0,
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
