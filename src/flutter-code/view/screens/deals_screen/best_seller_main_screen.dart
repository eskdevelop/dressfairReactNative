import 'package:dress_fair_ecommmerce/controller/get_deals_controller/get_deals_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../../../../../controller/home_controller/bottom_nav_controller/home_product_controller/get_banner_controller.dart';
import '../../../controller/new_arrival_controller/new_arrival_controller.dart';

class BestSellerMainScreen extends StatefulWidget {
  const BestSellerMainScreen({super.key});
  @override
  State<BestSellerMainScreen> createState() => _BestSellerMainScreenState();
}

class _BestSellerMainScreenState extends State<BestSellerMainScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  final dealsController = Get.find<DealsController>();
  final newArrivalController = Get.find<NewArrivalController>();
  final sessionController = Get.find<SessionController>();
  final GetBannerController bannerController = Get.put(GetBannerController());
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) {
      if (newArrivalController.newArrivals.isEmpty) {
        newArrivalController.getNewArrivals(isPagination: false);
      }
    });
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
        ),
        backgroundColor: AppColors.primaryColor,
        title: AppTextWidget(
          text: "newArrival".tr,
          fontWeight: FontWeight.w600,
          color: Colors.white,
          fontSize: 15.sp,
        ),
      ),

      body: _buildBody(),
    );
  }

  /// Build Body:
  Widget _buildBody() {
    return Column(
      children: [
        _buildStaticContent(),
        Expanded(child: _buildProductsGrid()),
      ],
    );
  }

  Widget _buildStaticContent() {
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          // 2.h.sh,
          StaticTextContainer(text1: "", text2: ""),
          2.h.sh,
        ],
      ),
    );
  }

  Widget _buildProductsGrid() {
    return Obx(() {
      if (newArrivalController.isLoading.value) {
        return Center(child: SpinLoadingBar());
      }
      if (newArrivalController.newArrivals.isEmpty) {
        return Center(child: AppTextWidget(text: "noDataFound".tr));
      }
      return GridView.builder(
        padding: EdgeInsets.only(bottom: 8.h),
        cacheExtent: 3000,
        physics: const BouncingScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisExtent: MediaQuery.sizeOf(context).height * 0.290,
          mainAxisSpacing: 3,
        ),
        itemCount: newArrivalController.newArrivals.length,
        itemBuilder: (context, index) {
          final item = newArrivalController.newArrivals[index];
          return ProductCard(
            item: item,
            sessionController: sessionController,
            fakeRating: 4.5,
            fakeReviews: 4,
          );
        },
      );
    });
  }
}
