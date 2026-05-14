import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:shimmer/shimmer.dart';

class FilterRowShimmer extends StatelessWidget {
  const FilterRowShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    final List<double> widths = [80.w, 60.w, 60.w, 60.w, 40.w];
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.0.w, vertical: 8.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: widths.map((width) {
          return Padding(
            padding: EdgeInsets.only(right: 8.0.w),
            child: Shimmer.fromColors(
              baseColor: Colors.grey.shade300,
              highlightColor: Colors.grey.shade100,
              child: Container(
                width: width,
                height: 30.h,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(20.r),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
