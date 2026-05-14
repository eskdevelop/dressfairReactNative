import 'package:hive/hive.dart';

part 'banner_model.g.dart';

@HiveType(typeId: 30)
class BannerModel {
  @HiveField(0)
  final String title;

  @HiveField(1)
  final String titleAr;

  @HiveField(2)
  final String image;

  @HiveField(3)
  final String imageAr;

  @HiveField(4)
  final String link;

  @HiveField(5)
  final String linkAr;

  @HiveField(6)
  final String position;

  BannerModel({
    required this.title,
    required this.titleAr,
    required this.image,
    required this.imageAr,
    required this.link,
    required this.linkAr,
    required this.position,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      title: json['title'] ?? "",
      titleAr: json['title_ar'] ?? "",
      image: json['image'] ?? "",
      imageAr: json['image_ar'] ?? "",
      link: json['link'] ?? "",
      linkAr: json['link_ar'] ?? "",
      position: json['position'] ?? "",
    );
  }
}
