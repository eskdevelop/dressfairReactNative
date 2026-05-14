import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/home_controller/home_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/reuseable_buttons/reuseable_fill_button.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../controller/customer_profile/customer_profile_controller.dart';
import '../../../controller/events/facebook_events_service_controller/fb_service_controller.dart';
import '../../../controller/events/tiktok_events_service_controller/titok_events_servie_controller.dart';
import '../../../controller/new_arrival_controller/new_arrival_controller.dart';
import '../../../controller/product_controller/product_controller.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with AutomaticKeepAliveClientMixin {
  BottomNavController bottomNavController = Get.put(BottomNavController());
  CategoryController categoryController = Get.find<CategoryController>();
  SessionController sessionController = Get.find<SessionController>();
  ProductController productController = Get.find<ProductController>();
  GetProfileController getProfileController = Get.put(GetProfileController());
  NewArrivalController newArrivalController = Get.put(NewArrivalController());

  void _loadBackgroundApis({
    required ProductController productController,
    required CategoryController categoryController,
    required GetProfileController getProfileController,
    required NewArrivalController newArrivalController,
    required SessionController sessionController,
  }) {
    Future.wait([
      getProfileController.getCustomerProfile(false),
      newArrivalController.getNewArrivals(),
      sessionController.fetchUserLocation(),
      _loadTopCategoriesProducts(productController, categoryController),
    ]);
  }

  Future<void> _loadTopCategoriesProducts(
    ProductController productController,
    CategoryController categoryController,
  ) async {
    final categories = categoryController.categories;
    final futures = <Future>[];
    for (int i = 0; i < categories.length; i++) {
      final e = categories[i];

      /// Skip the synthetic "All" row (id == 0, no slug) — products for
      /// the empty slug are already loaded by SplashScreen.
      if (e.id == 0) continue;

      final slug = (e.slug ?? '').trim();
      if (slug.isEmpty) continue;
      futures.add(
        productController.loadProducts(
          cateSlug: slug,
          page: 1,
          isPagination: false,
          isSilentRefresh: true,
        ),
      );
    }

    await Future.wait(futures);
  }

  Future<void> _initializeApp() async {
    log("In Initialization == ");
    try {
      /// Avoid recreating the TabController when SplashScreen already
      /// populated categories — only refresh if the list is empty.
      if (categoryController.categories.isEmpty) {
        await categoryController.loadCategories();
      }

      /// Fire-and-forget: load heavy APIs in background :
      _loadBackgroundApis(
        productController: productController,
        categoryController: categoryController,
        getProfileController: getProfileController,
        newArrivalController: newArrivalController,
        sessionController: sessionController,
      );
      // Optional: initialize TikTok/Facebook events:
      TikTokService().initialize();
      FacebookEventService.instance.setAdvertiserTracking(true);
    } catch (e) {
      debugPrint("Initialization error: $e");
    }
  }

  @override
  bool get wantKeepAlive => true;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      await _initializeApp();
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          /// Main Screen Body:
          Obx(
            () => IndexedStack(
              index: bottomNavController.currentIndex.value,
              children: bottomNavController.screens,
            ),
          ),

          /// Sign-in Banner Above Bottom Navigation:
          Obx(
            () => Visibility(
              visible: !sessionController.isUserLoginIn.value,
              child: Positioned(
                left: 0,
                right: 0,
                bottom: 0.h,
                child: Container(
                  width: MediaQuery.sizeOf(context).width,
                  height: 40.h,
                  padding: EdgeInsets.only(left: 16.w),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                  ),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: BouncingScrollPhysics(),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Padding(
                          padding: EdgeInsets.only(right: 5.0.w),
                          child: Text(
                            "signInForTheBestExperience".tr,
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 14.sp,
                            ),
                          ),
                        ),
                        20.w.sw,
                        AppButton(
                          width: 80.w,
                          height: 30.h,
                          onTap: () async {
                            log("Tapping 231");
                            Get.toNamed(
                              loginInScreen,
                              arguments: {"isFromHome": true},
                            );
                          },
                          textStyle: TextStyle(color: Colors.white),
                          borderRadius: 20.r,
                          isLoading: false.obs,
                          text: "signIn".tr,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),

      /// Bottom Navigation Bar:
      bottomNavigationBar: Obx(
        () => BottomNavigationBar(
          elevation: 8,
          backgroundColor: Colors.white,
          type: BottomNavigationBarType.fixed,
          unselectedItemColor: Colors.black54,
          showUnselectedLabels: true,
          selectedItemColor: AppColors.primaryColor,
          currentIndex: bottomNavController.currentIndex.value,
          onTap: bottomNavController.changeTab,
          items: [
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: AppText.home,
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.category),
              label: AppText.category,
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: AppText.you,
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_cart),
              label: AppText.cart,
            ),
          ],
        ),
      ),
    );
  }
}
