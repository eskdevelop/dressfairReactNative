class OrderStatusModel {
  final Customer customer;
  final List<Order> orders;

  OrderStatusModel({required this.customer, required this.orders});

  factory OrderStatusModel.fromJson(Map<String, dynamic> json) {
    return OrderStatusModel(
      customer: Customer.fromJson(json['customer']),
      orders: (json['orders'] as List).map((e) => Order.fromJson(e)).toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'customer': customer.toJson(),
    'orders': orders.map((e) => e.toJson()).toList(),
  };
}

class Customer {
  final String customerName;
  final String customerMobile;
  final String customerCountry;
  final String customerCity;
  final String customerArea;

  Customer({
    required this.customerName,
    required this.customerMobile,
    required this.customerCountry,
    required this.customerCity,
    required this.customerArea,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      customerName: json['customer_name'],
      customerMobile: json['customer_mobile'],
      customerCountry: json['customer_country'],
      customerCity: json['customer_city'],
      customerArea: json['customer_area'],
    );
  }

  Map<String, dynamic> toJson() => {
    'customer_name': customerName,
    'customer_mobile': customerMobile,
    'customer_country': customerCountry,
    'customer_city': customerCity,
    'customer_area': customerArea,
  };
}

class Order {
  final int orderId;
  final String orderTotalAmount;
  final Currency currency;
  final String orderStatus;
  final List<OrderProduct> orderProducts;

  Order({
    required this.orderId,
    required this.orderTotalAmount,
    required this.currency,
    required this.orderStatus,
    required this.orderProducts,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      orderId: json['order_id'],
      orderTotalAmount: json['order_total_amount'],
      currency: Currency.fromJson(json['currency']),
      orderStatus: json['order_status'],
      orderProducts: (json['order_products'] as List)
          .map((e) => OrderProduct.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'order_id': orderId,
    'order_total_amount': orderTotalAmount,
    'currency': currency.toJson(),
    'order_status': orderStatus,
    'order_products': orderProducts.map((e) => e.toJson()).toList(),
  };
}

class Currency {
  final String title;
  final String code;

  Currency({required this.title, required this.code});

  factory Currency.fromJson(Map<String, dynamic> json) {
    return Currency(title: json['title'], code: json['code']);
  }

  Map<String, dynamic> toJson() => {'title': title, 'code': code};
}

class OrderProduct {
  final int orderProductQuantity;
  final String productName;
  final String productNameAr;
  final String productSku;
  final List<ProductImage> images;
  final ProductOption options;

  OrderProduct({
    required this.orderProductQuantity,
    required this.productName,
    required this.productNameAr,
    required this.productSku,
    required this.images,
    required this.options,
  });

  factory OrderProduct.fromJson(Map<String, dynamic> json) {
    return OrderProduct(
      orderProductQuantity: json['order_product_quantity'],
      productName: json['product_name'],
      productNameAr: json['product_name_ar'],
      productSku: json['product_sku'],
      images: (json['images'] as List)
          .map((e) => ProductImage.fromJson(e))
          .toList(),
      options: ProductOption.fromJson(json['options']),
    );
  }

  Map<String, dynamic> toJson() => {
    'order_product_quantity': orderProductQuantity,
    'product_name': productName,
    'product_name_ar': productNameAr,
    'product_sku': productSku,
    'images': images.map((e) => e.toJson()).toList(),
    'options': options.toJson(),
  };
}

class ProductImage {
  final int id;
  final String url;

  ProductImage({required this.id, required this.url});

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(id: json['id'], url: json['url']);
  }

  Map<String, dynamic> toJson() => {'id': id, 'url': url};
}

class ProductOption {
  final int id;
  final String label;
  final int productId;

  ProductOption({
    required this.id,
    required this.label,
    required this.productId,
  });

  factory ProductOption.fromJson(Map<String, dynamic> json) {
    return ProductOption(
      id: json['id'],
      label: json['label'],
      productId: json['product_id'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'product_id': productId,
  };
}
