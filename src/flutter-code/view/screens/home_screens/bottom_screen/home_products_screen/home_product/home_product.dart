import 'package:dress_fair_ecommmerce/controller/category_controller/category_controller.dart';
import 'package:dress_fair_ecommmerce/controller/product_controller/product_controller.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/category_tab_bar.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/widgets/home_search_bar.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class HomeProduct extends StatefulWidget {
  const HomeProduct({super.key});

  @override
  State<HomeProduct> createState() => _HomeProductState();
}

class _HomeProductState extends State<HomeProduct> {
  final controller = Get.put(CategoryController());
  final ProductController productController = Get.find<ProductController>();
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      // if (controller.categories.isEmpty) {
      //   await controller.getCategories();
      //   // await controller.loadAllCategory();
      // }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          40.h.sh,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.0.w),
            child: HomeSearchBar(),
          ),
          Expanded(child: HomeCategoryTabs()),
        ],
      ),
    );
  }
}
