class CityModel {
  final int id;
  final String? name;
  final String? nameAr;
  final String? code;

  CityModel({required this.id, this.name, this.nameAr, this.code});

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['id'] ?? 0,
      name: json['name'] as String?,
      nameAr: json['name_ar'] as String?,
      code: json['code'] as String?,
    );
  }
}
