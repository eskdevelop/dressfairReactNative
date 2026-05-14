import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/hive_db/all_cache/get_banner_cache_helper.dart';
import 'package:dress_fair_ecommmerce/model/banner_model/banner_model.dart';
import 'package:dress_fair_ecommmerce/repository/service/network/repository/banner_repository/banner_repository.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class GetBannerController extends GetxController {
  RxBool isLoading = false.obs;
  RxList<BannerModel> banners = <BannerModel>[].obs;

  final BannerRepository apiRepository = BannerRepository();
  final BannerCacheHelper cacheHelper = BannerCacheHelper();
  final SessionController sessionController = Get.find<SessionController>();

  Future<void> loadBanners() async {
    // 1️⃣ Load from cache immediately (synchronous)
    final cached = cacheHelper.getBanners();
    if (cached.isNotEmpty) {
      banners.assignAll(cached);
      debugPrint("Loaded ${cached.length} banners from cache");
    }

    // 2️⃣ Fetch from API in background (does NOT block UI)
    _fetchBannersFromApi();
  }

  Future<void> _fetchBannersFromApi() async {
    try {
      // Only set isLoading true if no cache exists
      if (banners.isEmpty) isLoading.value = true;

      final hasConnection = await InternetController.checkUserConnection();
      if (!hasConnection) return;

      final response = await apiRepository.getBanner(
        sessionToken: sessionController.sessionToken.value,
      );

      if (response != null && response["success"] == true) {
        final list = (response['data'] as List)
            .map((e) => BannerModel.fromJson(e))
            .toList();

        // Save to cache
        await cacheHelper.saveBanners(list);

        // Update UI
        banners.assignAll(list);
        debugPrint("Fetched ${list.length} banners from API and updated cache");
      } else {
        AppToast.showError(response?["message"] ?? "Failed to load banners");
      }
    } catch (e) {
      AppToast.showError(ErrorHandler.getErrorMessage(e));
    } finally {
      isLoading.value = false;
    }
  }
}
