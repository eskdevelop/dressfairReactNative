import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

void showInfoDialog(BuildContext context) {
  showDialog(
    context: context,
    barrierDismissible: true,
    barrierColor: Colors.black.withOpacity(0.5),
    builder: (context) {
      return Dialog(
        backgroundColor: Colors.white,
        insetPadding: EdgeInsets.symmetric(horizontal: 30.w),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Close icon top right
              Align(
                alignment: Alignment.topRight,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Icon(Icons.close, color: Colors.black54, size: 20.sp),
                ),
              ),
              SizedBox(height: 4.h),

              // Title
              Text(
                "freeShipping".tr,
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 10.h),

              // Description list
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "freeStandardShippingOnAllOrders".tr,
                    style: TextStyle(fontSize: 13.sp, color: Colors.black87),
                  ),
                  SizedBox(height: 6.h),
                  Text(
                    "getACredit".tr,
                    style: TextStyle(fontSize: 13.sp, color: Colors.black87),
                  ),
                  SizedBox(height: 6.h),
                  Text(
                    "dressFairHasOrderMinimums".tr,
                    style: TextStyle(fontSize: 13.sp, color: Colors.black87),
                  ),
                ],
              ),

              SizedBox(height: 20.h),

              // OK button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF7A00),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 12.h),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    "oK".tr,
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
  );
}
