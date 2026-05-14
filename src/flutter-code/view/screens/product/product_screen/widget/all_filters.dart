// import 'dart:math';
//
// import 'package:flutter/material.dart';
// import 'package:flutter_screenutil/flutter_screenutil.dart';
//
// import '../../../../util/constant/app_colors/appcolors.dart';
//
// class ProductFilterScreen extends StatefulWidget {
//   const ProductFilterScreen({super.key});
//
//   @override
//   State<ProductFilterScreen> createState() => _ProductFilterScreenState();
// }
//
// class _ProductFilterScreenState extends State<ProductFilterScreen> {
//   final ScrollController _scrollController = ScrollController();
//
//   // Dummy product list
//   List<Map<String, dynamic>> _products = [];
//   bool _isLoadingMore = false;
//   int _currentPage = 1;
//   final int _limitPerPage = 10;
//   final int _totalPages = 5; // simulate API total pages
//
//   // Hardcoded filters/colors for UI
//   final List<String> _filters = [
//     'All',
//     'New',
//     'Popular',
//     'Men',
//     'Women',
//     'Sale',
//     'Accessories',
//   ];
//
//   @override
//   void initState() {
//     super.initState();
//     _loadInitialProducts();
//     _scrollController.addListener(_onScroll);
//   }
//
//   // Initial load
//   void _loadInitialProducts() {
//     _generateFakeProducts(page: 1);
//   }
//
//   // Fake pagination loader
//   void _onScroll() async {
//     if (!_scrollController.hasClients) return;
//     final position = _scrollController.position;
//     final trigger = position.maxScrollExtent * 0.8;
//
//     if (position.pixels >= trigger &&
//         !_isLoadingMore &&
//         _currentPage < _totalPages) {
//       setState(() => _isLoadingMore = true);
//
//       await Future.delayed(const Duration(seconds: 1)); // simulate API delay
//       _generateFakeProducts(page: _currentPage + 1);
//     }
//   }
//
//   // Generate random color
//   Color _randomColor() {
//     final random = Random();
//     return Color.fromRGBO(
//       random.nextInt(255),
//       random.nextInt(255),
//       random.nextInt(255),
//       1,
//     );
//   }
//
//   // Generate fake product list
//   void _generateFakeProducts({required int page}) {
//     final startIndex = _products.length;
//     final newProducts = List.generate(_limitPerPage, (index) {
//       return {
//         "name": "Product ${startIndex + index + 1}",
//         "price": 1000 + (index * 25),
//         "image":
//             "https://picsum.photos/seed/${startIndex + index}/400/400", // random image
//         "color": _randomColor(),
//       };
//     });
//
//     setState(() {
//       _currentPage = page;
//       _products.addAll(newProducts);
//       _isLoadingMore = false;
//     });
//   }
//
//   @override
//   void dispose() {
//     _scrollController.dispose();
//     super.dispose();
//   }
//
//   // --- UI Widgets ---
//   Widget _buildFilters() {
//     return SizedBox(
//       height: 45.h,
//       child: ListView.separated(
//         scrollDirection: Axis.horizontal,
//         padding: EdgeInsets.symmetric(horizontal: 12.w),
//         itemCount: _filters.length,
//         separatorBuilder: (_, __) => SizedBox(width: 10.w),
//         itemBuilder: (context, index) {
//           final color = _randomColor();
//           return Container(
//             padding: EdgeInsets.symmetric(horizontal: 16.w),
//             decoration: BoxDecoration(
//               color: color.withOpacity(0.15),
//               borderRadius: BorderRadius.circular(25.r),
//               border: Border.all(color: color, width: 1.2),
//             ),
//             alignment: Alignment.center,
//             child: Text(
//               _filters[index],
//               style: TextStyle(
//                 color: color,
//                 fontSize: 14.sp,
//                 fontWeight: FontWeight.w600,
//               ),
//             ),
//           );
//         },
//       ),
//     );
//   }
//
//   Widget _buildProductGrid() {
//     return GridView.builder(
//       shrinkWrap: true,
//       physics: const NeverScrollableScrollPhysics(),
//       padding: EdgeInsets.all(12.w),
//       gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
//         crossAxisCount: 2,
//         childAspectRatio: 0.68,
//         mainAxisSpacing: 2.h,
//         crossAxisSpacing: 10.w,
//       ),
//       itemCount: _products.length + (_isLoadingMore ? 1 : 0),
//       itemBuilder: (context, index) {
//         if (index == _products.length) {
//           return const Center(
//             child: CircularProgressIndicator(color: AppColors.primaryColor),
//           );
//         }
//
//         final product = _products[index];
//         return Container(
//           decoration: BoxDecoration(
//             color: Colors.white,
//             borderRadius: BorderRadius.circular(12.r),
//             boxShadow: [
//               BoxShadow(color: Colors.black12, blurRadius: 6, spreadRadius: 1),
//             ],
//           ),
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               ClipRRect(
//                 borderRadius: BorderRadius.vertical(top: Radius.circular(12.r)),
//                 child: Image.network(
//                   product["image"],
//                   height: 140.h,
//                   width: double.infinity,
//                   fit: BoxFit.cover,
//                 ),
//               ),
//               SizedBox(height: 8.h),
//               Padding(
//                 padding: EdgeInsets.symmetric(horizontal: 8.w),
//                 child: Text(
//                   product["name"],
//                   maxLines: 1,
//                   overflow: TextOverflow.ellipsis,
//                   style: TextStyle(
//                     fontSize: 14.sp,
//                     fontWeight: FontWeight.w600,
//                   ),
//                 ),
//               ),
//               SizedBox(height: 5.h),
//               Padding(
//                 padding: EdgeInsets.symmetric(horizontal: 8.w),
//                 child: Text(
//                   "Rs ${product["price"]}",
//                   style: TextStyle(
//                     fontSize: 13.sp,
//                     color: AppColors.primaryColor,
//                     fontWeight: FontWeight.w500,
//                   ),
//                 ),
//               ),
//             ],
//           ),
//         );
//       },
//     );
//   }
//
//   // --- MAIN UI ---
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.grey[100],
//
//       body: SingleChildScrollView(
//         controller: _scrollController,
//         physics: const BouncingScrollPhysics(),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.start,
//           children: [
//             SizedBox(height: 12.h),
//             _buildFilters(),
//             SizedBox(height: 15.h),
//             _buildProductGrid(),
//             SizedBox(height: 20.h),
//           ],
//         ),
//       ),
//     );
//   }
// }
