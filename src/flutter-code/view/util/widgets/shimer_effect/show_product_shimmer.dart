import 'package:shimmer/shimmer.dart';

import '../../../screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class ProductCardShimmer extends StatelessWidget {
  double height;
  ProductCardShimmer({super.key, this.height = 300});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height.h,
      color: Colors.white,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 6.h),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 8,
          mainAxisSpacing: 10,
          childAspectRatio: 0.72,
          // mainAxisExtent: MediaQuery.sizeOf(context).height * 0.286,
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
                Shimmer.fromColors(
                  baseColor: Colors.grey.shade300,
                  highlightColor: Colors.grey.shade100,
                  child: Container(
                    height: 150.h,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                  ),
                ),
                SizedBox(height: 10.h),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.0.w),
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
                SizedBox(height: 10.h),

                ///
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.0.w),
                  child: SizedBox(
                    height: 20.h,
                    width: double.maxFinite,

                    //50.w,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Shimmer.fromColors(
                          baseColor: Colors.grey.shade300,
                          highlightColor: Colors.grey.shade100,
                          child: Container(
                            height: 50.h,
                            width: 40.w,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(0.r),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                          ),
                        ),
                        SizedBox(width: 10.w),
                        Shimmer.fromColors(
                          baseColor: Colors.grey.shade300,
                          highlightColor: Colors.grey.shade100,
                          child: Container(
                            height: 50.h,
                            width: 50.w,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(0.r),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                          ),
                        ),
                        Spacer(),
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            Shimmer.fromColors(
                              baseColor: Colors.grey.shade300,
                              highlightColor: Colors.grey.shade100,
                              child: Container(
                                height: 50.h,
                                width: 50.w,
                                decoration: BoxDecoration(color: Colors.white),
                              ),
                            ),
                            Icon(
                              Icons.add_shopping_cart,
                              color: Colors.grey.shade400,
                              size: 18,
                            ),
                          ],
                        ),
                      ],
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

class SpinLoadingBar extends StatelessWidget {
  const SpinLoadingBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SpinKitFadingCircle(color: AppColors.greyColor, size: 50.sp),
    );
  }
}
