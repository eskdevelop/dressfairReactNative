import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_add_to_cart_controller/get_add_to_cart_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../controller/home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';
import '../../controller/product_controller/product_controller.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  SessionController sessionController = Get.find<SessionController>();
  ProductController productController = Get.put(
    ProductController(),
    permanent: true,
  );
  CategoryController categoryController = Get.put(
    CategoryController(),
    permanent: true,
  );
  GetBannerController getBannerController = Get.put(GetBannerController());
  GetAddToCartController getAddToCartController = Get.put(
    GetAddToCartController(),
    permanent: true,
  );
  DealsController dealsController = Get.put(DealsController());
  Future<void> initializeBasicApp() async {
    // categoryController.loadDefaultCategories();
    await Future.wait([
      sessionController.getConfig(),
      getBannerController.loadBanners(),
      productController.loadProducts(
        cateSlug: "",
        page: 1,
        isPagination: false,
      ),
      categoryController.loadCategories(),
      dealsController.getDeals(cateSlug: "", page: 1),
    ]).then((v) async {
      Get.toNamed(homeScreen);
    });
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      await initializeBasicApp();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Align(
              alignment: Alignment.center,
              child: SvgPicture.asset(
                height: 80.h,
                width: 80.w,
                AppImages.logo,
              ),
            ),
            // SizedBox(height: MediaQuery.sizeOf(context).height * 0.3),
            // SpinKitFadingCircle(color: AppColors.greyColor, size: 45.0.sp),
          ],
        ),
      ),
    );
  }
}
