import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class PaymentInformationScreen extends StatelessWidget {
  const PaymentInformationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: AppTextWidget(
          text: "Payment Information",
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        centerTitle: true,
        elevation: 0,
        leading: Directionality(
          textDirection: TextDirection.ltr,
          child: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.black, size: 22.sp),
            onPressed: () => Navigator.pop(context),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 🟠 Section 1 — Overview
            Center(
              child: AppTextWidget(
                text: "Payment Methods on Dress Fair",
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: AppColors.primaryColor,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text:
                  "At Dress Fair, we make online shopping easy and reliable. We currently offer **Cash on Delivery (COD)** as our main payment option so that you can pay for your order only after it reaches your doorstep.",
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
              maxLines: 10,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 2 — What is COD
            Center(
              child: AppTextWidget(
                text: "What is Cash on Delivery (COD)?",
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text:
                  "Cash on Delivery allows you to pay for your order in cash once your package is delivered. This ensures a safe and trusted shopping experience for customers who prefer not to make online payments.",
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
              maxLines: 10,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 3 — Benefits of COD
            Center(
              child: AppTextWidget(
                text: "Why Choose Cash on Delivery?",
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text:
                  "Dress Fair understands that trust and convenience matter most. Our Cash on Delivery service offers:",
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "• No advance payment required",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Pay only after receiving your product",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Hassle-free and secure transactions",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Builds trust for new shoppers",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 4 — Future Methods
            Center(
              child: AppTextWidget(
                text: "Future Payment Options",
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text:
                  "We are working to introduce more convenient and secure digital payment methods in the near future. Upcoming payment options on Dress Fair will include:",
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: "• Credit & Debit Card Payments",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Bank Transfers",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Mobile Wallets & Payment Gateways",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            AppTextWidget(
              text: "• Easy Installment Options (Coming Soon)",
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: Colors.black,
            ),
            SizedBox(height: 20.h),

            // 🟠 Section 5 — Security
            Center(
              child: AppTextWidget(
                text: "Your Payment Security",
                fontSize: 14.sp,
                fontWeight: FontWeight.w700,
                color: Colors.orange.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            AppTextWidget(
              text:
                  "At Dress Fair, your safety and satisfaction are our top priorities. Whether paying by Cash on Delivery or upcoming online methods, we ensure all transactions are processed securely with trusted logistics and payment partners.",
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: Colors.black.withOpacity(0.8),
              maxLines: 10,
            ),
            SizedBox(height: 30.h),
          ],
        ),
      ),
    );
  }
}
