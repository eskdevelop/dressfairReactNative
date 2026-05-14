import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/model/get_filter_data_model/get_filter_data_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/get_filter_data_repository/get_filter_data_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../more_describe_product_controller/more_describe_product_controller.dart';

class GetFilteredDataController extends GetxController {
  RxBool isLoading = false.obs;
  final GetFilterDataRepository apiRepository = GetFilterDataRepository();
  SessionController sessionController = Get.find<SessionController>();
  Rxn<ProductFilterData> filteredData = Rxn<ProductFilterData>();
  RxList<dynamic> unifiedFilters = <dynamic>[].obs;

  /// Build a single unified structure used by UI for all filter chips.
  /// Each value item will contain consistent keys: { "id": ..., "text": ..., "isSelected": bool }
  void buildUnifiedFilterList() {
    final data = filteredData.value;
    if (data == null) return;
    final tempList = <Map<String, dynamic>>[];
    // Clear old filters first
    unifiedFilters.clear();
    // 1️⃣ Sort chip (single selection style)
    tempList.add({
      "type": "sort",
      "name": "Sort By",
      "values": [
        {"id": "default", "text": "Default", "isSelected": false},
        {"id": "new_arrival", "text": "New Arrival", "isSelected": false},
        {"id": "low_high", "text": "Price Low to High", "isSelected": false},
        {"id": "high_low", "text": "Price High to Low", "isSelected": false},
      ],
    });

    // 2️⃣ Colors (keeps original 'color' type used by UI)
    if (data.colors.isNotEmpty) {
      final seen = <String>{};
      tempList.add({
        "type": "color",
        "name": "Color",
        "values": data.colors
            .where((e) => seen.add(e.name))
            .map(
              (e) => {
                "id": e.optionValueId,
                "text": e.name,
                "isSelected": false,
              },
            )
            .toList(),
      });
    }
    // 2.5️⃣ Sizes (optional — handle safely if some categories don't have it):
    try {
      final dynamic dynData = data;
      if (dynData.sizes != null &&
          dynData.sizes is List &&
          dynData.sizes.isNotEmpty) {
        final sizes = dynData.sizes as List;
        final seen = <String>{};
        tempList.add({
          "type": "size",
          "name": "Size",
          "values": sizes
              .where(
                (e) =>
                    seen.add((e as dynamic).name?.toString() ?? e.toString()),
              )
              .map((e) {
                final dyn = e as dynamic;
                return {
                  "id": dyn.optionValueId ?? dyn.id ?? dyn.name,
                  "text": dyn.name?.toString() ?? dyn.toString(),
                  "isSelected": false,
                };
              })
              .toList(),
        });
      }
    } catch (e) {
      log("⚠️ No sizes found or invalid format: $e");
    }

    // 3️⃣ Attributes (each attribute group becomes a separate type='attribute' group)
    if (data.attributes.isNotEmpty) {
      for (final attr in data.attributes) {
        final seenAttr = <String>{};
        tempList.add({
          "type": "attribute",
          "name": attr.name,
          "attribute_id": attr.attributeId,
          "values": attr.values
              .where((v) => seenAttr.add(v.text))
              .map(
                (v) => {
                  "id": v.attributeId,
                  "text": v.text,
                  "isSelected": false,
                },
              )
              .toList(),
        });
      }
    }

    // ✅ Finally, assign built list to reactive filter list
    unifiedFilters.assignAll(tempList);
  }

  /// Get filter meta-data from API and build unified list for UI.
  Future<void> getFilteredData({required int categoryId}) async {
    if (await InternetController.checkUserConnection()) {
      try {
        isLoading.value = true;
        var response = await apiRepository.getFilteredData(
          sessionToken: sessionController.sessionToken.value,
          categoryId: categoryId,
        );
        if (response != null && response["success"] == 1) {
          if (response['data'] != null && response['data'] is Map) {
            filteredData.value = ProductFilterData.fromJson(response['data']);
            // Rebuild unified filters (only if empty — prevents overwriting user's selections)
            if (unifiedFilters.isEmpty) {
              buildUnifiedFilterList();
            }
          } else {
            log("Error in Get filtered API: unexpected data format");
          }
        } else {
          AppToast.showError(
            (response?["error"] as List?)?.isNotEmpty == true
                ? response["error"][0]
                : "Something went wrong",
          );
        }
      } catch (e) {
        log("Error in Get Filtered Data = ${e.toString()}");
        AppToast.showError(ErrorHandler.getErrorMessage(e));
      } finally {
        isLoading.value = false;
      }
    } else {
      AppToast.showError("internetDisconnected".tr);
    }
  }

