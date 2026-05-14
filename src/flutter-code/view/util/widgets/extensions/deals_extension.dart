import '../../../../model/deals_model/deals_model.dart';

extension DealProductHelpers on DealProductModel {
  /// Get main image → fallback to first → fallback empty
  String get displayImage {
    if (images.isEmpty) return '';

    final main = images.firstWhere(
      (e) => e.isMain == 1,
      orElse: () => images.first,
    );

    return main.image;
  }

  /// Discount percentage
  int get discountPercent {
    if (!price.hasOffer || price.normalPrice == 0) return 0;
    return (((price.normalPrice - price.offerPrice) / price.normalPrice) * 100)
        .round();
  }

  /// Display price (offer > normal)
  double get displayPrice =>
      price.hasOffer ? price.offerPrice : price.normalPrice;
}
