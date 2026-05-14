// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CategoryModelAdapter extends TypeAdapter<CategoryModel> {
  @override
  final int typeId = 0;

  @override
  CategoryModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CategoryModel(
      id: fields[0] as int,
      name: fields[1] as String,
      nameAr: fields[2] as String,
      image: fields[3] as String?,
      slug: fields[4] as String?,
      subCategories: (fields[5] as List).cast<SubCategoryModel>(),
      products: (fields[6] as List).cast<ProductModelNew>(),
    );
  }

  @override
  void write(BinaryWriter writer, CategoryModel obj) {
    writer
      ..writeByte(7)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.nameAr)
      ..writeByte(3)
      ..write(obj.image)
      ..writeByte(4)
      ..write(obj.slug)
      ..writeByte(5)
      ..write(obj.subCategories)
      ..writeByte(6)
      ..write(obj.products);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoryModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SubCategoryModelAdapter extends TypeAdapter<SubCategoryModel> {
  @override
  final int typeId = 1;

  @override
  SubCategoryModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SubCategoryModel(
      id: fields[0] as int,
      groupMainCategoryId: fields[1] as int,
      name: fields[2] as String,
      nameAr: fields[3] as String,
      image: fields[4] as String?,
      slug: fields[5] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, SubCategoryModel obj) {
    writer
      ..writeByte(6)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.groupMainCategoryId)
      ..writeByte(2)
      ..write(obj.name)
      ..writeByte(3)
      ..write(obj.nameAr)
      ..writeByte(4)
      ..write(obj.image)
      ..writeByte(5)
      ..write(obj.slug);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SubCategoryModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ProductModelNewAdapter extends TypeAdapter<ProductModelNew> {
  @override
  final int typeId = 2;

  @override
  ProductModelNew read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ProductModelNew(
      productId: fields[0] as int,
      productSku: fields[1] as String,
      currencyCode: fields[2] as String,
      name: fields[3] as String,
      nameAr: fields[4] as String,
      productCategory: fields[5] as ProductCategory?,
      price: fields[6] as ProductPrice,
      images: (fields[7] as List).cast<ProductImage>(),
    );
  }

  @override
  void write(BinaryWriter writer, ProductModelNew obj) {
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
      other is ProductModelNewAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ProductCategoryAdapter extends TypeAdapter<ProductCategory> {
  @override
  final int typeId = 3;

  @override
  ProductCategory read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ProductCategory(
      name: fields[0] as String,
      nameAr: fields[1] as String,
    );
  }

  @override
  void write(BinaryWriter writer, ProductCategory obj) {
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
      other is ProductCategoryAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ProductPriceAdapter extends TypeAdapter<ProductPrice> {
  @override
  final int typeId = 4;

  @override
  ProductPrice read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ProductPrice(
      quantity: fields[0] as int?,
      normalPrice: fields[1] as num,
      salePrice: fields[2] as num?,
      offerPrice: fields[3] as num?,
      bundlePrice: fields[4] as num?,
      hasSale: fields[5] as bool,
      hasOffer: fields[6] as bool,
      hasBundle: fields[7] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, ProductPrice obj) {
    writer
      ..writeByte(8)
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
      ..write(obj.hasBundle);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ProductPriceAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ProductImageAdapter extends TypeAdapter<ProductImage> {
  @override
  final int typeId = 5;

  @override
  ProductImage read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return ProductImage(
      image: fields[0] as String,
      isMain: fields[1] as int,
      isArabicMain: fields[2] as int,
    );
  }

  @override
  void write(BinaryWriter writer, ProductImage obj) {
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
      other is ProductImageAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
