// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'related_category_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class RelatedCategoryModelAdapter extends TypeAdapter<RelatedCategoryModel> {
  @override
  final int typeId = 10;

  @override
  RelatedCategoryModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return RelatedCategoryModel(
      id: fields[0] as int,
      wishList: fields[1] as bool,
      productId: fields[2] as int,
      categoryId: fields[3] as int,
      name: fields[4] as String,
      manufacturer: fields[5] as String?,
      percentOff: fields[6] as int,
      seoUrl: fields[7] as String,
      slug: fields[8] as String,
      model: fields[9] as String,
      image: fields[10] as String,
      mImage: fields[11] as String,
      images: (fields[12] as List).cast<String>(),
      originalImage: fields[13] as String,
      originalImages: (fields[14] as List).cast<String>(),
      priceExcludingTax: fields[15] as String,
      price: fields[16] as String,
      rating: fields[17] as double,
      details: fields[18] as String,
      description: fields[19] as String,
      special: fields[20] as String,
      options: (fields[21] as List).cast<dynamic>(),
      metaTitle: fields[22] as String,
      metaDescription: fields[23] as String,
      metaKeyword: fields[24] as String,
      manufacturerId: fields[25] as int,
      weight: fields[26] as String,
      reward: fields[27] as dynamic,
      points: fields[28] as String,
      quantity: fields[29] as int,
      reviews: (fields[30] as List).cast<dynamic>(),
      totalReviews: fields[31] as int,
      attributes: (fields[32] as List).cast<dynamic>(),
      dealsFreeShipping: fields[33] as int,
      relatedCategory: (fields[34] as List).cast<dynamic>(),
      productsSeries: (fields[35] as List).cast<dynamic>(),
      currencyCode: fields[36] as String,
    );
  }

  @override
  void write(BinaryWriter writer, RelatedCategoryModel obj) {
    writer
      ..writeByte(37)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.wishList)
      ..writeByte(2)
      ..write(obj.productId)
      ..writeByte(3)
      ..write(obj.categoryId)
      ..writeByte(4)
      ..write(obj.name)
      ..writeByte(5)
      ..write(obj.manufacturer)
      ..writeByte(6)
      ..write(obj.percentOff)
      ..writeByte(7)
      ..write(obj.seoUrl)
      ..writeByte(8)
      ..write(obj.slug)
      ..writeByte(9)
      ..write(obj.model)
      ..writeByte(10)
      ..write(obj.image)
      ..writeByte(11)
      ..write(obj.mImage)
      ..writeByte(12)
      ..write(obj.images)
      ..writeByte(13)
      ..write(obj.originalImage)
      ..writeByte(14)
      ..write(obj.originalImages)
      ..writeByte(15)
      ..write(obj.priceExcludingTax)
      ..writeByte(16)
      ..write(obj.price)
      ..writeByte(17)
      ..write(obj.rating)
      ..writeByte(18)
      ..write(obj.details)
      ..writeByte(19)
      ..write(obj.description)
      ..writeByte(20)
      ..write(obj.special)
      ..writeByte(21)
      ..write(obj.options)
      ..writeByte(22)
      ..write(obj.metaTitle)
      ..writeByte(23)
      ..write(obj.metaDescription)
      ..writeByte(24)
      ..write(obj.metaKeyword)
      ..writeByte(25)
      ..write(obj.manufacturerId)
      ..writeByte(26)
      ..write(obj.weight)
      ..writeByte(27)
      ..write(obj.reward)
      ..writeByte(28)
      ..write(obj.points)
      ..writeByte(29)
      ..write(obj.quantity)
      ..writeByte(30)
      ..write(obj.reviews)
      ..writeByte(31)
      ..write(obj.totalReviews)
      ..writeByte(32)
      ..write(obj.attributes)
      ..writeByte(33)
      ..write(obj.dealsFreeShipping)
      ..writeByte(34)
      ..write(obj.relatedCategory)
      ..writeByte(35)
      ..write(obj.productsSeries)
      ..writeByte(36)
      ..write(obj.currencyCode);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is RelatedCategoryModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
