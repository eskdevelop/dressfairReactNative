import 'package:flutter/gestures.dart';

import '../../util/widgets/routes/screens_library.dart';

class PrivacyButtons extends StatelessWidget {
  final VoidCallback? onTermsTap;
  final VoidCallback? onPrivacyTap;
  const PrivacyButtons({
    super.key,
    required this.onTermsTap,
    required this.onPrivacyTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: TextStyle(
              fontSize: 13.sp,
              fontWeight: FontWeight.w400,
              color: AppColors.blackColor.withOpacity(0.5),
            ),
            children: [
              TextSpan(text: "${AppText.privacyText} "),
              TextSpan(text: " "),
              TextSpan(
                text: AppText.hyperLinkPrivacyText,
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
                recognizer: TapGestureRecognizer()..onTap = onTermsTap,
              ),
              TextSpan(text: "  ${AppText.and}  "),
              TextSpan(
                text: AppText.hyperLinkPrivacyText1,
                style: TextStyle(
                  color: AppColors.primaryColor,
                  fontWeight: FontWeight.w600,
                ),
                recognizer: TapGestureRecognizer()..onTap = onPrivacyTap,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
