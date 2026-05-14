class DealProductModel {
  final int productId;
  final String productSku;
  final String currencyCode;
  final String name;
  final String nameAr;
  final DealProductCategory productCategory;
  final DealPrice price;
  final DealTimer timer;
  final List<DealProductImage> images;

  DealProductModel({
    required this.productId,
    required this.productSku,
    required this.currencyCode,
    required this.name,
    required this.nameAr,
    required this.productCategory,
    required this.price,
    required this.timer,
    required this.images,
  });

  factory DealProductModel.fromJson(Map<String, dynamic> json) {
    return DealProductModel(
      productId: json['product_id'],
      productSku: json['product_sku'],
      currencyCode: json['currency_code'],
      name: json['name'],
      nameAr: json['name_ar'],
      productCategory: DealProductCategory.fromJson(json['product_category']),
      price: DealPrice.fromJson(json['price']),
      timer: DealTimer.fromJson(json['timer']),
      images: (json['images'] as List<dynamic>)
          .map((e) => DealProductImage.fromJson(e))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'product_sku': productSku,
    'currency_code': currencyCode,
    'name': name,
    'name_ar': nameAr,
    'product_category': productCategory.toJson(),
    'price': price.toJson(),
    'timer': timer.toJson(),
    'images': images.map((e) => e.toJson()).toList(),
  };
}

class DealProductCategory {
  final String name;
  final String nameAr;

  DealProductCategory({required this.name, required this.nameAr});

  factory DealProductCategory.fromJson(Map<String, dynamic> json) {
    return DealProductCategory(name: json['name'], nameAr: json['name_ar']);
  }

  Map<String, dynamic> toJson() => {'name': name, 'name_ar': nameAr};
}

class DealPrice {
  final double normalPrice;
  final double offerPrice;
  final bool hasOffer;
  final String dateStart;
  final String dateEnd;
  final bool hasSale;

  final bool hasBundle;
  final bool hasNormal;

  DealPrice({
    required this.normalPrice,
    required this.offerPrice,
    required this.hasOffer,
    required this.dateStart,
    required this.dateEnd,
    this.hasSale = false,

    this.hasBundle = false,
    this.hasNormal = false,
  });

  factory DealPrice.fromJson(Map<String, dynamic> json) {
    return DealPrice(
      normalPrice: (json['normal_price'] as num).toDouble(),
      offerPrice: (json['offer_price'] as num).toDouble(),
      hasOffer: json['has_offer'],
      dateStart: json['date_start'],
      dateEnd: json['date_end'],
    );
  }

  num getDisplayPrice() {
    if (hasOffer) return offerPrice;
    return normalPrice;
  }

  /// Cut/strikethrough price
  num? getCutPrice() {
    if (getDisplayPrice() != normalPrice) {
      return normalPrice;
    }
    return null;
  }

  Map<String, dynamic> toJson() => {
    'normal_price': normalPrice,
    'offer_price': offerPrice,
    'has_offer': hasOffer,
    'date_start': dateStart,
    'date_end': dateEnd,
  };
}

class DealTimer {
  final String days;
  final String hours;
  final String minutes;
  final String seconds;
  final double percent;
  final String status;

  DealTimer({
    required this.days,
    required this.hours,
    required this.minutes,
    required this.seconds,
    required this.percent,
    required this.status,
  });

  factory DealTimer.fromJson(Map<String, dynamic> json) {
    return DealTimer(
      days: json['days'],
      hours: json['hours'],
      minutes: json['minutes'],
      seconds: json['seconds'],
      percent: (json['percent'] as num).toDouble(),
      status: json['status'],
    );
  }

  Map<String, dynamic> toJson() => {
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds,
    'percent': percent,
    'status': status,
  };
}

class DealProductImage {
  final int productId;
  final String image;
  final int? isMain;
  final int? isArabicMain;

  DealProductImage({
    required this.productId,
    required this.image,
    this.isMain,
    this.isArabicMain,
  });

  factory DealProductImage.fromJson(Map<String, dynamic> json) {
    return DealProductImage(
      productId: json['product_id'],
      image: json['image'],
      isMain: json['isMain'],
      isArabicMain: json['isArabicMain'],
    );
  }

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'image': image,
    'isMain': isMain,
    'isArabicMain': isArabicMain,
  };
}

class DealPagination {
  final int currentPage;
  final int perPage;
  final int total;
  final int lastPage;
  final String? nextPageUrl;
  final String? prevPageUrl;

  DealPagination({
    required this.currentPage,
    required this.perPage,
    required this.total,
    required this.lastPage,
    this.nextPageUrl,
    this.prevPageUrl,
  });

  factory DealPagination.fromJson(Map<String, dynamic> json) {
    return DealPagination(
      currentPage: json['current_page'],
      perPage: json['per_page'],
      total: json['total'],
      lastPage: json['last_page'],
      nextPageUrl: json['next_page_url'],
      prevPageUrl: json['prev_page_url'],
    );
  }

  Map<String, dynamic> toJson() => {
    'current_page': currentPage,
    'per_page': perPage,
    'total': total,
    'last_page': lastPage,
    'next_page_url': nextPageUrl,
    'prev_page_url': prevPageUrl,
  };
}
