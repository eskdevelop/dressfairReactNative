// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_to_card_hive_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class AddToCardHiveModelAdapter extends TypeAdapter<AddToCardHiveModel> {
  @override
  final int typeId = 1233;

  @override
  AddToCardHiveModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return AddToCardHiveModel(
      productId: fields[0] as int,
      sku: fields[1] as String,
      name: fields[2] as String,
      image: fields[3] as String,
      size: fields[4] as String,
      color: fields[5] as String,
      quantity: fields[6] as int,
      priceTiers: (fields[7] as List).cast<CartPriceTier>(),
      currencyCode: fields[8] as String,
    );
  }

  @override
  void write(BinaryWriter writer, AddToCardHiveModel obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.productId)
      ..writeByte(1)
      ..write(obj.sku)
      ..writeByte(2)
      ..write(obj.name)
      ..writeByte(3)
      ..write(obj.image)
      ..writeByte(4)
      ..write(obj.size)
      ..writeByte(5)
      ..write(obj.color)
      ..writeByte(6)
      ..write(obj.quantity)
      ..writeByte(7)
      ..write(obj.priceTiers)
      ..writeByte(8)
      ..write(obj.currencyCode);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AddToCardHiveModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class CartPriceTierAdapter extends TypeAdapter<CartPriceTier> {
  @override
  final int typeId = 2;

  @override
  CartPriceTier read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CartPriceTier(
      quantity: fields[0] as int,
      price: fields[1] as double,
    );
  }

  @override
  void write(BinaryWriter writer, CartPriceTier obj) {
    writer
      ..writeByte(2)
      ..writeByte(0)
      ..write(obj.quantity)
      ..writeByte(1)
      ..write(obj.price);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CartPriceTierAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
