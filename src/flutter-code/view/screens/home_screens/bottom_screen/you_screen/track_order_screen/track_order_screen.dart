import 'dart:developer';

import 'package:dress_fair_ecommmerce/controller/address_controller/address_controller.dart';
import 'package:dress_fair_ecommmerce/controller/get_orders_status_controller/get_order_status_controller.dart';
import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class TrackOrderScreen extends StatefulWidget {
  const TrackOrderScreen({super.key});
  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen>
    with SingleTickerProviderStateMixin {
  final GetOrderStatusController getOrderStatusController = Get.put(
    GetOrderStatusController(),
  );
  AddressController addressController = Get.put(AddressController());
  late TabController tabController;

  @override
  void initState() {
    super.initState();
    tabController = TabController(
      length: getOrderStatusController.orderTrackTabs.length,
      vsync: this,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      getOrderStatusController.getOrderStatus();
      //  addressController.getAddress(context);
    });
  }

  SessionController sessionController = Get.find<SessionController>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: Colors.white,
        automaticallyImplyLeading: false,
        leading: GestureDetector(
          onTap: () {
            Get.back();
          },
          child: Icon(
            Icons.arrow_back_ios_new,
            size: 20.sp,
            color: Colors.black.withOpacity(0.7),
          ),
        ),
        title: GestureDetector(
          onTap: () {
            log("Session Token  ==${sessionController.sessionToken.value}");
          },
          child: AppTextWidget(
            text: AppText.yourOrders,
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: Colors.black.withOpacity(0.6),
          ),
        ),
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(48.h),
          child: TabBar(
            controller: tabController,
            isScrollable: true,
            indicatorColor: AppColors.primaryColor,
            padding: EdgeInsets.zero,
            dividerColor: Colors.transparent,
            tabAlignment: TabAlignment.start,
            indicator: BoxDecoration(),
            labelColor: AppColors.primaryColor,
            unselectedLabelColor: Colors.grey,
            labelPadding: EdgeInsets.symmetric(horizontal: 10.w),
            labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp),
            tabs: getOrderStatusController.orderTrackTabs
                .map((t) => Tab(text: t))
                .toList(),
          ),
        ),
      ),
      body: Column(
        children: [
          StaticTextContainer(text1: '', text2: ''),
          Expanded(
            child: Obx(() {
              if (getOrderStatusController.isLoading.value) {
                return Center(
                  child: CircularProgressIndicator(
                    color: AppColors.primaryColor,
                  ),
                );
              }
              return TabBarView(
                controller: tabController,
                children: getOrderStatusController.orderTrackScreens,
              );
            }),
          ),
        ],
      ),
    );
  }
}
