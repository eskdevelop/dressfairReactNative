class SearchResultModel {
  final int id;
  final bool wishList;
  final int productId;
  final int categoryId;
  final String name;
  final String? manufacturer;
  final int percentOff;
  final String seoUrl;
  final String slug;
  final String model;
  final String image;
  final String mImage;
  final List<String> images;
  final String originalImage;
  final List<String> originalImages;
  final String priceExcludingTax;
  final String price;
  final double rating;
  final String details;
  final String description;
  final String special;
  final List<dynamic> options;
  final String metaTitle;
  final String metaDescription;
  final String metaKeyword;
  final int manufacturerId;
  final String weight;
  final dynamic reward;
  final String points;
  final int quantity;
  final List<dynamic> reviews;
  final int totalReviews;
  final List<dynamic> attributes;
  final int dealsFreeShipping;
  final List<dynamic> relatedCategory;
  final List<dynamic> productsSeries;
  final String currencyCode;

  SearchResultModel({
    required this.id,
    required this.wishList,
    required this.productId,
    required this.categoryId,
    required this.name,
    this.manufacturer,
    required this.percentOff,
    required this.seoUrl,
    required this.slug,
    required this.model,
    required this.image,
    required this.mImage,
    required this.images,
    required this.originalImage,
    required this.originalImages,
    required this.priceExcludingTax,
    required this.price,
    required this.rating, // ✅ Now accepts double
    required this.details,
    required this.description,
    required this.special,
    required this.options,
    required this.metaTitle,
    required this.metaDescription,
    required this.metaKeyword,
    required this.manufacturerId,
    required this.weight,
    this.reward,
    required this.points,
    required this.quantity,
    required this.reviews,
    required this.totalReviews,
    required this.attributes,
    required this.dealsFreeShipping,
    required this.relatedCategory,
    required this.productsSeries,
    required this.currencyCode,
  });

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    return SearchResultModel(
      id: json['id'] ?? 0,
      wishList: json['wish_list'] ?? false,
      productId: json['product_id'] ?? 0,
      categoryId: json['category_id'] ?? 0,
      name: json['name'] ?? '',
      manufacturer: json['manufacturer'],
      percentOff: json['percent_off'] ?? 0,
      seoUrl: json['seo_url'] ?? '',
      slug: json['slug'] ?? '',
      model: json['model'] ?? '',
      image: json['image'] ?? '',
      mImage: json['m_image'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      originalImage: json['original_image'] ?? '',
      originalImages: List<String>.from(json['original_images'] ?? []),
      priceExcludingTax: json['price_excluding_tax'] ?? '',
      price: json['price'] ?? '',
      // ✅ Safe parsing for rating (can be int or double)
      rating: (json['rating'] is int)
          ? (json['rating'] as int).toDouble()
          : (json['rating'] as double?) ?? 0.0,
      details: json['details'] ?? '',
      description: json['description'] ?? '',
      special: json['special'] ?? '',
      options: json['options'] ?? [],
      metaTitle: json['meta_title'] ?? '',
      metaDescription: json['meta_description'] ?? '',
      metaKeyword: json['meta_keyword'] ?? '',
      manufacturerId: json['manufacturer_id'] ?? 0,
      weight: json['weight'] ?? '',
      reward: json['reward'],
      points: json['points'] ?? '',
      quantity: json['quantity'] ?? 0,
      reviews: json['reviews'] ?? [],
      totalReviews: json['totalReviws'] ?? 0, // ✅ careful with spelling
      attributes: json['attrbutes'] ?? [], // ✅ careful with spelling
      dealsFreeShipping: json['deals_free_shipping'] ?? 0,
      relatedCategory: json['related_category'] ?? [],
      productsSeries: json['products_series'] ?? [],
      currencyCode: json['currency_code'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "wish_list": wishList,
      "product_id": productId,
      "category_id": categoryId,
      "name": name,
      "manufacturer": manufacturer,
      "percent_off": percentOff,
      "seo_url": seoUrl,
      "slug": slug,
      "model": model,
      "image": image,
      "m_image": mImage,
      "images": images,
      "original_image": originalImage,
      "original_images": originalImages,
      "price_excluding_tax": priceExcludingTax,
      "price": price,
      "rating": rating, // ✅ Now stores as double
      "details": details,
      "description": description,
      "special": special,
      "options": options,
      "meta_title": metaTitle,
      "meta_description": metaDescription,
      "meta_keyword": metaKeyword,
      "manufacturer_id": manufacturerId,
      "weight": weight,
      "reward": reward,
      "points": points,
      "quantity": quantity,
      "reviews": reviews,
      "totalReviws": totalReviews,
      "attrbutes": attributes,
      "deals_free_shipping": dealsFreeShipping,
      "related_category": relatedCategory,
      "products_series": productsSeries,
      "currency_code": currencyCode,
    };
  }
}
