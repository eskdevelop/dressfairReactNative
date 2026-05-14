import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/cart_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/category_screen/main_category_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/home_product.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/you_screen.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class BottomNavController extends GetxController {
  var currentIndex = 0.obs;
  void changeTab(int index) {
    currentIndex.value = index;
  }

  final List<Widget> screens = [
    HomeProduct(),
    MainCategoryScreen(),
    YouScreen(),
    CartScreen(),
  ];
}
