import 'dart:developer';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../controller/simple_method/simple_methode.dart';

class CategoryItemWidget extends StatelessWidget {
  final String? imageUrl;
  final String title;
  final VoidCallback onTap;
  final bool isViewAll;
  double height;
  double width;

  CategoryItemWidget({
    super.key,
    this.imageUrl,
    required this.title,
    required this.onTap,
    this.isViewAll = false,
    this.height = 60,
    this.width = 60,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: height.h,
            width: width.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey.shade200,
            ),
            child: ClipOval(
              child: isViewAll
                  ? Icon(Icons.apps, size: 28.sp, color: Colors.blue)
                  : SimpleMethode.isSupportedFormat(
                      "${SimpleMethode.imageUrl}/$imageUrl",
                      //"https://ecomdoor-images.s3.ap-southeast-1.amazonaws.com/productimages/6934413bdb914_A-08-7.jpg",
                    )
                  ? CachedNetworkImage(
                      memCacheWidth: 300,
                      fadeInDuration: Duration(milliseconds: 200),
                      imageUrl: "${SimpleMethode.imageUrl}/$imageUrl",
                      //imageUrl ?? "",
                      fit: BoxFit.cover,
                      // placeholder: (context, url) => Center(
                      //   child: CircularProgressIndicator(
                      //     strokeWidth: 1.w,
                      //     color: AppColors.primaryColor,
                      //   ),
                      // ),
                      errorWidget: (context, url, error) {
                        log("Error == ${error.toString()}");
                        return Center(
                          child: SvgPicture.asset(
                            color: Colors.red,
                            height: 80.h,
                            AppImages.placeHolder,
                          ),
                        );
                      },
                    )
                  : Container(
                      color: Colors.grey[200],
                      child: const Icon(
                        Icons.image_not_supported,
                        color: Colors.grey,
                      ),
                    ),
            ),
          ),
          SizedBox(height: 6.h),
          AppTextWidget(
            text: title,
            fontSize: 10.sp,
            fontWeight: FontWeight.w400,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
