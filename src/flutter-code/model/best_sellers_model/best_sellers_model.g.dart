// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'best_sellers_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class ProductItemAdapter extends TypeAdapter<ProductItem> {
  @override
  final int typeId = 15;

  @override
  ProductItem read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ProductItem(
      productId: fields[0] as String,
      sku: fields[1] as String,
      model: fields[2] as String,
      name: fields[3] as String,
      price: fields[4] as String,
      special: fields[5] as String,
      percentOff: fields[6] as int,
      image: fields[7] as String,
      mImage: fields[8] as String,
      quantity: fields[9] as String,
      currencyCode: fields[10] as String,
      rating: fields[11] as double,
      totalReviews: fields[12] as int,
    );
  }

  @override
  void write(BinaryWriter writer, ProductItem obj) {
    writer
      ..writeByte(13)
      ..writeByte(0)
      ..write(obj.productId)
      ..writeByte(1)
      ..write(obj.sku)
      ..writeByte(2)
      ..write(obj.model)
      ..writeByte(3)
      ..write(obj.name)
      ..writeByte(4)
      ..write(obj.price)
      ..writeByte(5)
      ..write(obj.special)
      ..writeByte(6)
      ..write(obj.percentOff)
      ..writeByte(7)
      ..write(obj.image)
      ..writeByte(8)
      ..write(obj.mImage)
      ..writeByte(9)
      ..write(obj.quantity)
      ..writeByte(10)
      ..write(obj.currencyCode)
      ..writeByte(11)
      ..write(obj.rating)
      ..writeByte(12)
      ..write(obj.totalReviews);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProductItemAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
