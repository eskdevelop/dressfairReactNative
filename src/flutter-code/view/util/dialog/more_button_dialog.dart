import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class MoreButtons extends StatefulWidget {
  VoidCallback yes;
  VoidCallback no;
  double deliveryLat;
  double deliveryLng;

  MoreButtons({
    super.key,
    required this.no,
    required this.yes,
    required this.deliveryLat,
    required this.deliveryLng,
  });

  @override
  State<MoreButtons> createState() => _MoreButtonsState();
}

class _MoreButtonsState extends State<MoreButtons> {
  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      alignment: Alignment.center,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.r)),
      insetPadding: EdgeInsets.symmetric(horizontal: 20.w),

      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: BouncingScrollPhysics(),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [],
        ),
      ),
    );
  }
}
