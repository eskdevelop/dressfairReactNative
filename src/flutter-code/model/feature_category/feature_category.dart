class FeatureCategoryModel {
  final String categoryId;
  final String name;
  final String seoUrl;
  final String image;

  FeatureCategoryModel({
    required this.categoryId,
    required this.name,
    required this.seoUrl,
    required this.image,
  });

  factory FeatureCategoryModel.fromJson(Map<String, dynamic> json) {
    return FeatureCategoryModel(
      categoryId: json['category_id'] ?? '',
      name: json['name'] ?? '',
      seoUrl: json['seo_url'] ?? '',
      image: json['image'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category_id': categoryId,
      'name': name,
      'seo_url': seoUrl,
      'image': image,
    };
  }
}
