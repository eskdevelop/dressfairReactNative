// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'main_product_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class MainProductModelAdapter extends TypeAdapter<MainProductModel> {
  @override
  final int typeId = 20;

  @override
  MainProductModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MainProductModel(
      productId: fields[0] as int,
      productSku: fields[1] as String,
      currencyCode: fields[2] as String,
      name: fields[3] as String,
      nameAr: fields[4] as String,
      productCategory: fields[5] as MainProductCategory,
      price: fields[6] as MainProductPrice,
      images: (fields[7] as List).cast<MainProductImage>(),
    );
  }

  @override
  void write(BinaryWriter writer, MainProductModel obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.productId)
      ..writeByte(1)
      ..write(obj.productSku)
      ..writeByte(2)
      ..write(obj.currencyCode)
      ..writeByte(3)
      ..write(obj.name)
      ..writeByte(4)
      ..write(obj.nameAr)
      ..writeByte(5)
      ..write(obj.productCategory)
      ..writeByte(6)
      ..write(obj.price)
      ..writeByte(7)
      ..write(obj.images);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MainProductModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class MainProductCategoryAdapter extends TypeAdapter<MainProductCategory> {
  @override
  final int typeId = 21;

  @override
  MainProductCategory read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MainProductCategory(
      name: fields[0] as String,
      nameAr: fields[1] as String,
    );
  }

  @override
  void write(BinaryWriter writer, MainProductCategory obj) {
    writer
      ..writeByte(2)
      ..writeByte(0)
      ..write(obj.name)
      ..writeByte(1)
      ..write(obj.nameAr);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MainProductCategoryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class MainProductPriceAdapter extends TypeAdapter<MainProductPrice> {
  @override
  final int typeId = 22;

  @override
  MainProductPrice read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MainProductPrice(
      quantity: fields[0] as int?,
      normalPrice: fields[1] as num,
      salePrice: fields[2] as num?,
      offerPrice: fields[3] as num?,
      bundlePrice: fields[4] as num?,
      hasSale: fields[5] as bool,
      hasOffer: fields[6] as bool,
      hasBundle: fields[7] as bool,
      hasNormal: fields[8] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, MainProductPrice obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.quantity)
      ..writeByte(1)
      ..write(obj.normalPrice)
      ..writeByte(2)
      ..write(obj.salePrice)
      ..writeByte(3)
      ..write(obj.offerPrice)
      ..writeByte(4)
      ..write(obj.bundlePrice)
      ..writeByte(5)
      ..write(obj.hasSale)
      ..writeByte(6)
      ..write(obj.hasOffer)
      ..writeByte(7)
      ..write(obj.hasBundle)
      ..writeByte(8)
      ..write(obj.hasNormal);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MainProductPriceAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class MainProductImageAdapter extends TypeAdapter<MainProductImage> {
  @override
  final int typeId = 23;

  @override
  MainProductImage read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return MainProductImage(
      image: fields[0] as String,
      isMain: fields[1] as int,
      isArabicMain: fields[2] as int,
    );
  }

  @override
  void write(BinaryWriter writer, MainProductImage obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.image)
      ..writeByte(1)
      ..write(obj.isMain)
      ..writeByte(2)
      ..write(obj.isArabicMain);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MainProductImageAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
