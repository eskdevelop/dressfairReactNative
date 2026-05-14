import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shimmer/shimmer.dart';

class SearchScreenShimmer extends StatelessWidget {
  const SearchScreenShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 12.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 20.h),

              /// 💫 Beautiful Search Bar shimmer
              _buildSearchBarShimmer(),

              SizedBox(height: 25.h),

              /// 🔹 Recently searched heading shimmer
              _buildHeadingShimmer("Recently searched"),

              SizedBox(height: 8.h),

              /// 🕓 Recent searched shimmer list
              _buildListShimmer(itemCount: 3),

              SizedBox(height: 25.h),

              /// 🔹 Popular right now heading shimmer
              _buildHeadingShimmer("Popular right now"),

              SizedBox(height: 8.h),

              /// 🕓 Popular list shimmer
              Expanded(child: _buildListShimmer(itemCount: 10)),
            ],
          ),
        ),
      ),
    );
  }

  /// 🟩 Search Bar shimmer effect
  Widget _buildSearchBarShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: 45.h,
        decoration: BoxDecoration(
          color: Colors.grey.shade300,
          borderRadius: BorderRadius.circular(10.r),
        ),
        child: Row(
          children: [
            SizedBox(width: 12.w),
            Container(
              height: 25.h,
              width: 25.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6.r),
              ),
            ),
            SizedBox(width: 12.w),
            Expanded(
              child: Container(
                height: 20.h,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6.r),
                ),
              ),
            ),
            SizedBox(width: 12.w),
            Container(
              height: 30.h,
              width: 40.w,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8.r),
              ),
            ),
            SizedBox(width: 8.w),
          ],
        ),
      ),
    );
  }

  /// 🔹 Heading shimmer text
  Widget _buildHeadingShimmer(String text) {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Container(
        height: 14.h,
        width: 150.w,
        decoration: BoxDecoration(
          color: Colors.grey.shade300,
          borderRadius: BorderRadius.circular(4.r),
        ),
      ),
    );
  }

  /// 🧩 Reusable list shimmer builder
  Widget _buildListShimmer({required int itemCount}) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: itemCount,
      separatorBuilder: (_, __) => SizedBox(height: 10.h),
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey.shade300,
          highlightColor: Colors.grey.shade100,
          child: Row(
            children: [
              /// Circle image placeholder
              Container(
                width: 35.w,
                height: 35.h,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
              ),
              SizedBox(width: 10.w),

              /// Text line placeholder
              Expanded(
                child: Container(
                  height: 16.h,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(4.r),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
