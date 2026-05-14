import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

Widget searchBarWithText({
  required BuildContext context,
  required String text,
}) {
  return GestureDetector(
    onTap: () {
      Get.toNamed(searchScreen);
    },
    child: Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.0.w),
      child: Container(
        height: 42.h,
        width: MediaQuery.sizeOf(context).width,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(7.r),
          border: Border.all(
            color: Colors.black.withOpacity(0.5),
            width: 0.5.w,
          ),
        ),
        child: Row(
          children: [
            20.w.sw,
            AppTextWidget(
              text: "Search",
              color: Colors.black.withOpacity(0.6),
              fontWeight: FontWeight.w500,
              fontSize: 14.sp,
            ),
            SizedBox(width: MediaQuery.sizeOf(context).width * 0.43),
            Icon(Icons.camera_alt, size: 25.sp, color: Colors.transparent),
            20.w.sw,
            Container(
              height: 30.h,
              width: 40.w,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(30.r),
              ),
              child: Center(
                child: Icon(Icons.search, color: Colors.white, size: 22.sp),
              ),
            ),
            20.w.sw,
          ],
        ),
      ),
    ),
  );
}
