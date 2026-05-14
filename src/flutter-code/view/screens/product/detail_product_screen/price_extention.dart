import '../../../../model/detail_category_model/detail_category_model.dart';

extension ProductPriceTierUI on ProductPriceTier {
  /// Final price user pays (bundle / offer / sale / normal)
  double get finalPrice => getDisplayPrice().toDouble();

  /// Discount amount
  double get discountAmount {
    if (finalPrice >= normalPrice) return 0;
    return normalPrice - finalPrice;
  }

  /// Discount percentage
  int get discountPercent {
    if (discountAmount <= 0 || normalPrice == 0) return 0;
    return ((discountAmount / normalPrice) * 100).round();
  }

  /// UI title: Buy X – Save Y%
  String get title {
    if (quantity > 0 && discountPercent > 0) {
      return 'Buy $quantity - Save $discountPercent%';
    }
    if (quantity > 0) {
      return 'Buy $quantity';
    }
    return 'Price';
  }

  /// Main price text (shown bold)
  String get priceText => finalPrice.toStringAsFixed(2);

  /// Strike-through normal price
  String? get strikePriceText {
    if (discountAmount > 0) {
      return normalPrice.toStringAsFixed(2);
    }
    return null;
  }
}
