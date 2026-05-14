import 'dart:async';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_filtered_data_controller/get_filtered_data_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

void showFilterPopupMenu(
  BuildContext context,
  Map<String, dynamic> item,
  Offset position,
  String cateSlug,
) {
  final GetFilteredDataController getFilteredDataController =
      Get.find<GetFilteredDataController>();
  final List<dynamic> values = (item['values'] is List)
      ? item['values'] as List
      : [];

  final RenderBox overlay =
      Overlay.of(context).context.findRenderObject() as RenderBox;

  showMenu(
    context: context,
    color: Colors.white,
    elevation: 6,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0.r)),
    position: RelativeRect.fromLTRB(0, position.dy + 10, 0, 0),
    constraints: BoxConstraints(
      minWidth: overlay.size.width,
      maxWidth: overlay.size.width,
      maxHeight: 300.h,
    ),
    items: values.isNotEmpty
        ? [
            PopupMenuItem(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              height: 0,
              enabled: false,
              child: (item['type']?.toString() == 'sort')
                  ? _buildSortOptions(context, values, cateSlug)
                  : _buildChipOptions(context, item, values, cateSlug),
            ),
          ]
        : [
            PopupMenuItem(
              enabled: false,
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'No options available',
                  style: TextStyle(color: Colors.black54, fontSize: 13.sp),
                ),
              ),
            ),
          ],
  ).then((selected) {
    final GetFilteredDataController getFilteredDataController =
        Get.find<GetFilteredDataController>();

    if (selected == null) return;
    final type = item['type']?.toString() ?? '';

    // Apply button pressed → just close popup:
    if (selected == 'apply') {
      log('✅ Apply pressed — popup closed, API already called earlier');
      return;
    }
    // Reset button pressed:
    if (selected == 'reset') {
      for (var v in item['values']) {
        v['isSelected'] = false;
      }
      getFilteredDataController.unifiedFilters.refresh();
      getFilteredDataController.applyFilters(
        sort: '',
        order: '',
        cateSlug: cateSlug,
      );
      return;
    }

    // ✅ Chip option tapped manually (rare fallback):
    if (selected is Map<String, dynamic>) {
      if (type == 'sort') {
        for (var val in item['values']) {
          val['isSelected'] = false;
        }
        selected['isSelected'] = true;
      } else if (type == 'color' || type == 'attribute' || type == 'size') {
        selected['isSelected'] = !(selected['isSelected'] ?? false);
      }

      log('✅ Updated selection in ${item['name']}');
      getFilteredDataController.unifiedFilters.refresh();
    }
  });
}

/// Build sort options
Widget _buildSortOptions(
  BuildContext context,
  List<dynamic> values,
  String cateSlug,
) {
  return Column(
    mainAxisSize: MainAxisSize.min,
    children: values.asMap().entries.map((entry) {
      int index = entry.key;
      var option = entry.value;

      return GestureDetector(
        onTap: () {
          final GetFilteredDataController controller =
              Get.find<GetFilteredDataController>();
          // 1️⃣ Update selection
          for (var val in values) {
            val['isSelected'] = false;
          }
          option['isSelected'] = true;
          controller.unifiedFilters.refresh();

          switch (option['id']) {
            case 'default':
              log("default");
              controller.applyFilters(cateSlug: cateSlug, sort: "", order: "");
              break;
            case 'new_arrival':
              log("new_arrival");
              controller.applyFilters(
                cateSlug: cateSlug,
                sort: "date_added",
                order: "desc",
              );
              break;
            case 'popular':
              log("popular");
              controller.applyFilters(
                cateSlug: cateSlug,
                sort: "p.viewed",
                order: "asc",
              );
              break;
            case 'low_high':
              log("low_high");
              controller.applyFilters(
                cateSlug: cateSlug,
                sort: "p.price",
                order: "asc",
              );
              break;
            case 'high_low':
              log("high_low");

              controller.applyFilters(
                cateSlug: cateSlug,
                sort: "p.price",
                order: "desc",
              );
              break;
          }
          ///////
          // 3️⃣ Immediately call API with selected sort

          // 4️⃣ Close the popup menu after selection
          Navigator.of(context).pop(option);
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              child: Row(
                children: [
                  Expanded(
                    child: AppTextWidget(
                      text: option['text'].toString(),
                      fontSize: 12.sp,
                      fontWeight: (option['isSelected'] ?? false)
                          ? FontWeight.w600
                          : FontWeight.w400,
                      color: (option['isSelected'] ?? false)
                          ? Colors.black
                          : Colors.black.withOpacity(0.6),
                    ),
                  ),
                  if (option['isSelected'] ?? false)
                    Icon(
                      Icons.check,
                      color: AppColors.primaryColor,
                      size: 22.sp,
                    ),
                ],
              ),
            ),
            if (index != values.length - 1)
              Divider(height: 1.h, color: Colors.grey[300]),
          ],
        ),
      );
    }).toList(),
  );
}

/// Build filter chip options
Widget _buildChipOptions(
  BuildContext context,
  Map<String, dynamic> item,
  List<dynamic> values,
  String cateSlug,
) {
  final GetFilteredDataController controller =
      Get.find<GetFilteredDataController>();

  // ✅ Keep debounce outside Obx so it persists
  Timer? debounceTimer;

  return StatefulBuilder(
    builder: (context, setState) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 8.w,
            runSpacing: 8.h,
            children: values.map((option) {
              final bool isSelected = option['isSelected'] ?? false;
              return GestureDetector(
                onTap: () {
                  // toggle selection
                  option['isSelected'] = !isSelected;
                  setState(() {}); // rebuild local state for chip color
                  controller.unifiedFilters.refresh();

                  // ✅ Call API immediately with debounce
                  debounceTimer?.cancel();
                  debounceTimer = Timer(const Duration(milliseconds: 300), () {
                    controller.applyFilters(
                      cateSlug: cateSlug,
                      sort: '',
                      order: '',
                    );
                  });
                },
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 6.h,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xffF5F5F5),
                    borderRadius: BorderRadius.circular(30.r),
                    border: Border.all(
                      color: isSelected ? Colors.black : Colors.transparent,
                      width: 1,
                    ),
                  ),
                  child: AppTextWidget(
                    text: option['text'].toString(),
                    fontSize: 10.sp,
                    fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                    color: isSelected
                        ? Colors.black
                        : Colors.black.withOpacity(0.9),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              );
            }).toList(),
          ),
          SizedBox(height: 14.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GestureDetector(
                onTap: () {
                  for (var v in values) {
                    v['isSelected'] = false;
                  }
                  setState(() {});
                  controller.unifiedFilters.refresh();
                  Navigator.of(context).pop('reset');
                },
                child: Container(
                  width: 82.w,
                  height: 32.h,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30.r),
                    border: Border.all(color: Colors.black.withOpacity(0.5)),
                  ),
                  child: Center(
                    child: AppTextWidget(
                      text: "Reset",
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w500,
                      color: Colors.black.withOpacity(0.9),
                    ),
                  ),
                ),
              ),
              SizedBox(width: 8.w),
              AppButton(
                width: 160.w,
                height: 35.h,
                onTap: () {
                  Navigator.of(context).pop('apply');
                },
                textStyle: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                  fontSize: 12.sp,
                ),
                borderRadius: 20.r,
                isLoading: false.obs,
                text: "Show results",
              ),
            ],
          ),
        ],
      );
    },
  );
}
