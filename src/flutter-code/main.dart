import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';
import 'hive_db/hive_db_all_data.dart';
import 'localization/app_translations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // TikTokService().initialize();
  // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await HiveDBAllData.initHive();
  await UserPreferences.init();
  //await TikTokService().initialize();
  // await TikTokService3().initialize();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // FlutterError.onError = (errorDetails) {
  //   FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  // };
  // // Pass all uncaught asynchronous errors that aren't handled by the Flutter framework to Crashlytics:
  // PlatformDispatcher.instance.onError = (error, stack) {
  //   FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
  //   return true;
  // };
  runApp(
    // DevicePreview(enabled: true, builder: (context) => MyApp()),
    MyApp(),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    WidgetsBinding.instance.addPostFrameCallback((v) async {
      await ATTHelper.requestTrackingPermission();
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    final sessionController = Get.put(SessionController());
    return ScreenUtilInit(
      designSize: const Size(360, 752),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return Obx(() {
          return GetMaterialApp(
            useInheritedMediaQuery: true,
            debugShowCheckedModeBanner: false,
            title: AppText.appName,
            translations: AppTranslations(),
            locale: sessionController.currentLocale,
            fallbackLocale: const Locale('en', 'US'),
            theme: ThemeData(
              colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
              useMaterial3: true,
            ),
            // home: LoginWithEmail(),
            initialRoute: splashScreen,
            getPages: AppPages.routes,

            //tikTokEventsPage,
          );
        });
      },
    );
  }
}
