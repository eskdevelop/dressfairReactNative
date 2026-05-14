import 'package:get/get.dart';

class GetCartModel {
  final String weight;
  final List<CartProduct> products;
  final List<dynamic> vouchers;
  final String couponStatus;
  final String coupon;
  final String voucherStatus;
  final String voucher;
  final bool rewardStatus;
  final String reward;
  final List<CartTotal> totals;
  final String total;
  final String totalRaw;
  final int totalProductCount;
  final int hasShipping;
  final int hasDownload;
  final num cartSubTotal;
  final String flateShippingRate;
  final String freeShippingLimit;
  final bool freeShipping;
  final String grandTotal;
  final dynamic walletBalance;
  final String currency;
  final bool walletUsed;
  final String remainingAmountFreeShipping;

  GetCartModel({
    required this.weight,
    required this.products,
    required this.vouchers,
    required this.couponStatus,
    required this.coupon,
    required this.voucherStatus,
    required this.voucher,
    required this.rewardStatus,
    required this.reward,
    required this.totals,
    required this.total,
    required this.totalRaw,
    required this.totalProductCount,
    required this.hasShipping,
    required this.hasDownload,
    required this.cartSubTotal,
    required this.flateShippingRate,
    required this.freeShippingLimit,
    required this.freeShipping,
    required this.grandTotal,
    required this.walletBalance,
    required this.currency,
    required this.walletUsed,
    required this.remainingAmountFreeShipping,
  });

  factory GetCartModel.fromJson(Map<String, dynamic> json) {
    return GetCartModel(
      weight: json['weight'] ?? "",
      products:
          (json['products'] as List<dynamic>?)
              ?.map((e) => CartProduct.fromJson(e))
              .toList() ??
          [],
      vouchers: json['vouchers'] ?? [],
      couponStatus: json['coupon_status'] ?? "",
      coupon: json['coupon'] ?? "",
      voucherStatus: json['voucher_status'] ?? "",
      voucher: json['voucher'] ?? "",
      rewardStatus: json['reward_status'] ?? false,
      reward: json['reward'] ?? "",
      totals:
          (json['totals'] as List<dynamic>?)
              ?.map((e) => CartTotal.fromJson(e))
              .toList() ??
          [],
      total: json['total'] ?? "",
      totalRaw: json['total_raw'] ?? "",
      totalProductCount: json['total_product_count'] ?? 0,
      hasShipping: json['has_shipping'] ?? 0,
      hasDownload: json['has_download'] ?? 0,
      cartSubTotal: json['cart_sub_total'] ?? 0,
      flateShippingRate: json['flate_shipping_rate'] ?? "",
      freeShippingLimit: json['free_shipping_limit'] ?? "",
      freeShipping: json['free_shipping'] ?? false,
      grandTotal: json['grand_total'] ?? "",
      walletBalance: json['wallet_balance'],
      currency: json['currency'] ?? "",
      walletUsed: json['wallet_used'] ?? false,
      remainingAmountFreeShipping: json['remaining_amount_free_shipping'] ?? "",
    );
  }
}

class CartProduct {
  final String key;
  final String thumb;
  final String name;
  final int points;
  final String productId;
  final String model;
  final List<ProductOption> option;
  final String quantity;
  final String availableQuantity;
  final String recurring;
  final bool stock;
  final String reward;
  final String price;
  final String total;
  final String priceRaw;
  final String totalRaw;

  // ✅ reactive field for checkbox selection
  RxBool isSelected = false.obs;

  CartProduct({
    required this.key,
    required this.thumb,
    required this.name,
    required this.points,
    required this.productId,
    required this.model,
    required this.option,
    required this.quantity,
    required this.availableQuantity,
    required this.recurring,
    required this.stock,
    required this.reward,
    required this.price,
    required this.total,
    required this.priceRaw,
    required this.totalRaw,
    bool selected = false,
  }) {
    isSelected.value = selected;
  }

  factory CartProduct.fromJson(Map<String, dynamic> json) {
    return CartProduct(
      key: json['key'] ?? "",
      thumb: json['thumb'] ?? "",
      name: json['name'] ?? "",
      points: json['points'] ?? 0,
      productId: json['product_id'] ?? "",
      model: json['model'] ?? "",
      option:
          (json['option'] as List<dynamic>?)
              ?.map((e) => ProductOption.fromJson(e))
              .toList() ??
          [],
      quantity: json['quantity'] ?? "",
      availableQuantity: json['available_qantity'] ?? "",
      recurring: json['recurring'] ?? "",
      stock: json['stock'] ?? false,
      reward: json['reward'] ?? "",
      price: json['price'] ?? "",
      total: json['total'] ?? "",
      priceRaw: json['price_raw'] ?? "",
      totalRaw: json['total_raw'] ?? "",
    );
  }
}

class ProductOption {
  final String name;
  final String value;
  final String availableQuantity;

  ProductOption({
    required this.name,
    required this.value,
    required this.availableQuantity,
  });

  factory ProductOption.fromJson(Map<String, dynamic> json) {
    return ProductOption(
      name: json['name'] ?? "",
      value: json['value'] ?? "",
      availableQuantity: json['available_quanity'] ?? "",
    );
  }
}

class CartTotal {
  final String title;
  final String text;
  final String value;
  final String currency;

  CartTotal({
    required this.title,
    required this.text,
    required this.value,
    required this.currency,
  });

  factory CartTotal.fromJson(Map<String, dynamic> json) {
    return CartTotal(
      title: json['title'] ?? "",
      text: json['text'] ?? "",
      value: json['value'] ?? "",
      currency: json['currency'] ?? "",
    );
  }
}
