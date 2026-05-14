String calculateDiscountPercentage(String originalPrice, String discountPrice) {
  try {
    final original = double.parse(originalPrice);
    final discount = double.parse(discountPrice);
    final percentage = ((original - discount) / original * 100).round();
    return '-$percentage%';
  } catch (e) {
    return '-0%';
  }
}
