import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/new_arrival_controller/new_arrival_controller.dart';

import '../../../../../../../controller/session_controller/session_controller.dart';
import '../../../../../../util/widgets/routes/screens_library.dart';

class NewArrivals extends StatefulWidget {
  const NewArrivals({super.key});

  @override
  State<NewArrivals> createState() => _NewArrivalsState();
}

class _NewArrivalsState extends State<NewArrivals>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  final NewArrivalController newArrivalController = Get.put(
    NewArrivalController(),
  );
  final SessionController sessionController = Get.find<SessionController>();

  late final ScrollController _scrollController;
  final RxBool hasReachedBottom = false.obs;
  @override
  void initState() {
    super.initState();

    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (newArrivalController.newArrivals.isEmpty) {
        log("Loading New Arrivals");
        newArrivalController.getNewArrivals();
      }
    });
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;

    final position = _scrollController.position;

    if (position.extentAfter < 600) {
      if (!newArrivalController.isMoreLoading.value &&
          newArrivalController.hasMore) {
        newArrivalController.requestNextPage();
      }
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Obx(() {
          /// Initial loading:
          if (newArrivalController.isLoading.value &&
              newArrivalController.newArrivals.isEmpty) {
            return ProductCardShimmer();
          }

          /// Empty state:
          if (newArrivalController.newArrivals.isEmpty) {
            return Center(
              child: Padding(
                padding: EdgeInsets.only(top: 30.h),
                child: AppTextWidget(text: ""),
              ),
            );
          }
          if (!newArrivalController.isMoreLoading.value) {
            hasReachedBottom.value = false;
          }
          return Column(
            children: [
              Expanded(child: _buildGrid()),
              if (hasReachedBottom.value &&
                  newArrivalController.isMoreLoading.value)
                _buildBottomLoader(),
              if (!newArrivalController.hasMore) _buildEndOfListMessage(),
            ],
          );
        }),
      ),
    );
  }

  /// GRID ONLY (NO LOADER INSIDE):
  Widget _buildGrid() {
    return GridView.builder(
      key: const PageStorageKey('new_arrivals_list'),
      controller: _scrollController,
      cacheExtent: 3000,
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.zero,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 3,
        mainAxisExtent: MediaQuery.sizeOf(context).height * 0.292,
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
  }

  /// BOTTOM LOADER (OUTSIDE GRID)
  Widget _buildBottomLoader() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: SpinKitFadingCircle(color: AppColors.greyColor, size: 30.sp),
    );
  }

  /// END MESSAGE
  Widget _buildEndOfListMessage() {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: AppTextWidget(
        text: "",

        //"You've reached the end",
        fontSize: 12.sp,
        color: Colors.grey.shade500,
      ),
    );
  }
}
