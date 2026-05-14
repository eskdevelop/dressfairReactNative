import 'dart:convert';
import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/hive_db/all_cache/category_cache_helper.dart';
import 'package:dress_fair_ecommmerce/model/category_model/category_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/category_repository/category_repository.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../repository/service/network/api_response.dart';
import '../../view/util/app_toast/app_toast.dart';
import '../get_deals_controller/get_deals_controller.dart';
import '../internet_connectivity_check/InternetController.dart';

class CategoryController extends GetxController
    with GetTickerProviderStateMixin {
  DealsController dealsController = Get.put(DealsController());

  /// -------------------- STATE VARIABLES -------------------- ///
  Rx<TabController?> tabController = Rx<TabController?>(null);
  RxBool isLoading = false.obs;
  RxList<CategoryModel> categories = <CategoryModel>[].obs;

  Rx<CategoryModel?> selectedCategory = Rx<CategoryModel?>(null);
  RxInt isSelected = 0.obs;

  final CategoryRepository apiRepository = CategoryRepository();
  final SessionController sessionController = Get.find<SessionController>();
  final CategoryCacheHelper cacheHelper = CategoryCacheHelper();

  /// -------------------- INITIAL LOAD -------------------- ///
  Future<void> loadCategories() async {
    /// 2️⃣ Try loading cached categories from Hive
    final cached = cacheHelper.getCategories();
    if (cached.isNotEmpty) {
      categories.assignAll(cached);
      log("✅ Loaded categories from cache (${cached.length})");
      _recreateTabController();
      selectedCategory.value = categories.first;
      isSelected.value = categories.first.id;
      return;
    }

    /// 3️⃣ If cache is empty, fetch from API
    await getCategories();
  }

  /// -------------------- DEFAULT STATIC CATEGORIES -------------------- ///
  // void loadDefaultCategories() {
  //   if (categories.isNotEmpty) return;
  //
  //   categories.assignAll([
  //     CategoryModel(
  //       id: 0,
  //       name: 'All',
  //       nameAr: 'الكل',
  //       subCategories: [],
  //       products: [],
  //     ),
  //     // Home & Kitchen Category (id: 9)
  //     CategoryModel(
  //       id: 9,
  //       name: "Home & Kitchen",
  //       nameAr: "المنزل والمطبخ",
  //       subCategories: [
  //         SubCategoryModel(
  //           id: 66,
  //           groupMainCategoryId: 9,
  //           name: "Cleaning Accessories",
  //           nameAr: "إكسسوارات التنظيف",
  //           image: "category_images/1767172154-cleaning-asssories.png",
  //           slug: "cleaning-accessories",
  //         ),
  //         SubCategoryModel(
  //           id: 68,
  //           groupMainCategoryId: 9,
  //           name: "Storage",
  //           nameAr: "تخزين",
  //           image: "category_images/1767172304-Storage.png",
  //           slug: "storage",
  //         ),
  //         SubCategoryModel(
  //           id: 65,
  //           groupMainCategoryId: 9,
  //           name: "Household",
  //           nameAr: "مستلزمات المنزل",
  //           image: "category_images/1767172265-household.png",
  //           slug: "household",
  //         ),
  //         SubCategoryModel(
  //           id: 69,
  //           groupMainCategoryId: 9,
  //           name: "Kitchen Supplies",
  //           nameAr: "أدوات المطبخ",
  //           image: "category_images/1767172286-kitchen.png",
  //           slug: "kitchen-supplies",
  //         ),
  //         SubCategoryModel(
  //           id: 67,
  //           groupMainCategoryId: 9,
  //           name: "Bathroom Essentials",
  //           nameAr: "مستلزمات الحمام",
  //           image: "category_images/1767172115-batroom-esstionals-copy.png",
  //           slug: "bathroom-essentials",
  //         ),
  //         SubCategoryModel(
  //           id: 64,
  //           groupMainCategoryId: 9,
  //           name: "Home Electronics",
  //           nameAr: "إلكترونيات منزلية",
  //           image: "category_images/1767172245-home-electronics.png",
  //           slug: "home-electronics",
  //         ),
  //         SubCategoryModel(
  //           id: 71,
  //           groupMainCategoryId: 9,
  //           name: "Home Decor",
  //           nameAr: "ديكور المنزل",
  //           image: "category_images/1767172222-home decore-200x200.png",
  //           slug: "home-decor",
  //         ),
  //       ],
  //       products: [
  //         ProductModelNew(
  //           productId: 2463,
  //           productSku: 'A-09BK',
  //           currencyCode: 'AED',
  //           name:
  //               "A9 Mini Security Camera – HD Wifi Surveillance with Night Vision & Video Recorder",
  //           nameAr:
  //               "كاميرا أمان صغيرة A9 – مراقبة واي فاي بجودة عالية مع رؤية ليلية وتسجيل فيديو",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 65.00,
  //             salePrice: 38.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/686ce41f60380_A-09BK-1.webp",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 2462,
  //           productSku: 'A-09W',
  //           currencyCode: 'AED',
  //           name:
  //               "A9 Mini Security Camera – HD Wifi Surveillance with Night Vision & Video Recorder",
  //           nameAr:
  //               "كاميرا أمان صغيرة A9 – مراقبة واي فاي بجودة عالية مع رؤية ليلية وتسجيل فيديو",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 65.00,
  //             salePrice: 38.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/686ce416ebdae_A-09W-7.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 2461,
  //           productSku: 'A-05',
  //           currencyCode: 'AED',
  //           name: "White Shoe Cleaning Cream Renew and Protect Your Footwear",
  //           nameAr: "كريم تنظيف الأحذية البيضاء يجدد ويحمي حذائك",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 40.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/69147072d740a_A-05-main.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1675,
  //           productSku: 'P-20',
  //           currencyCode: 'AED',
  //           name: "Liquid Chrome Marker Create Stunning Metallic Effects",
  //           nameAr: "علامة الكروم السائلة - تخلق تأثيرات معدنية مذهلة",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 35.00,
  //             salePrice: 19.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/685a7cb42698d_P-20-main.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1624,
  //           productSku: 'MHK-88-White',
  //           currencyCode: 'AED',
  //           name:
  //               "3-in-1 Smart Household Robot Vacuum Cleaner for Homes & Offices",
  //           nameAr: "روبوت مكنسة ذكية 3 في 1 للمنازل والمكاتب",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 140.00,
  //             salePrice: 89.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/69466e5ecd14d_MHK-88-White-10.webp",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1623,
  //           productSku: 'MHK-88-Black',
  //           currencyCode: 'AED',
  //           name:
  //               "3-in-1 Smart Household Robot Vacuum Cleaner for Homes & Offices",
  //           nameAr: "روبوت مكنسة ذكية 3 في 1 للمنازل والمكتب",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 140.00,
  //             salePrice: 89.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/69466e59914ad_MHK-88-Black-91.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1622,
  //           productSku: 'MHK-87',
  //           currencyCode: 'AED',
  //           name:
  //               "Intelligent Constant Temperature Portable Clothes Dryer – Foldable, Compact, Digital Display",
  //           nameAr:
  //               "مجفف ملابس ذكي بدرجة حرارة ثابتة – قابل للطي وصغير الحجم مع شاشة رقمية",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 150.00,
  //             salePrice: 99.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68b1742a848c1_MHK-87-0.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1621,
  //           productSku: 'MHK-86',
  //           currencyCode: 'AED',
  //           name:
  //               "4-in-1 Manual Rotary Slicer & Grater – Multifunctional Vegetable Cutter & Cheese Shredder",
  //           nameAr:
  //               "قطاعة خضار ومبشرة 4 في 1 يدوية – متعددة الاستخدام لتقطيع وبشر الجبن والخضار",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 65.00,
  //             salePrice: 49.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68b17453a8603_MHK-86-0.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1620,
  //           productSku: 'MHK-84',
  //           currencyCode: 'AED',
  //           name:
  //               "Active Enzyme Laundry Stain Remover 120ml Stubborn Stains Cleaner",
  //           nameAr:
  //               "مزيل بقع الغسيل بالإنزيم النشط، 120 مل، منظف البقع العنيدة",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 55.00,
  //             salePrice: 39.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/6915c106e9c32_MHK-84-1.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1619,
  //           productSku: 'MHK-83',
  //           currencyCode: 'AED',
  //           name:
  //               "SupMaKin Upright Mandoline Slicer For Vegetables And Potatoes With Adjustable Thickness",
  //           nameAr:
  //               "SupMaKin قطاعة مندولين عمودية للخضروات والبطاطس بسمك قابل للتعديل",
  //           productCategory: ProductCategory(
  //             name: "Home & Kitchen",
  //             nameAr: "المنزل والمطبخ",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 49.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/6862d15e94f45_MHK-83-0.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //       ],
  //     ),
  //     // Beauty & Health Category (id: 7)
  //     CategoryModel(
  //       id: 7,
  //       name: "Beauty & Health",
  //       nameAr: "الجمال والصحة",
  //       subCategories: [
  //         SubCategoryModel(
  //           id: 51,
  //           groupMainCategoryId: 7,
  //           name: "Skin Care",
  //           nameAr: "العناية بالبشرة",
  //           image: "category_images/1767171675-skin-care.png",
  //           slug: "skin-care",
  //         ),
  //         SubCategoryModel(
  //           id: 48,
  //           groupMainCategoryId: 7,
  //           name: "Hair Care",
  //           nameAr: "العناية بالشعر",
  //           image: "category_images/1767171483-haiir-care.png",
  //           slug: "hair-care",
  //         ),
  //         SubCategoryModel(
  //           id: 52,
  //           groupMainCategoryId: 7,
  //           name: "Personal care",
  //           nameAr: "العناية الشخصية",
  //           image: "category_images/1767171658-pernal-care.png",
  //           slug: "personal-care",
  //         ),
  //         SubCategoryModel(
  //           id: 50,
  //           groupMainCategoryId: 7,
  //           name: "Makeup",
  //           nameAr: "مكياج",
  //           image: "category_images/1767171508-makeup.png",
  //           slug: "makeup",
  //         ),
  //         SubCategoryModel(
  //           id: 49,
  //           groupMainCategoryId: 7,
  //           name: "Makeup Tools",
  //           nameAr: "أدوات المكياج",
  //           image: "category_images/1767171595-makeuptools.png",
  //           slug: "makeup-tools",
  //         ),
  //       ],
  //       products: [
  //         ProductModelNew(
  //           productId: 2472,
  //           productSku: 'MP-220',
  //           currencyCode: 'AED',
  //           name:
  //               "30ml Refreshing Rosemary Essential Oil with Plant Squalane – Hair Strengthening & Scalp Revitalizing Care",
  //           nameAr:
  //               "زيت إكليل الجبل العطري المنعش مع السكوالين النباتي – 30مل للعناية بالشعر وتنشيط فروة الرأس",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 65.00,
  //             salePrice: 29.00,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/692573c260681_MP-220-1.jpeg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1748,
  //           productSku: 'P-167-Black',
  //           currencyCode: 'AED',
  //           name:
  //               "Portable Mini Electric Shaver for Men – USB Rechargeable, Waterproof, Pocket Size",
  //           nameAr:
  //               "ماكينة حلاقة كهربائية صغيرة للرجال – قابلة للشحن عبر USB، مقاومة للماء، بحجم الجيب",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 49.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68d5862a97227_P-167-Black-1.webp",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1747,
  //           productSku: 'P-151-White',
  //           currencyCode: 'AED',
  //           name:
  //               "1PC Copper Peptide Serum RF3120 – Anti-Aging & Skin Renewal Formula",
  //           nameAr:
  //               "سيروم الببتيد النحاسي RF3120 لتجديد البشرة ومكافحة التجاعيد",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 59.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68d585678f904_P-151-White-2.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1746,
  //           productSku: 'P-129-White',
  //           currencyCode: 'AED',
  //           name: "Heel Pain Relief Ointment – Herbal Foot Cream 30g",
  //           nameAr: "مرهم تخفيف آلام الكعب – كريم عشبي للقدم 30 جم",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 39.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68d58815202b6_P-129-White-4.webp",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1745,
  //           productSku: 'P-126-White',
  //           currencyCode: 'AED',
  //           name:
  //               "Snap On Veneers & False Teeth Kit – Moldable Snap-On Smile Replacement for Missing Teeth, Cosmetic Dentures with Whitening Strips, Grinding Guard & Fake Braces",
  //           nameAr:
  //               "طقم عدسات الأسنان المتحركة – بديل ابتسامة فورية للأسنان المفقودة، أطقم أسنان تجميلية قابلة للتشكيل مع شرائط تبييض، واقي طحن الأسنان وتقويم أسنان تجميلي",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 49.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68d587f419e7e_P-126-White-23.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1744,
  //           productSku: 'P-115-Cream',
  //           currencyCode: 'AED',
  //           name:
  //               "30ml Color-Adaptive Liquid Foundation – Skin Tone Matching Makeup Base",
  //           nameAr:
  //               "كريم أساس سائل متكيّف 30 مل – يتطابق مع لون البشرة تلقائيًا",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 49.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/693175553d14e_P-115-Cream-3.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1743,
  //           productSku: 'P-105-Black',
  //           currencyCode: 'AED',
  //           name:
  //               "Adjustable Posture Corrector for Men and Women – Back Brace for Upper & Lower Back Pain Relief, Shoulder Support for Spine Alignment, Scoliosis & Hunchback",
  //           nameAr:
  //               "مصحح وضعية الظهر للرجال والنساء – مشد قابل للتعديل لتخفيف آلام الظهر العلوية والسفلية، ودعم الكتف لتقويم العمود الفقري والحدب",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 89.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/69319c8b27b14_P-105-Black-15.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1742,
  //           productSku: 'P-104-Black',
  //           currencyCode: 'AED',
  //           name:
  //               "Back Brace Posture Corrector for Women & Men – Adjustable Back Straightener",
  //           nameAr:
  //               "دعامة الظهر لتصحيح وضعية الجسم للنساء والرجال - مُقوِّم ظهر قابل للتعديل",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 69.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/6936c92745ac5_P-104-Black-20.webp",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1741,
  //           productSku: 'P-103-Blue',
  //           currencyCode: 'AED',
  //           name:
  //               "Private Anti-Itch & Antibacterial Cream | Fast Soothing Treatment for Men – 20g",
  //           nameAr:
  //               "كريم مضاد للحكة والبكتيريا للمناطق الحساسة | علاج مهدئ سريع للرجال – 20 جم",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 59.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/68d588999e9c9_P-103-Blue-3.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //         ProductModelNew(
  //           productId: 1740,
  //           productSku: 'P-102-Brown',
  //           currencyCode: 'AED',
  //           name:
  //               "Botox Face Serum | Anti-Aging, Dark Spot & Deep Wrinkle Repair – 30ml",
  //           nameAr:
  //               "سيروم بوتوكس للوجه | مضاد للشيخوخة وإصلاح البقع الداكنة والتجاعيد العميقة – 30 مل",
  //           productCategory: ProductCategory(
  //             name: "Beauty & Health",
  //             nameAr: "الجمال والصحة",
  //           ),
  //           price: ProductPrice(
  //             normalPrice: 69.00,
  //             salePrice: null,
  //             hasSale: false,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/6862e0dbac8c3_P-102-Brown-17.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //       ],
  //     ),
  //     // Cell Phone Category (id: 8)
  //     CategoryModel(
  //       id: 8,
  //       name: "Cell Phone",
  //       nameAr: "الهواتف",
  //       subCategories: [
  //         SubCategoryModel(
  //           id: 62,
  //           groupMainCategoryId: 8,
  //           name: "Phone Accessories",
  //           nameAr: "إكسسوارات الهاتف",
  //           image: "category_images/1767171921-assories-200x200.png",
  //           slug: "phone-accessories",
  //         ),
  //         SubCategoryModel(
  //           id: 55,
  //           groupMainCategoryId: 8,
  //           name: "Phone Holders & Stands",
  //           nameAr: "حوامل ومساند الهواتف",
  //           image: "category_images/1767172020-phone-assories.png",
  //           slug: "phone-holders-stands",
  //         ),
  //       ],
  //       products: [
  //         ProductModelNew(
  //           productId: 2452,
  //           productSku: '',
  //           currencyCode: '',
  //           name: "Trendy Fish Mouth Buckle Sandal",
  //           nameAr: "صندل كاجوال",
  //           productCategory: ProductCategory(name: '', nameAr: ''),
  //           price: ProductPrice(
  //             normalPrice: 9.00,
  //             salePrice: 4.90,
  //             hasSale: true,
  //           ),
  //           images: [
  //             ProductImage(
  //               image: "productimages/694cebb35603a_S-370BK-26.jpg",
  //               isMain: 1,
  //               isArabicMain: 0,
  //             ),
  //           ],
  //         ),
  //       ],
  //     ),
  //   ]);
  //
  //   /// initialize tabs for default
  //   _recreateTabController();
  //
  //   /// select first
  //   if (categories.isNotEmpty) {
  //     selectedCategory.value = categories.first;
  //     isSelected.value = categories.first.id;
  //   }
  // }

  /// -------------------- API CALL -------------------- ///
  Future<void> getCategories() async {
    if (!await InternetController.checkUserConnection()) {
      AppToast.showError("internetDisconnected".tr);
      return;
    }
    try {
      isLoading.value = true;
      final response = await apiRepository.getCategory(
        sessionToken: sessionController.sessionToken.value,
      );

      if (response != null && response["success"] == true) {
        final String responseBody = jsonEncode(response);
        final fetchedList = await compute(parseCategories, responseBody);

        if (fetchedList.isNotEmpty) {
          categories.assignAll(fetchedList);

          final allSubCategories = <SubCategoryModel>[];
          for (var cat in fetchedList) {
            allSubCategories.addAll(cat.subCategories);
          }

          /// Get first 10 products of the first category:
          final allProduct = <ProductModelNew>[];
          if (fetchedList.first.products.isNotEmpty) {
            allProduct.addAll(fetchedList.first.products.take(15));
          }

          /// Optionally add "All" category at the start:
          categories.insert(
            0,
            CategoryModel(
              id: 0,
              name: 'All',
              nameAr: 'الكل',
              subCategories: allSubCategories,
              products: allProduct,
            ),
          );

          /// Save fetched categories to Hive:
          await cacheHelper.saveCategories(categories);

          selectedCategory.value = categories.first;
          isSelected.value = categories.first.id;

          _recreateTabController();
          log("✅ Categories fetched & cached (${fetchedList.length})");
        }
      } else {
        log("❌ GetCategories Error: ${response?["error"] ?? "Failed"}");
        AppToast.showError(response?["error"] ?? "failedToLoadCategories".tr);
      }
    } catch (e) {
      log("❌ Exception in GetCategories: ${e.toString()}");
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }

  /// -------------------- SELECT CATEGORY -------------------- ///
  void selectCategory(CategoryModel category) {
    selectedCategory.value = category;
    isSelected.value = category.id;
    selectedCategory.refresh();
    isSelected.refresh();
  }

  @override
  void onClose() {
    tabController.value?.dispose();
    tabController.value = null;
    super.onClose();
  }

  /// -------------------- TAB CONTROLLER -------------------- ///
  void _recreateTabController() {
    final length = categories.length;

    // Dispose old controller if exists
    tabController.value?.dispose();
    dealsController.tabController.value?.dispose();
    if (length > 0) {
      tabController.value = TabController(length: length, vsync: this);
      dealsController.tabController.value = TabController(
        length: length,
        vsync: this,
      );

      /// NOTE: We intentionally do NOT call `selectCategory(...)` from the
      /// home TabBar listener. Doing so used to mutate `isSelected.value`,
      /// which is observed by `MainCategoryScreen` (a different bottom-nav
      /// root that stays mounted in the IndexedStack). That cross-tree
      /// side-effect rebuilt `MainCategoryScreen` on every home tab swipe
      /// and was a major source of tab-switch jank.
      ///
      /// `MainCategoryScreen` updates `isSelected` itself on tap; the home
      /// tab bar tracks its own selection through the `TabController`.
    }
  }
}

/// -------------------- PARSER -------------------- ///
List<CategoryModel> parseCategories(String responseBody) {
  final Map<String, dynamic> parsed = jsonDecode(responseBody);
  if (parsed['data'] == null) return [];
  return (parsed['data'] as List)
      .map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
      .toList();
}
