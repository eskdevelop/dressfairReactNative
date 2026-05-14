class GetOrderByIdModel {
  String? orderId;
  String? invoiceNo;
  String? invoicePrefix;
  String? storeId;
  String? storeName;
  String? storeUrl;
  String? customerId;
  String? firstname;
  String? lastname;
  String? telephone;
  String? email;
  String? paymentFirstname;
  String? paymentLastname;
  String? paymentCompany;
  String? paymentAddress1;
  String? paymentAddress2;
  String? paymentPostcode;
  String? paymentCode;
  String? paymentCity;
  String? paymentZoneId;
  String? paymentZone;
  String? paymentZoneCode;
  String? paymentCountryId;
  String? paymentCountry;
  String? paymentIsoCode2;
  String? paymentIsoCode3;
  String? paymentAddressFormat;
  PaymentMethod? paymentMethod;
  String? shippingFirstname;
  String? shippingLastname;
  String? shippingCompany;
  String? shippingAddress1;
  String? shippingAddress2;
  String? shippingPostcode;
  String? shippingCity;
  String? shippingZoneId;
  String? shippingZone;
  String? shippingZoneCode;
  String? shippingCountryId;
  String? shippingCountry;
  String? shippingIsoCode2;
  String? shippingIsoCode3;
  String? shippingAddressFormat;
  ShippingMethod? shippingMethod;
  String? comment;
  String? total;
  String? orderStatusId;
  String? languageId;
  String? currencyId;
  String? currencyCode;
  String? currencyValue;
  String? dateModified;
  String? dateAdded;
  String? orderStatus;
  String? ip;
  String? paymentAddress;
  String? shippingAddress;
  List<Product>? products;
  List<dynamic>? vouchers;
  List<OrderTotal>? totals;
  List<History>? histories;

  GetOrderByIdModel({
    this.orderId,
    this.invoiceNo,
    this.invoicePrefix,
    this.storeId,
    this.storeName,
    this.storeUrl,
    this.customerId,
    this.firstname,
    this.lastname,
    this.telephone,
    this.email,
    this.paymentFirstname,
    this.paymentLastname,
    this.paymentCompany,
    this.paymentAddress1,
    this.paymentAddress2,
    this.paymentPostcode,
    this.paymentCode,
    this.paymentCity,
    this.paymentZoneId,
    this.paymentZone,
    this.paymentZoneCode,
    this.paymentCountryId,
    this.paymentCountry,
    this.paymentIsoCode2,
    this.paymentIsoCode3,
    this.paymentAddressFormat,
    this.paymentMethod,
    this.shippingFirstname,
    this.shippingLastname,
    this.shippingCompany,
    this.shippingAddress1,
    this.shippingAddress2,
    this.shippingPostcode,
    this.shippingCity,
    this.shippingZoneId,
    this.shippingZone,
    this.shippingZoneCode,
    this.shippingCountryId,
    this.shippingCountry,
    this.shippingIsoCode2,
    this.shippingIsoCode3,
    this.shippingAddressFormat,
    this.shippingMethod,
    this.comment,
    this.total,
    this.orderStatusId,
    this.languageId,
    this.currencyId,
    this.currencyCode,
    this.currencyValue,
    this.dateModified,
    this.dateAdded,
    this.orderStatus,
    this.ip,
    this.paymentAddress,
    this.shippingAddress,
    this.products,
    this.vouchers,
    this.totals,
    this.histories,
  });

  factory GetOrderByIdModel.fromJson(Map<String, dynamic> json) {
    return GetOrderByIdModel(
      orderId: json['order_id'],
      invoiceNo: json['invoice_no'],
      invoicePrefix: json['invoice_prefix'],
      storeId: json['store_id'],
      storeName: json['store_name'],
      storeUrl: json['store_url'],
      customerId: json['customer_id'],
      firstname: json['firstname'],
      lastname: json['lastname'],
      telephone: json['telephone'],
      email: json['email'],
      paymentFirstname: json['payment_firstname'],
      paymentLastname: json['payment_lastname'],
      paymentCompany: json['payment_company'],
      paymentAddress1: json['payment_address_1'],
      paymentAddress2: json['payment_address_2'],
      paymentPostcode: json['payment_postcode'],
      paymentCode: json['payment_code'],
      paymentCity: json['payment_city'],
      paymentZoneId: json['payment_zone_id'],
      paymentZone: json['payment_zone'],
      paymentZoneCode: json['payment_zone_code'],
      paymentCountryId: json['payment_country_id'],
      paymentCountry: json['payment_country'],
      paymentIsoCode2: json['payment_iso_code_2'],
      paymentIsoCode3: json['payment_iso_code_3'],
      paymentAddressFormat: json['payment_address_format'],
      paymentMethod: json['payment_method'] != null
          ? PaymentMethod.fromJson(json['payment_method'])
          : null,
      shippingFirstname: json['shipping_firstname'],
      shippingLastname: json['shipping_lastname'],
      shippingCompany: json['shipping_company'],
      shippingAddress1: json['shipping_address_1'],
      shippingAddress2: json['shipping_address_2'],
      shippingPostcode: json['shipping_postcode'],
      shippingCity: json['shipping_city'],
      shippingZoneId: json['shipping_zone_id'],
      shippingZone: json['shipping_zone'],
      shippingZoneCode: json['shipping_zone_code'],
      shippingCountryId: json['shipping_country_id'],
      shippingCountry: json['shipping_country'],
      shippingIsoCode2: json['shipping_iso_code_2'],
      shippingIsoCode3: json['shipping_iso_code_3'],
      shippingAddressFormat: json['shipping_address_format'],
      shippingMethod: json['shipping_method'] != null
          ? ShippingMethod.fromJson(json['shipping_method'])
          : null,
      comment: json['comment'],
      total: json['total'],
      orderStatusId: json['order_status_id'],
      languageId: json['language_id'],
      currencyId: json['currency_id'],
      currencyCode: json['currency_code'],
      currencyValue: json['currency_value'],
      dateModified: json['date_modified'],
      dateAdded: json['date_added'],
      orderStatus: json['order_status'],
      ip: json['ip'],
      paymentAddress: json['payment_address'],
      shippingAddress: json['shipping_address'],
      products: (json['products'] as List?)
          ?.map((e) => Product.fromJson(e))
          .toList(),
      vouchers: json['vouchers'] ?? [],
      totals: (json['totals'] as List?)
          ?.map((e) => OrderTotal.fromJson(e))
          .toList(),
      histories: (json['histories'] as List?)
          ?.map((e) => History.fromJson(e))
          .toList(),
    );
  }
}

