import 'dart:async';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/controller/simple_method/simple_methode.dart';
import 'package:dress_fair_ecommmerce/model/deals_model/deals_model.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/shadows_reuse/AppShadows.dart';
import 'package:intl/intl.dart';

import '../dialog/add_to_cart_dialog/add_to_cart_dialog.dart';

class DealsCard extends StatefulWidget {
  DealProductModel item;
  double fakeRating;
  int fakeReviews;

  final SessionController sessionController;

  DealsCard({
    super.key,
    required this.item,
    required this.sessionController,
    required this.fakeRating,
    required this.fakeReviews,
  });

  @override
  State<DealsCard> createState() => _DealsCardState();
}

class _DealsCardState extends State<DealsCard> {
  late Rx<Duration> remainingTime;
  late Timer timer;

  @override
  void initState() {
    super.initState();

    /// Use intl to parse date_start and date_end:
    final dateFormat = DateFormat("dd MMM yyyy");
    final now = DateTime.now();
    final startTime = dateFormat.parse(widget.item.price.dateStart);
    final endTime = dateFormat.parse(widget.item.price.dateEnd);

    /// Remaining time
    remainingTime = Rx(endTime.difference(now));

    // Timer to update every second
    timer = Timer.periodic(const Duration(seconds: 1), (_) {
      final newDuration = endTime.difference(DateTime.now());
      if (newDuration.isNegative) {
        remainingTime.value = Duration.zero;
        timer.cancel();
      } else {
        remainingTime.value = newDuration;
      }
    });
  }

