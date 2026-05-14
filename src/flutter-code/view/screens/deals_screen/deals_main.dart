import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_Baby_and_toddler.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_automotive_and_accessories.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_bags_and_luggages.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_beauty_and_health.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_cell_phone_accessories.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_home_and_kitchen.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_jewlery_and_accessories.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_men_clothings.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_women_clothing.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_women_lingeries.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/deals_women_shoes.dart';
import 'package:dress_fair_ecommmerce/view/screens/deals_screen/widget/recommended_deals_screen.dart';

import '../../../../../../../controller/category_controller/category_controller.dart';
import '../../../../../../../model/category_model/category_model.dart';
import '../../util/widgets/routes/screens_library.dart';

class DealsMainTabs extends StatefulWidget {
  const DealsMainTabs({super.key});

  @override
  State<DealsMainTabs> createState() => _DealsMainTabsState();
}

class _DealsMainTabsState extends State<DealsMainTabs>
    with AutomaticKeepAliveClientMixin {
  final CategoryController controller = Get.find();

  DealsController dealsController = Get.put(DealsController());
  @override
  bool get wantKeepAlive => true;
  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Obx(() {
      final tabCtrl = dealsController.tabController.value;
      final categories = controller.categories;

      if (tabCtrl == null ||
          categories.isEmpty ||
          tabCtrl.length != categories.length) {
        return Scaffold(body: const SizedBox());
      }

      return Scaffold(
        appBar: AppBar(
          leading: GestureDetector(
            onTap: () => Get.back(),
            child: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          ),
          backgroundColor: Colors.black,
          title: Row(
            children: [
              Icon(Icons.flash_on, color: Colors.white),
              SizedBox(width: 2.w),
              AppTextWidget(
                text: "lightningDeals".tr,
                fontWeight: FontWeight.w600,
                color: Colors.white,
                fontSize: 15.sp,
              ),
              SizedBox(width: 20.w),
              AppTextWidget(
                text: "limitedTimeOffer".tr,
                color: Colors.white,
                fontSize: 10.sp,
                fontWeight: FontWeight.w300,
              ),
            ],
          ),
        ),
        body: Column(
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
              // unselected tab color:
              labelStyle: TextStyle(
                fontSize: 13.sp,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: 13.sp,
                fontWeight: FontWeight.w500,
              ),
              tabs: controller.categories.map((cat) {
                return Tab(
                  text: Get.locale?.languageCode == 'ar'
                      ? cat.nameAr
                      : cat.name,
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
        ),
      );
    });
  }

  Widget _buildTabScreen(CategoryModel category) {
    log("Category Name  123 == $category");
    switch (category.name) {
      case "":
        return RecommendedDealsScreen();
      case "All":
        return RecommendedDealsScreen();
      case "Beauty & Health": // Beauty & Health
        return DealsBeautyAndHealth();
      case "Cell Phone": // Cell Phone Accessories:
        return DealsCellPhoneAccessories();
      case "Home & Kitchen": // Home & Kitchen
        return DealsHomeAndKitchen();
      case "Baby & Toddler": // Baby & Toddler
        return DealsBabyAndToddler();
      case "Automotive Accessories": // Automotive Accessories
        return DealsAutomotiveAndAccessories();
      case "Bags & Luggages": // Automotive Accessories
        return DealsBagsAndLuggages();
      case "Women Shoes": // Automotive Accessories
        return DealsWomenShoes();
      case "Women Clothings": // Automotive Accessories
        return DealsWomenClothing();
      case "Men Clothings": // Automotive Accessories
        return DealsMenClothings();
      case "Jewlery & Accessories": // Automotive Accessories
        return DealsJewleryAndAccessories();
      case "Women Lingeries": // Automotive Accessories
        return DealsWomenLingeries();
      default:
        return RecommendedDealsScreen();
      //return SizedBox();
    }
  }
}
