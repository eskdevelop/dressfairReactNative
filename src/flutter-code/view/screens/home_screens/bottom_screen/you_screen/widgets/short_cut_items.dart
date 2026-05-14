import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class ShortcutItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const ShortcutItem({super.key, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 22.sp),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(fontSize: 10.sp, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}