  @override
  void dispose() {
    timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 3.0.w),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: AppShadows.softCardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            GestureDetector(
              onTap: () {
                Get.toNamed(
                  productDetailScreen,
                  arguments: {
                    "cateSlug": widget.item.productSku,
                    "categoryId":
                        int.tryParse(widget.item.productId.toString()) ?? 0,
                    "fakeReviews": 4,
                    "fakeRating": 4.5,
                  },
                );
              },
              child:
                  SimpleMethode.isSupportedFormat(
                    "${SimpleMethode.imageUrl}/${widget.item.images.first.image ?? ""}",
                  )
                  ? CachedNetworkImage(
                      memCacheWidth: 300,
                      height: 200.h,
                      // aspectRatio: 1,
                      imageUrl:
                          "${SimpleMethode.imageUrl}/${widget.item.images.first.image ?? ""}",
                      fit: BoxFit.cover,
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

            5.h.sh,
            Padding(
              padding: EdgeInsets.only(
                left: 3.0.w,
                right: widget.sessionController.selectedLanguageCode == "ar"
                    ? 4.w
                    : 0.w,
              ),
              child: AppTextWidget(
                text: widget.sessionController.selectedLanguageCode == "ar"
                    ? widget.item.nameAr
                    : widget.item.name,
                fontSize: 10.sp,
                maxLines: 1,
                fontWeight: FontWeight.normal,
              ),
            ),

            /// Slider
            Padding(
              padding: EdgeInsets.only(left: 3.0.w, right: 3.w),
              child: DealTimerWidget(
                days: int.parse(widget.item.timer.days),
                hours: int.parse(widget.item.timer.hours),
                minutes: int.parse(widget.item.timer.minutes),
                seconds: int.parse(widget.item.timer.seconds),
                percent: widget.item.timer.percent,
                isActive: widget.item.timer.status == 'active',
              ),
            ),

            ///
            Row(
              children: [
                Padding(
                  padding: EdgeInsets.only(
                    left: 1.0.w,
                    right: widget.sessionController.selectedLanguageCode == "ar"
                        ? 4.w
                        : 0.w,
                  ),
                  child: Row(
                    children: List.generate(5, (index) {
                      if (widget.fakeRating >= index + 1) {
                        return Icon(
                          Icons.star,
                          color: Colors.black,
                          size: 15.sp,
                        );
                      } else if (widget.fakeRating > index &&
                          widget.fakeRating < index + 1) {
                        return Icon(
                          Icons.star_half,
                          color: Colors.black,
                          size: 15.sp,
                        );
                      } else {
                        return Icon(
                          Icons.star_border,
                          color: Colors.grey,
                          size: 15.sp,
                        );
                      }
                    }),
                  ),
                ),
                4.w.sw,
                Padding(
                  padding: EdgeInsets.only(
                    right: widget.sessionController.selectedLanguageCode == "ar"
                        ? 4.w
                        : 0.w,
                  ),
                  child: AppTextWidget(
                    text: widget.fakeRating.toStringAsFixed(1),
                    fontSize: 10.sp,
                    maxLines: 1,
                  ),
                ),
                8.w.sw,
                AppTextWidget(
                  text: "(${widget.fakeReviews})",
                  fontSize: 10.sp,
                  maxLines: 1,
                ),
              ],
            ),

            _buildPriceRow(context),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceRow(BuildContext context) {
    final config = widget.sessionController.countryConfig.value;
    final currency = config?.currencyCode ?? '';

    final displayPrice = widget.item.price.getDisplayPrice();
    final cutPrice = widget.item.price.getCutPrice();

    return Row(
      children: [
        Padding(
          padding: EdgeInsets.only(
            left: 3.0.w,
            right: widget.sessionController.selectedLanguageCode == "ar"
                ? 4.w
                : 0.w,
          ),
          child: AppTextWidget(
            text: currency,
            fontSize: 10.sp,
            color: AppColors.primaryColor,
            fontWeight: FontWeight.w600,
          ),
        ),
        5.w.sw,
        Expanded(
          child:
              (cutPrice != null &&
                  cutPrice != 0.0 &&
                  cutPrice != 0 &&
                  cutPrice != 0.00)
              ? Row(
                  children: [
                    AppTextWidget(
                      text: displayPrice.toStringAsFixed(2),
                      fontSize: 12.sp,
                      color: AppColors.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                    SizedBox(width: 6.w),
                    AnimatedLineThrough(
                      color: Colors.grey.shade500,
                      duration: const Duration(milliseconds: 500),
                      isCrossed: true,
                      strokeWidth: 2,
                      child: AppTextWidget(
                        text: cutPrice.toStringAsFixed(2),
                        fontSize: 11.sp,
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                )
              : AppTextWidget(
                  text: displayPrice.toStringAsFixed(2),
                  fontSize: 12.sp,
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.bold,
                ),
        ),
        Padding(
          padding: EdgeInsets.only(
            right: 4.0.w,
            left: widget.sessionController.selectedLanguageCode == "ar"
                ? 4.w
                : 0.w,
            bottom: 1.h,
          ),
          child: GestureDetector(
            onTap: () {
              AddToCartBottomSheet.show(
                context,
                cateSlug: widget.item.productSku,
                categoryId: int.tryParse(widget.item.productId.toString()) ?? 0,
                fakeRating: widget.fakeRating,
                fakeReviews: widget.fakeReviews,
                //item.productId,
              );
            },
            child: Container(
              height: 23.h,
              width: 35.w,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(50.r),
                border: Border.all(color: Colors.black, width: 1.w),
              ),
              child: Center(
                child: SvgPicture.asset(height: 13.h, AppImages.shopIcon),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class DealTimerWidget extends StatefulWidget {
  final int days;
  final int hours;
  final int minutes;
  final int seconds;
  final double percent;
  final bool isActive;

  const DealTimerWidget({
    super.key,
    required this.days,
    required this.hours,
    required this.minutes,
    required this.seconds,
    required this.percent,
    this.isActive = true,
  });

  @override
  State<DealTimerWidget> createState() => _DealTimerWidgetState();
}

class _DealTimerWidgetState extends State<DealTimerWidget> {
  late int totalSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    totalSeconds =
        widget.days * 86400 +
        widget.hours * 3600 +
        widget.minutes * 60 +
        widget.seconds;

    if (widget.isActive && totalSeconds > 0) {
      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) {
          setState(() {
            totalSeconds = (totalSeconds - 1).clamp(0, totalSeconds);
          });
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isActive || totalSeconds <= 0) return const SizedBox();

    final days = totalSeconds ~/ 86400;
    final hours = (totalSeconds % 86400) ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    return Row(
      children: [
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final fullWidth = constraints.maxWidth;
              final progressWidth = fullWidth * (widget.percent / 100);

              return Stack(
                clipBehavior: Clip.none,
                children: [
                  // Background bar (thin)
                  Container(
                    height: 3.h, // smaller height
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  // Progress fill
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 500),
                    height: 3.h,
                    width: progressWidth,
                    decoration: BoxDecoration(
                      color: AppColors.primaryColor,
                      borderRadius: BorderRadius.circular(2.r),
                    ),
                  ),
                  // Small moving clock dot
                  Positioned(
                    left: (progressWidth - 8).clamp(0, fullWidth - 16.w),
                    //top: -4.3.h,
                    top: -4.4.h,
                    child: Container(
                      width: 12.w,
                      height: 12.w,
                      decoration: BoxDecoration(
                        color: AppColors.primaryColor,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.access_time,
                        color: Colors.white,
                        size: 8.sp,
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ),
        SizedBox(width: 4.w), // smaller spacing
        // Compact countdown
        AppTextWidget(
          text:
              '${days.toString().padLeft(2, '0')}:'
              '${hours.toString().padLeft(2, '0')}:'
              '${minutes.toString().padLeft(2, '0')}:'
              '${seconds.toString().padLeft(2, '0')}',
          fontSize: 9.sp, // smaller font
          fontWeight: FontWeight.w500,
          color: AppColors.primaryColor,
        ),
      ],
    );
  }
}
