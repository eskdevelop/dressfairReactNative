import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_detail_controller.dart';
import 'package:dress_fair_ecommmerce/model/language_model/language_model.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

import '../../../../../../../controller/category_controller/category_controller.dart';

class LanguageSelectionScreen extends StatefulWidget {
  const LanguageSelectionScreen({super.key});

  @override
  State<LanguageSelectionScreen> createState() =>
      _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  SessionController sessionController = Get.find<SessionController>();

  Future<void> clearAll(LanguageModel language) async {
    try {
      sessionController.isLanguageLoading.value = true;
      for (var lang in sessionController.languages) {
        lang.isSelected = false;
      }
      language.isSelected = true;
      sessionController.languages.refresh();
      setState(() {});

      // ✅ Save selected language code
      await UserPreferences.setLanguageCode(language.code);

      // ✅ Update GetX Locale immediately
      if (language.code == 'ar') {
        Get.updateLocale(const Locale('ar', 'SA'));
      } else {
        Get.updateLocale(const Locale('en', 'US'));
      }
      // ✅ Update controller for consistency:
      sessionController.loadSavedLanguage();
      final getAddToCartController = Get.find<GetAddToCartController>();
      final categoryController = Get.find<CategoryController>();
      final productDetailController = Get.find<ProductDetailController>();
      final controller = Get.find<ProductController>();

      /// Snapshot the current category slugs *before* clearing, so we can
      /// re-fetch products in the new language for the same categories.
      final slugsToRefresh = categoryController.categories
          .where((c) => c.id != 0 && (c.slug ?? '').trim().isNotEmpty)
          .map((c) => c.slug!.trim())
          .toList();

      categoryController.categories.clear();
      // productDetailController.relatedProduct.clear();

      /// Clear all per-category buckets in one shot.
      controller.allProducts.clear();
      controller.productsBySlug.clear();

      getAddToCartController.newArrivals.clear();
      getAddToCartController.bestSeller.clear();
      getAddToCartController.greatDay.clear();

      await Future.wait([
        categoryController.getCategories(),
        controller.getProducts(cateSlug: "", page: 1),
        for (final slug in slugsToRefresh)
          controller.getProducts(cateSlug: slug, page: 1),
      ]);
      //categoryController.mergeFeatureIntoCategories();
      sessionController.isLanguageLoading.value = false;
    } catch (e) {
      sessionController.isLanguageLoading.value = false;
      log("Error in Loading Language APs");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xfff3f3f3),
      //Colors.grey.shade100,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        foregroundColor: Colors.white,
        elevation: 0,
        leadingWidth: 38.w,
        leading: Padding(
          padding: EdgeInsets.only(right: 8.0.w),
          child: GestureDetector(
            onTap: () {
              Get.back();
            },
            child: Padding(
              padding: EdgeInsets.only(left: 10.0.w),
              child: SvgPicture.asset(AppImages.backArrow, color: Colors.black),
            ),
          ),
        ),
        title: AppTextWidget(
          text: "language".tr,
          fontWeight: FontWeight.w600,
          fontSize: 16.sp,
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        return sessionController.isLanguageLoading.value
            ? SpinKitFadingCircle(color: AppColors.greyColor, size: 30.0.sp)
            : ListView.builder(
                itemCount: sessionController.languages.length,
                itemBuilder: (context, index) {
                  return _languageTile(sessionController.languages[index]);
                },
              );
      }),
    );
  }

  Widget _languageTile(LanguageModel language) {
    return InkWell(
      onTap: () async {
        await clearAll(language);
      },
      child: Container(
        color: Colors.white,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Divider(thickness: 0.5, color: Colors.black.withOpacity(0.2)),
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: 12.0.w,
                vertical: 8.0.h,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  AppTextWidget(
                    text: language.name,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                  ),
                  if (language.isSelected)
                    Icon(Icons.check, color: Colors.black, size: 20.sp),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
