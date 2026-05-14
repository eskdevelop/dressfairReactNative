import 'package:get/get.dart';

class HomeProductController extends GetxController {
  var products = <String, List<String>>{}.obs;

  void loadProducts(String category) {
    // 🔹 Replace with API
    products[category] = List.generate(10, (i) => "$category Product $i");
  }
}
