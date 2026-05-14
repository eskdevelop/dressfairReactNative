import '../../../../../../../controller/category_controller/category_controller.dart';
import '../../../../../../../model/category_model/category_model.dart';
import '../../../cart_screens/check_out_screen/widgets/library_check_out.dart';
import '../tabs_screens/all_screen.dart';
import '../tabs_screens/category_tab_screen.dart';

class HomeCategoryTabs extends StatelessWidget {
  HomeCategoryTabs({super.key});

  final CategoryController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final tabCtrl = controller.tabController.value;
      final categories = controller.categories;

      /// Show a small loader during the brief moment when categories or
      /// the TabController are not yet aligned (e.g. cold start, refresh).
      if (tabCtrl == null ||
          categories.isEmpty ||
          tabCtrl.length != categories.length) {
        return Center(
          child: Padding(
            padding: EdgeInsets.only(top: 24.h),
            child: SpinKitFadingCircle(color: AppColors.greyColor, size: 28.sp),
          ),
        );
      }

      return Column(
        children: [
          /// 🔹 TAB BAR:
          TabBar(
            controller: tabCtrl,
            indicatorColor: Colors.transparent,
            isScrollable: true,
            labelColor: Colors.black,
            unselectedLabelColor: Colors.grey.shade600,
            tabAlignment: TabAlignment.start,
            padding: EdgeInsets.zero,
            labelPadding: EdgeInsets.symmetric(horizontal: 8.w),
            labelStyle: TextStyle(fontSize: 13.sp, fontWeight: FontWeight.w600),
            unselectedLabelStyle: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w500,
            ),
            tabs: controller.categories.map((cat) {
              return Tab(
                text: Get.locale?.languageCode == 'ar' ? cat.nameAr : cat.name,
              );
            }).toList(),
          ),

          /// 🔹 TAB VIEW
          Expanded(
            child: TabBarView(
              controller: tabCtrl,
              children: controller.categories
                  .map((cat) => _buildTabScreen(cat))
                  .toList(),
            ),
          ),
        ],
      );
    });
  }

  Widget _buildTabScreen(CategoryModel category) {
    /// "All" pseudo-category is inserted by CategoryController with id == 0
    /// and no slug. Everything else routes to the generic slug-based tab.
    final slug = (category.slug ?? '').trim();
    if (category.id == 0 || slug.isEmpty) {
      return const AllProductsScreen();
    }
    return CategoryTabScreen(category: category);
  }
}