class PaymentMethod {
  String? code;
  String? name;

  PaymentMethod({this.code, this.name});

  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(code: json['code'], name: json['name']);
  }
}

class ShippingMethod {
  String? code;
  String? name;
  String? cost;
  String? taxClassId;
  String? text;

  ShippingMethod({this.code, this.name, this.cost, this.taxClassId, this.text});

  factory ShippingMethod.fromJson(Map<String, dynamic> json) {
    return ShippingMethod(
      code: json['code'],
      name: json['name'],
      cost: json['cost'],
      taxClassId: json['tax_class_id'],
      text: json['text'],
    );
  }
}

class Product {
  String? productId;
  String? orderProductId;
  String? name;
  String? image;
  String? originalImage;
  String? model;
  List<ProductOption>? option;
  String? quantity;
  String? price;
  String? total;
  String? priceRaw;
  String? totalRaw;
  String? returnUrl;

  Product({
    this.productId,
    this.orderProductId,
    this.name,
    this.image,
    this.originalImage,
    this.model,
    this.option,
    this.quantity,
    this.price,
    this.total,
    this.priceRaw,
    this.totalRaw,
    this.returnUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id'],
      orderProductId: json['order_product_id'],
      name: json['name'],
      image: json['image'],
      originalImage: json['original_image'],
      model: json['model'],
      option: (json['option'] as List?)
          ?.map((e) => ProductOption.fromJson(e))
          .toList(),
      quantity: json['quantity'],
      price: json['price'],
      total: json['total'],
      priceRaw: json['price_raw'],
      totalRaw: json['total_raw'],
      returnUrl: json['return'],
    );
  }
}

class ProductOption {
  String? name;
  String? value;

  ProductOption({this.name, this.value});

  factory ProductOption.fromJson(Map<String, dynamic> json) {
    return ProductOption(name: json['name'], value: json['value']);
  }
}

class OrderTotal {
  String? orderTotalId;
  String? orderId;
  String? extension;
  String? code;
  String? title;
  String? value;
  String? sortOrder;

  OrderTotal({
    this.orderTotalId,
    this.orderId,
    this.extension,
    this.code,
    this.title,
    this.value,
    this.sortOrder,
  });

  factory OrderTotal.fromJson(Map<String, dynamic> json) {
    return OrderTotal(
      orderTotalId: json['order_total_id'],
      orderId: json['order_id'],
      extension: json['extension'],
      code: json['code'],
      title: json['title'],
      value: json['value'],
      sortOrder: json['sort_order'],
    );
  }
}

class History {
  String? dateAdded;
  String? status;
  String? comment;

  History({this.dateAdded, this.status, this.comment});

  factory History.fromJson(Map<String, dynamic> json) {
    return History(
      dateAdded: json['date_added'],
      status: json['status'],
      comment: json['comment'],
    );
  }
}
