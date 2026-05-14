class TermsAndConditionModel {
  final String title;
  final String description;
  final String metaTitle;
  final String metaDescription;
  final String metaKeyword;

  TermsAndConditionModel({
    required this.title,
    required this.description,
    required this.metaTitle,
    required this.metaDescription,
    required this.metaKeyword,
  });

  factory TermsAndConditionModel.fromJson(Map<String, dynamic> json) {
    return TermsAndConditionModel(
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      metaTitle: json['meta_title']?.toString() ?? '',
      metaDescription: json['meta_description']?.toString() ?? '',
      metaKeyword: json['meta_keyword']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'meta_title': metaTitle,
      'meta_description': metaDescription,
      'meta_keyword': metaKeyword,
    };
  }
}