  /// --- Helpers to collect user selected filters and return strings ready for the API ---
  /// Returns:
  /// {
  ///   'option_value': '12,15',
  ///   'size_value': '3',
  ///   'attribute_value': 'Formal Dress,Maxi Dress'
  /// }
  Map<String, String> getSelectedFilterValues() {
    final optionValue = _collectSelectedIdsFromType(
      'color',
    ); // color -> option_value
    final sizeValue = _collectSelectedIdsFromType('size');
    final attributeValue = _collectSelectedTextsFromAttributes();

    return {
      'option_value': optionValue,
      'size_value': sizeValue,
      'attribute_value': attributeValue,
    };
  }

  /// Collect selected item IDs for a group type, joined by comma.
  String _collectSelectedIdsFromType(String type) {
    try {
      final groups = unifiedFilters.where((f) => f['type'] == type);
      if (groups.isEmpty) return '';

      // usually there will be a single group for 'color' or 'size'
      final values = (groups.first)['values'] as List<dynamic>;
      final selected = values
          .where((v) => (v['isSelected'] ?? false) == true)
          .map((v) => v['id']?.toString() ?? '')
          .where((s) => s.isNotEmpty)
          .toList();

      return selected.join(',');
    } catch (e) {
      // if something unexpected happens, return empty string (safe)
      log('Error collecting selected ids for type $type: $e');
      return '';
    }
  }

  /// For attributes we typically need the text labels joined by comma for the API
  /// (e.g. "Formal Dress,Maxi Dress"). We collect selected texts across all attribute groups.
  String _collectSelectedTextsFromAttributes() {
    try {
      final attrGroups = unifiedFilters.where((f) => f['type'] == 'attribute');
      if (attrGroups.isEmpty) return '';

      final selected = <String>[];
      for (final g in attrGroups) {
        final values = g['values'] as List<dynamic>;
        for (final v in values) {
          if ((v['isSelected'] ?? false) == true) {
            final t = v['text']?.toString() ?? '';
            if (t.isNotEmpty) selected.add(t);
          }
        }
      }
      return selected.join(',');
    } catch (e) {
      log('Error collecting attribute texts: $e');
      return '';
    }
  }
  // ---------------------- ADD THESE METHODS INSIDE GetFilteredDataController ----------------------

  /// Apply filters: collect selections and call MoreDescribeProductController to reload products.
  /// You can pass cateSlug if available (defaults to empty string).
  void applyFilters({
    String cateSlug = '',
    required String sort,
    required String order,
  }) {
    try {
      final selected = getSelectedFilterValues();
      // Find the MoreDescribeProductController and call its applyFilters
      final moreCtrl = Get.find<MoreDescribeProductController>();
      log("Sort 123 :$sort");
      log("order 123 :$order");
      moreCtrl.applyFilter(
        cateSlug: cateSlug,
        optionValue: selected['option_value'] ?? '',
        sizeValue: selected['size_value'] ?? '',
        attributeValue: selected['attribute_value'] ?? '',
        page: 1,
        sort: sort,
        order: order,
      );
      // Refresh unifiedFilters to update UI (optional, but safe)
      unifiedFilters.refresh();
    } catch (e) {
      log('Error applying filters: $e');
    }
  }

  void clearAllSelections() {
    for (var filter in unifiedFilters) {
      if (filter['type'] != 'sort') {
        final values = filter['values'] as List<dynamic>;
        for (var value in values) {
          value['isSelected'] = false;
        }
      } else {
        // For sort, reset to default
        final values = filter['values'] as List<dynamic>;
        for (var value in values) {
          value['isSelected'] = value['id'] == 'default';
        }
      }
    }
    unifiedFilters.refresh();
    log("🧹 Cleared all filter selections");
  }

  // ---------------------- END OF ADDITIONS ----------------------
}
