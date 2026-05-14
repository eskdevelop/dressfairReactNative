import '../../../util/widgets/routes/screens_library.dart';

class UpdateNameBottomSheet extends StatelessWidget {
  const UpdateNameBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      // For keyboard
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                children: [
                  Expanded(
                    child: Text(
                      "Enter a new Name",
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(Icons.close, size: 22.sp, color: Colors.black),
                  ),
                ],
              ),

              12.h.verticalSpace,

              // Description
              Text(
                "Please enter a new Name you would like to associate with your account below.",
                style: TextStyle(
                  fontSize: 12.sp,
                  color: Colors.grey[700],
                  height: 1.4,
                ),
              ),

              16.h.verticalSpace,

              // Input field
              Container(
                height: 44.h,
                padding: EdgeInsets.symmetric(horizontal: 12.w),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: TextField(
                  keyboardType: TextInputType.emailAddress,
                  style: TextStyle(fontSize: 13.sp),
                  decoration: InputDecoration(
                    hintText: "Enter your Name address",
                    hintStyle: TextStyle(
                      fontSize: 12.sp,
                      color: Colors.grey[400],
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),

              18.h.verticalSpace,

              // Continue Button
              SizedBox(
                width: double.infinity,
                height: 44.h,
                child: ElevatedButton(
                  onPressed: () {
                    // handle submit
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFF8C00), //  orange
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(22.r),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    "Continue",
                    style: TextStyle(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),

              12.h.verticalSpace,
            ],
          ),
        ),
      ),
    );
  }
}
