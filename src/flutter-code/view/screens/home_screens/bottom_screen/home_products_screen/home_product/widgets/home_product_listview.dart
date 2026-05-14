import 'package:dress_fair_ecommmerce/controller/home_controller/bottom_nav_controller/home_product_controller/home_product_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProductListView extends StatefulWidget {
  final String category;

  const ProductListView({super.key, required this.category});

  @override
  State<ProductListView> createState() => _ProductListViewState();
}

class _ProductListViewState extends State<ProductListView> {
  final controller = Get.put(HomeProductController());

  @override
  void initState() {
    super.initState();
    // ✅ Load products once when the widget is created, not inside build
    WidgetsBinding.instance.addPostFrameCallback((v) {
      controller.loadProducts(widget.category);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      var items = controller.products[widget.category] ?? [];
      if (items.isEmpty) {
        return Center(child: CircularProgressIndicator());
      }
      return ListView.builder(
        cacheExtent: 3000,
        itemCount: items.length,
        itemBuilder: (context, i) =>
            Card(child: ListTile(title: Text(items[i]))),
      );
    });
  }
}
