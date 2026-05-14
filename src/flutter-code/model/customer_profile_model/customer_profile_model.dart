class CustomerProfileModel {
  final int id;
  final String firstname;
  final String lastname;
  final String mobile;
  final String email;
  final String image;
  final List<Address> addresses;

  CustomerProfileModel({
    required this.id,
    required this.firstname,
    required this.lastname,
    required this.mobile,
    required this.email,
    required this.image,
    required this.addresses,
  });

  factory CustomerProfileModel.fromJson(Map<String, dynamic>? json) {
    return CustomerProfileModel(
      id: json?['id'] ?? 0,
      firstname: json?['firstname'] ?? '',
      lastname: json?['lastname'] ?? '',
      mobile: json?['mobile'] ?? '',
      email: json?['email'] ?? '',
      image: json?['image'] ?? '',
      addresses:
          (json?['addresses'] as List<dynamic>?)
              ?.map((e) => Address.fromJson(e))
              .toList() ??
          [],
    );
  }
}

class Address {
  final int id;
  final int customerId;
  final String address;
  final int cityId;
  final int cityAreaId;
  final int isDefault;
  final String createdAt;
  final String updatedAt;
  final City? city;
  final Area? area;

  Address({
    required this.id,
    required this.customerId,
    required this.address,
    required this.cityId,
    required this.cityAreaId,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
    this.city,
    this.area,
  });

  factory Address.fromJson(Map<String, dynamic>? json) {
    return Address(
      id: json?['id'] ?? 0,
      customerId: json?['customer_id'] ?? 0,
      address: json?['address'] ?? '',
      cityId: json?['city_id'] ?? 0,
      cityAreaId: json?['city_area_id'] ?? 0,
      isDefault: json?['is_default'] ?? 0,
      createdAt: json?['created_at'] ?? '',
      updatedAt: json?['updated_at'] ?? '',
      city: json?['city'] != null ? City.fromJson(json!['city']) : null,
      area: json?['area'] != null ? Area.fromJson(json!['area']) : null,
    );
  }
}

class City {
  final int id;
  final int countryId;
  final String name;
  final String nameAr;

  City({
    required this.id,
    required this.countryId,
    required this.name,
    required this.nameAr,
  });

  factory City.fromJson(Map<String, dynamic>? json) {
    return City(
      id: json?['id'] ?? 0,
      countryId: json?['country_id'] ?? 0,
      name: json?['name'] ?? '',
      nameAr: json?['name_ar'] ?? '',
    );
  }
}

class Area {
  final int id;
  final int cityId;
  final String name;
  final String nameAr;

  Area({
    required this.id,
    required this.cityId,
    required this.name,
    required this.nameAr,
  });

  factory Area.fromJson(Map<String, dynamic>? json) {
    return Area(
      id: json?['id'] ?? 0,
      cityId: json?['city_id'] ?? 0,
      name: json?['name'] ?? '',
      nameAr: json?['name_ar'] ?? '',
    );
  }
}
