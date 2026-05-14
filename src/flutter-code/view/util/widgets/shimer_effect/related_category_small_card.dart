import 'package:dress_fair_ecommmerce/view/util/widgets/shadows_reuse/AppShadows.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shimmer/shimmer.dart';

class RelatedCategorySmallCardShimmer extends StatelessWidget {
  double height;
  RelatedCategorySmallCardShimmer({super.key, this.height = 300});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height.h,
      color: Colors.white,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 6.h),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 8,
          mainAxisSpacing: 10,
          childAspectRatio: 0.7,
        ),
        itemCount: 4,
        itemBuilder: (context, index) {
          return Container(
            width: 300.w,
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: AppShadows.glowBoxDim,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Shimmer.fromColors(
                      baseColor: Colors.grey.shade300,
                      highlightColor: Colors.grey.shade100,
                      child: Container(
                        height: 120.h,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.only(right: 5.0.w, bottom: 5.0.h),
                      child: Align(
                        alignment: Alignment.bottomRight,
                        child: Icon(
                          Icons.add_shopping_cart,
                          color: Colors.grey.shade400,
                          size: 18,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 5.h),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 0.0.w),
                  child: Shimmer.fromColors(
                    baseColor: Colors.grey.shade300,
                    highlightColor: Colors.grey.shade100,
                    child: Container(
                      height: 16.h,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(0.r),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 5.h),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 0.0.w),
                  child: Shimmer.fromColors(
                    baseColor: Colors.grey.shade300,
                    highlightColor: Colors.grey.shade100,
                    child: Container(
                      height: 16.h,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(0.r),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
