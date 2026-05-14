import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:shimmer/shimmer.dart';

class AddToCartShimmerDialog extends StatelessWidget {
  const AddToCartShimmerDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Title Shimmer
          Container(
            width: double.infinity,
            height: 20.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),
          Container(
            width: MediaQuery.of(context).size.width * 0.7,
            height: 16.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),

          // Product Code Shimmer
          Container(
            width: 150.w,
            height: 14.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),

          // Price Shimmer
          Container(
            width: 80.w,
            height: 18.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),

          // Colors Section Shimmer
          Container(
            width: 60.w,
            height: 16.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),
          Row(
            children: List.generate(
              3,
              (index) => Padding(
                padding: EdgeInsets.only(right: 8.w),
                child: Container(
                  width: 60.w,
                  height: 60.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(height: 8.h),

          // Sizes Section Shimmer
          Container(
            width: 50.w,
            height: 16.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4.r),
            ),
          ),
          SizedBox(height: 8.h),
          Row(
            children: List.generate(
              3,
              (index) => Padding(
                padding: EdgeInsets.only(right: 8.w),
                child: Container(
                  width: 40.w,
                  height: 35.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(height: 8.h),

          // Quantity Section Shimmer
          Row(
            children: [
              Container(
                width: 40.w,
                height: 16.h,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4.r),
                ),
              ),
              SizedBox(width: 12.w),
              Container(
                width: 120.w,
                height: 36.h,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8.r),
                ),
              ),
            ],
          ),
          SizedBox(height: 10.h),

          // Add to Cart Button Shimmer
          Container(
            width: double.infinity,
            height: 48.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.r),
            ),
          ),
          SizedBox(height: 12.h),

          // View Detail Button Shimmer
          Container(
            width: double.infinity,
            height: 48.h,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8.r),
            ),
          ),
        ],
      ),
    );
  }
}
