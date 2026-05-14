// class SearchSuggestionModel {
//   final String title;
//   final String? sku;
//
//   SearchSuggestionModel({required this.title, this.sku});
//
//   factory SearchSuggestionModel.fromJson(Map<String, dynamic> json) {
//     return SearchSuggestionModel(
//       title: json['title'] ?? '',
//       sku: json['sku'], // sku is optional
//     );
//   }
//
//   Map<String, dynamic> toJson() {
//     return {"title": title, "sku": sku};
//   }
//
//   static List<SearchSuggestionModel> fromJsonList(List<dynamic> jsonList) {
//     return jsonList
//         .map((json) => SearchSuggestionModel.fromJson(json))
//         .toList();
//   }
// }
//
class SearchSuggestionModel {
  final String sku;
  final String name;
  final String nameAr;
  final String color;
  final String image;
  final double price;

  SearchSuggestionModel({
    required this.sku,
    required this.name,
    required this.nameAr,
    required this.color,
    required this.image,
    required this.price,
  });

  factory SearchSuggestionModel.fromJson(Map<String, dynamic> json) {
    return SearchSuggestionModel(
      sku: json['sku'] ?? '',
      name: json['name'] ?? '',
      nameAr: json['name_ar'] ?? '',
      color: json['color'] ?? '',
      image: json['image'] ?? '',
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sku': sku,
      'name': name,
      'name_ar': nameAr,
      'color': color,
      'image': image,
      'price': price,
    };
  }
}
