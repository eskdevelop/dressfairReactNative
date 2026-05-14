class ProductFilterData {
  final List<ColorOption> colors;
  final List<Attribute> attributes;

  ProductFilterData({required this.colors, required this.attributes});

  factory ProductFilterData.fromJson(Map<String, dynamic> json) =>
      ProductFilterData(
        colors: (json['colors'] as List)
            .map((e) => ColorOption.fromJson(e))
            .toList(),
        attributes: (json['attributes'] as List)
            .map((e) => Attribute.fromJson(e))
            .toList(),
      );

  Map<String, dynamic> toJson() => {
    'colors': colors.map((e) => e.toJson()).toList(),
    'attributes': attributes.map((e) => e.toJson()).toList(),
  };
}

class ColorOption {
  final String optionValueId;
  final String name;

  ColorOption({required this.optionValueId, required this.name});

  factory ColorOption.fromJson(Map<String, dynamic> json) =>
      ColorOption(optionValueId: json['option_value_id'], name: json['name']);

  Map<String, dynamic> toJson() => {
    'option_value_id': optionValueId,
    'name': name,
  };
}

class Attribute {
  final String attributeId;
  final String name;
  final List<AttributeValue> values;

  Attribute({
    required this.attributeId,
    required this.name,
    required this.values,
  });

  factory Attribute.fromJson(Map<String, dynamic> json) => Attribute(
    attributeId: json['attribute_id'],
    name: json['name'],
    values: (json['values'] as List)
        .map((e) => AttributeValue.fromJson(e))
        .toList(),
  );

  Map<String, dynamic> toJson() => {
    'attribute_id': attributeId,
    'name': name,
    'values': values.map((e) => e.toJson()).toList(),
  };
}

class AttributeValue {
  final String productId;
  final String categoryId;
  final String attributeId;
  final String languageId;
  final String text;
  final String presetId;

  AttributeValue({
    required this.productId,
    required this.categoryId,
    required this.attributeId,
    required this.languageId,
    required this.text,
    required this.presetId,
  });

  factory AttributeValue.fromJson(Map<String, dynamic> json) => AttributeValue(
    productId: json['product_id'],
    categoryId: json['category_id'],
    attributeId: json['attribute_id'],
    languageId: json['language_id'],
    text: json['text'],
    presetId: json['preset_id'],
  );

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'category_id': categoryId,
    'attribute_id': attributeId,
    'language_id': languageId,
    'text': text,
    'preset_id': presetId,
  };
}
