class AreaModel {
  final int id;
  final String? name;
  final String? nameAr;

  AreaModel({required this.id, this.name, this.nameAr});

  factory AreaModel.fromJson(Map<String, dynamic> json) {
    return AreaModel(
      id: json['id'] ?? 0,
      name: json['name'] as String?,
      nameAr: json['name_ar'] as String?,
    );
  }

  static List<AreaModel> fromJsonList(List<dynamic> list) {
    return list
        .whereType<Map<String, dynamic>>() // ignore nulls
        .map((e) => AreaModel.fromJson(e))
        .toList();
  }
}
