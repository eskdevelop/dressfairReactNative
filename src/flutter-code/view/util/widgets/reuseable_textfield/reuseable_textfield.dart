import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class ValidatedTextField extends StatelessWidget {
  final TextEditingController controller;
  final String? hintText;
  final String? labelText;
  final TextInputType keyboardType;
  final bool obscureText;
  final int maxLines;
  final String emptyErrorText;

  const ValidatedTextField({
    super.key,
    required this.controller,
    this.hintText,
    this.labelText,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.maxLines = 1,
    this.emptyErrorText = 'Enter Your Email Address',
  });

  OutlineInputBorder _buildBorder(Color color, {double width = 1.2}) {
    return OutlineInputBorder(
      borderRadius: BorderRadius.circular(6.r),
      borderSide: BorderSide(color: color, width: width),
    );
  }

  @override
  Widget build(BuildContext context) {
    final enabledColor = Colors.black38;

    return TextFormField(
      controller: controller,
      autovalidateMode: AutovalidateMode.disabled, // ✅ REQUIRED
      cursorColor: AppColors.primaryColor,
      keyboardType: keyboardType,
      obscureText: obscureText,
      maxLines: maxLines,
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return emptyErrorText;
        }
        return null;
      },
      decoration: InputDecoration(
        hintText: hintText,
        // labelText: labelText,
        // labelStyle: TextStyle(color: Colors.black.withOpacity(0.5)),
        floatingLabelStyle: const TextStyle(
          color: AppColors.primaryColor,
          fontWeight: FontWeight.w600,
        ),
        hintStyle: TextStyle(
          color: Colors.black.withOpacity(0.4),
          fontSize: 13.sp,
        ),
        // suffixIcon: controller.text.isNotEmpty
        //     ? GestureDetector(
        //         onTap: controller.clear,
        //         child: const Icon(Icons.clear),
        //       )
        //     : null,
        isDense: true,
        contentPadding: EdgeInsets.symmetric(vertical: 10.h, horizontal: 8.w),
        enabledBorder: _buildBorder(enabledColor),
        focusedBorder: _buildBorder(
          Colors.black.withOpacity(0.8),
          width: 0.5.w,
        ),
        errorBorder: _buildBorder(Colors.black.withOpacity(0.8)),
        focusedErrorBorder: _buildBorder(
          Colors.black.withOpacity(0.8),
          width: 0.5.w,
        ),
      ),
    );
  }
}
