class Profile {
  int? shippingProviderId;
  String? name;
  String? mobileNumber;

  Profile({this.shippingProviderId, this.name, this.mobileNumber});

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      shippingProviderId: json['shipping_provider_id'] as int?,
      name: json['name'] as String?,
      mobileNumber: json['mobile_number']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'shipping_provider_id': shippingProviderId,
      'name': name,
      'mobile_number': mobileNumber,
    };
  }
}
