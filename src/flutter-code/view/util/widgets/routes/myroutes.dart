import 'package:dress_fair_ecommmerce/view/screens/auth/email_otp_verification.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/login_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/login_with_email.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/login_with_whatsapp.dart';
import 'package:dress_fair_ecommmerce/view/screens/auth/otp_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/cart/cart_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/check_out_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/category_screen/main_category_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/category_screen/sub_category_product_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/home_products_screen/home_product/home_product.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/account_setting/account_setting.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/setting/safety_center.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/track_order_screen/track_order_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/you_screen/you_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/home_screens/home_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/detail_product_screen/detail_product_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/product/product_screen/more_describe_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/search_screen/search_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/select_country_region.dart';
import 'package:dress_fair_ecommmerce/view/screens/splash_screen.dart';
import 'package:dress_fair_ecommmerce/view/screens/success_screen/success_screen.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

import '../../../screens/auth/profile_screen/all_in_one_profile_update.dart';
import '../../../screens/auth/profile_screen/profile_screen.dart';
import '../../../screens/auth/profile_screen/profile_screen_main.dart';
import '../../../screens/auth/registration_screen.dart';
import '../../../screens/deals_screen/best_seller_main_screen.dart';
import '../../../screens/deals_screen/deals_main.dart';
import '../../../screens/home_screens/address_screens/add_new_address.dart';
import '../../../screens/home_screens/address_screens/edit_address.dart';
import '../../../screens/home_screens/bottom_screen/category_screen/view_all_screen.dart';
import '../../../screens/home_screens/bottom_screen/you_screen/setting/notification_screen/notification_screen.dart';
import '../../../screens/home_screens/bottom_screen/you_screen/setting/permission_screens/permission_screen.dart';
import '../../../screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/legal_term_and_policy/privacy_policy.dart';
import '../../../screens/home_screens/bottom_screen/you_screen/setting/privacy_policy/main_legal_policy_screen.dart';
import '../../../screens/home_screens/bottom_screen/you_screen/setting/setting_main_screen.dart';

class AppPages {
  static final routes = <GetPage>[
    GetPage(name: splashScreen, page: () => const SplashScreen()),

    GetPage(name: homeScreen, page: () => const HomeScreen()),

    GetPage(name: loginInScreen, page: () => const LoginScreen()),

    GetPage(name: loginWithEmail, page: () => const LoginWithEmail()),

    GetPage(
      name: loginWithWhatsapp,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return LoginWithWhatsapp(isFromHome: args['isFromHome']);
      },
    ),

    GetPage(name: registrationScreen, page: () => RegistrationScreen()),

    GetPage(name: selectCountryRegion, page: () => const SelectCountryRegion()),

    GetPage(name: trackOrderScreen, page: () => const TrackOrderScreen()),

    GetPage(name: mainCategoryScreen, page: () => MainCategoryScreen()),
    GetPage(name: legalTermsScreen, page: () => LegalTermsScreen()),

    GetPage(name: searchScreen, page: () => SearchScreen()),
    GetPage(name: cartScreen, page: () => CartScreen()),
    GetPage(name: homeProduct, page: () => HomeProduct()),
    GetPage(name: youScreen, page: () => const YouScreen()),
    GetPage(name: settingsScreen, page: () => SettingsScreen()),
    GetPage(
      name: successScreen,
      page: () {
        final args = Get.arguments ?? {};
        return SuccessScreen(orderId: args['orderId']?.toString() ?? '');
      },
    ),

    GetPage(
      name: addNewAddress,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return AddNewAddress(id: args['id'], isEdit: args['isEdit']);
      },
    ),

    GetPage(
      name: editAddress,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return EditAddress(
          id: args['id'],
          isEdit: args['isEdit'],
          fullName: args['fullName'],
          mobileNo: args['mobileNo'],
          province: args['province'],
          address: args['address'],
          area: args['area'],
        );
      },
    ),

    GetPage(
      name: checkOutScreen,
      page: () {
        final cartItem = Get.arguments as List<Map<String, dynamic>>;
        return CheckOutScreen(cartItem: cartItem);
      },
    ),

    GetPage(
      name: otpScreen,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return OtpScreen(phone: args['phone']);
      },
    ),
    GetPage(
      name: emailOtpVerification,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return EmailOtpVerification(email: args['email']);
      },
    ),

    GetPage(
      name: subCategoryProductScreen,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return SubCategoryProductScreen(cateSlug: args['cateSlug']);
      },
    ),

    GetPage(
      name: productDetailScreen,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return ProductDetailScreen(
          cateSlug: args['cateSlug'],
          fakeRating: args['fakeRating'],
          fakeReviews: args['fakeReviews'],
        );
      },
    ),

    GetPage(
      name: moreDescribeScreen,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return MoreDescribeScreen(
          categoryId: args['categoryId'],
          cateSlug: args['cateSlug'],
        );
      },
    ),

    /// View All Screen:
    GetPage(
      name: viewAllScreen,
      page: () {
        final args = Get.arguments as Map<String, dynamic>;
        return ViewAllScreen(
          //  categoryId: args['categoryId'],
          cateSlug: args['cateSlug'],
        );
      },
    ),

    /// Permissions
    GetPage(
      name: permissionScreen,
      page: () {
        return PermissionScreen();
      },
    ),

    ///Notification Screen
    GetPage(
      name: notificationScreen,
      page: () {
        return NotificationScreen();
      },
    ),
    GetPage(
      name: privacyPolicy,
      page: () {
        return PrivacyPolicy();
      },
    ),
    GetPage(
      name: accountSetting,
      page: () {
        return AccountSetting();
      },
    ),

    GetPage(
      name: safetyCenter,
      page: () {
        return SafetyCenter();
      },
    ),
    GetPage(
      name: dealsMainTabs,
      page: () {
        return DealsMainTabs();
      },
    ),
    GetPage(
      name: bestSellerMainScreen,
      page: () {
        return BestSellerMainScreen();
      },
    ),
    GetPage(
      name: profileScreen,
      page: () {
        return ProfileScreen();
      },
    ),
    GetPage(
      name: profileScreenMain,
      page: () {
        return ProfileScreenMain();
      },
    ),
    GetPage(
      name: allInOneProfileUpdate,
      page: () {
        return AllInOneProfileUpdate();
      },
    ),
  ];
}
