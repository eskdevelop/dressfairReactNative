import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

PreferredSizeWidget reuseAbleAppBar({
  required String title,
  bool showBack = false,
  List<Widget>? actions,
}) {
  return AppBar(
    automaticallyImplyLeading: showBack,
    centerTitle: true,
    backgroundColor: AppColors.primaryColor,
    title: Text(
      title,
      style: TextStyle(
        fontSize: 17.0.sp,
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
    ),
    actions: actions,
  );
}
