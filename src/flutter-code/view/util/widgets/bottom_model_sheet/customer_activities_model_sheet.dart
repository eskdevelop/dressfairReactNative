import '../routes/screens_library.dart';

void showCustomersActivityBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.44,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16.r)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ================= HEADER =================
            Padding(
              padding: EdgeInsets.only(left: 16.w, right: 16.w, top: 10.h),
              child: Row(
                children: [
                  Expanded(
                    child: AppTextWidget(
                      text: "Customers' activity",
                      textAlign: TextAlign.center,
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Icon(Icons.close, size: 22.sp),
                  ),
                ],
              ),
            ),

            SizedBox(height: 10.h),
            Divider(height: 1.h, thickness: 0.5),

            // ================= DESCRIPTION =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              child: AppTextWidget(
                text: "Keep up with the latest shopping trends.",
                fontSize: 12.sp,
                color: Colors.grey.shade700,
              ),
            ),

            // ================= TOGGLE =================
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppTextWidget(
                          text: "Customers' activity",
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w500,
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          "Showing others' shopping activities.",
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: true,
                    onChanged: (_) {},
                    activeColor: AppColors.primaryColor,
                    activeTrackColor: AppColors.primaryColor.withOpacity(0.35),
                    inactiveThumbColor: Colors.white,
                    inactiveTrackColor: Colors.grey.shade300,
                    trackOutlineColor: MaterialStateProperty.all(
                      Colors.transparent,
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 10.h),

            // ================= ILLUSTRATION =================
            Center(
              child: Container(
                height: 120.h,
                width: 220.w,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.shopping_cart_outlined,
                      size: 42.sp,
                      color: Colors.grey.shade300,
                    ),
                    SizedBox(height: 8.h),
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 10.w,
                        vertical: 4.h,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(20.r),
                      ),
                      child: Text(
                        "added to cart 5 min ago",
                        style: TextStyle(fontSize: 10.sp, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    },
  );
}
