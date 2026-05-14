import 'package:hive/hive.dart';

part 'add_to_card_hive_model.g.dart';

@HiveType(typeId: 1233)
class AddToCardHiveModel extends HiveObject {
  @HiveField(0)
  int productId;

  @HiveField(1)
  String sku;

  @HiveField(2)
  String name;

  @HiveField(3)
  String image;

  @HiveField(4)
  String size;

  @HiveField(5)
  String color;

  @HiveField(6)
  int quantity;

  /// 🔥 Store ALL tiers
  @HiveField(7)
  List<CartPriceTier> priceTiers;

  @HiveField(8)
  String currencyCode;

  AddToCardHiveModel({
    required this.productId,
    required this.sku,
    required this.name,
    required this.image,
    required this.size,
    required this.color,
    required this.quantity,
    required this.priceTiers,
    required this.currencyCode,
  });
}

@HiveType(typeId: 2)
class CartPriceTier {
  @HiveField(0)
  int quantity;

  @HiveField(1)
  double price;

  CartPriceTier({required this.quantity, required this.price});
}
