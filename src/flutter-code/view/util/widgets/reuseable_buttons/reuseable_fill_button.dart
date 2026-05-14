import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class AppButton extends StatelessWidget {
  double height;
  double width;
  double borderRadius;
  VoidCallback onTap;
  TextStyle textStyle;
  Color containerColor;
  String text;
  final RxBool isLoading;

  AppButton({
    super.key,
    required this.width,
    required this.height,
    required this.onTap,
    required this.textStyle,
    required this.borderRadius,
    required this.isLoading,
    this.containerColor = AppColors.primaryColor,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => GestureDetector(
        onTap: isLoading.value ? null : onTap, // disable when loading
        child: Container(
          height: height,
          width: width,
          decoration: BoxDecoration(
            color: containerColor,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          child: Center(
            child: isLoading.value
                ? const CircularProgressIndicator(color: Colors.white)
                : Center(
                    child: Text(
                      text,
                      style: textStyle,
                      maxLines: 1,
                      softWrap: true,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
