class AddressModel {
  final String addressId;
  final String firstname;
  final String lastname;
  final String company;
  final String address1;
  final String address2;
  final String city;
  final String postcode;
  final String zoneId;
  final String zone;
  final String zoneCode;
  final String countryId;
  final String country;
  final String isoCode2;
  final String isoCode3;
  final String addressFormat;
  final dynamic customField;
  final String isDefault;

  AddressModel({
    required this.addressId,
    required this.firstname,
    required this.lastname,
    required this.company,
    required this.address1,
    required this.address2,
    required this.city,
    required this.postcode,
    required this.zoneId,
    required this.zone,
    required this.zoneCode,
    required this.countryId,
    required this.country,
    required this.isoCode2,
    required this.isoCode3,
    required this.addressFormat,
    this.customField,
    required this.isDefault,
  });

  factory AddressModel.fromJson(Map<String, dynamic> json) {
    return AddressModel(
      addressId: json['address_id'] ?? "",
      firstname: json['firstname'] ?? "",
      lastname: json['lastname'] ?? "",
      company: json['company'] ?? "",
      address1: json['address_1'] ?? "",
      address2: json['address_2'] ?? "",
      city: json['city'] ?? "",
      postcode: json['postcode'] ?? "",
      zoneId: json['zone_id'] ?? "",
      zone: json['zone'] ?? "",
      zoneCode: json['zone_code'] ?? "",
      countryId: json['country_id'] ?? "",
      country: json['country'] ?? "",
      isoCode2: json['iso_code_2'] ?? "",
      isoCode3: json['iso_code_3'] ?? "",
      addressFormat: json['address_format'] ?? "",
      customField: json['custom_field'],
      isDefault: json['default'] ?? "0",
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "address_id": addressId,
      "firstname": firstname,
      "lastname": lastname,
      "company": company,
      "address_1": address1,
      "address_2": address2,
      "city": city,
      "postcode": postcode,
      "zone_id": zoneId,
      "zone": zone,
      "zone_code": zoneCode,
      "country_id": countryId,
      "country": country,
      "iso_code_2": isoCode2,
      "iso_code_3": isoCode3,
      "address_format": addressFormat,
      "custom_field": customField,
      "default": isDefault,
    };
  }
}

// If your data is a list
List<AddressModel> addressListFromJson(List<dynamic> jsonList) {
  return jsonList.map((e) => AddressModel.fromJson(e)).toList();
}
