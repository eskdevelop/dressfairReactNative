// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'banner_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class BannerModelAdapter extends TypeAdapter<BannerModel> {
  @override
  final int typeId = 30;

  @override
  BannerModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return BannerModel(
      title: fields[0] as String,
      titleAr: fields[1] as String,
      image: fields[2] as String,
      imageAr: fields[3] as String,
      link: fields[4] as String,
      linkAr: fields[5] as String,
      position: fields[6] as String,
    );
  }

  @override
  void write(BinaryWriter writer, BannerModel obj) {
    writer
      ..writeByte(7)
      ..writeByte(0)
      ..write(obj.title)
      ..writeByte(1)
      ..write(obj.titleAr)
      ..writeByte(2)
      ..write(obj.image)
      ..writeByte(3)
      ..write(obj.imageAr)
      ..writeByte(4)
      ..write(obj.link)
      ..writeByte(5)
      ..write(obj.linkAr)
      ..writeByte(6)
      ..write(obj.position);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BannerModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
