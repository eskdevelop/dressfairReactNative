import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class HomeSearchBar extends StatefulWidget {
  const HomeSearchBar({super.key});

  @override
  State<HomeSearchBar> createState() => _HomeSearchBarState();
}

class _HomeSearchBarState extends State<HomeSearchBar> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Get.toNamed(searchScreen);
      },
      child: Container(
        padding: EdgeInsets.only(left: 16.w, top: 4.h, bottom: 4.h, right: 6.w),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(
            color: Colors.black.withOpacity(0.5),
            width: 1.9.w,
          ),
          borderRadius: BorderRadius.circular(30.r),
        ),
        child: Row(
          children: [
            Padding(
              padding: EdgeInsets.only(right: 8.0.w),
              child: Text(
                "searchDressFair".tr,
                style: TextStyle(color: Colors.black54, fontSize: 14.sp),
              ),
            ),
            Spacer(),
            Icon(
              Icons.camera_alt,
              size: 28.sp,
              color: Colors.transparent,
              // Colors.black.withOpacity(0.9),
            ),
            10.w.sw,
            Container(
              height: 28.h,
              width: 40.w,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(15.r),
              ),
              child: Center(
                child: Icon(Icons.search, color: Colors.white, size: 20.sp),
              ),
            ),
            5.w.sw,
          ],
        ),
      ),
    );
  }
}
