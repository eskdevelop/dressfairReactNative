class OrderSuccessModel {
  final String customerName;
  final String customerMobile;
  final String customerCountry;
  final String customerCity;
  final String customerArea;
  final String orderTotalAmount;
  final String currencyName;
  final String currencyCode;
  final List<OrderProduct> orderProducts;

  OrderSuccessModel({
    required this.customerName,
    required this.customerMobile,
    required this.customerCountry,
    required this.customerCity,
    required this.customerArea,
    required this.orderTotalAmount,
    required this.currencyName,
    required this.currencyCode,
    required this.orderProducts,
  });

  factory OrderSuccessModel.fromJson(Map<String, dynamic> json) {
    return OrderSuccessModel(
      customerName: json['customer_name'] ?? '',
      customerMobile: json['customer_mobile'] ?? '',
      customerCountry: json['customer_country'] ?? '',
      customerCity: json['customer_city'] ?? '',
      customerArea: json['customer_area'] ?? '',
      orderTotalAmount: json['order_total_amount'] ?? '',
      currencyName: json['currency_name'] ?? '',
      currencyCode: json['currency_code'] ?? '',
      orderProducts: (json['order_products'] as List<dynamic>? ?? [])
          .map((e) => OrderProduct.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'customer_name': customerName,
      'customer_mobile': customerMobile,
      'customer_country': customerCountry,
      'customer_city': customerCity,
      'customer_area': customerArea,
      'order_total_amount': orderTotalAmount,
      'currency_name': currencyName,
      'currency_code': currencyCode,
      'order_products': orderProducts.map((e) => e.toJson()).toList(),
    };
  }
}

class OrderProduct {
  final int orderProductQuantity;
  final String productName;
  final String productNameAr;
  final String productSku;

  OrderProduct({
    required this.orderProductQuantity,
    required this.productName,
    required this.productNameAr,
    required this.productSku,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) {
    return OrderProduct(
      orderProductQuantity: json['order_product_quantity'] ?? 0,
      productName: json['product_name'] ?? '',
      productNameAr: json['product_name_ar'] ?? '',
      productSku: json['product_sku'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_product_quantity': orderProductQuantity,
      'product_name': productName,
      'product_name_ar': productNameAr,
      'product_sku': productSku,
    };
  }
}
