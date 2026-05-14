class ProfileInfoModel {
  String? customerId;
  String? customerGroupId;
  String? storeId;
  String? languageId;
  String? firstname;
  String? lastname;
  String? email;
  String? telephone;
  String? password;
  String? customField;
  String? newsletter;
  String? ip;
  String? status;
  String? safe;
  String? token;
  String? code;
  String? dateAdded;
  String? addressId;
  String? notification;
  String? fax;
  String? salt;
  String? cart;
  String? wishlist;
  String? approved;
  String? loginOtp;
  String? trash;

  ProfileInfoModel({
    this.customerId,
    this.customerGroupId,
    this.storeId,
    this.languageId,
    this.firstname,
    this.lastname,
    this.email,
    this.telephone,
    this.password,
    this.customField,
    this.newsletter,
    this.ip,
    this.status,
    this.safe,
    this.token,
    this.code,
    this.dateAdded,
    this.addressId,
    this.notification,
    this.fax,
    this.salt,
    this.cart,
    this.wishlist,
    this.approved,
    this.loginOtp,
    this.trash,
  });

  factory ProfileInfoModel.fromJson(Map<String, dynamic> json) {
    return ProfileInfoModel(
      customerId: json['customer_id'],
      customerGroupId: json['customer_group_id'],
      storeId: json['store_id'],
      languageId: json['language_id'],
      firstname: json['firstname'],
      lastname: json['lastname'],
      email: json['email'],
      telephone: json['telephone'],
      password: json['password'],
      customField: json['custom_field'],
      newsletter: json['newsletter'],
      ip: json['ip'],
      status: json['status'],
      safe: json['safe'],
      token: json['token'],
      code: json['code'],
      dateAdded: json['date_added'],
      addressId: json['address_id'],
      notification: json['notification'],
      fax: json['fax'],
      salt: json['salt'],
      cart: json['cart'],
      wishlist: json['wishlist'],
      approved: json['approved'],
      loginOtp: json['login_otp'],
      trash: json['trash'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customer_id': customerId,
      'customer_group_id': customerGroupId,
      'store_id': storeId,
      'language_id': languageId,
      'firstname': firstname,
      'lastname': lastname,
      'email': email,
      'telephone': telephone,
      'password': password,
      'custom_field': customField,
      'newsletter': newsletter,
      'ip': ip,
      'status': status,
      'safe': safe,
      'token': token,
      'code': code,
      'date_added': dateAdded,
      'address_id': addressId,
      'notification': notification,
      'fax': fax,
      'salt': salt,
      'cart': cart,
      'wishlist': wishlist,
      'approved': approved,
      'login_otp': loginOtp,
      'trash': trash,
    };
  }
}
