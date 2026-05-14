import 'package:dress_fair_ecommmerce/view/screens/home_screens/bottom_screen/cart_screens/check_out_screen/widgets/library_check_out.dart';

class ContactUsPage extends StatefulWidget {
  const ContactUsPage({super.key});

  @override
  State<ContactUsPage> createState() => _ContactUsPageState();
}

class _ContactUsPageState extends State<ContactUsPage> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _topicController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.0.w, vertical: 24.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderSection(),
              SizedBox(height: 10.h),
              // Divider
              _buildDivider(),
              SizedBox(height: 10.h),

              // Form Section
              _buildFormSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBackButton() {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: IconButton(
        onPressed: () {
          Navigator.of(context).pop();
        },
        icon: Icon(Icons.arrow_back, color: Colors.grey[700], size: 20),
        padding: EdgeInsets.zero,
        constraints: const BoxConstraints(),
      ),
    );
  }

  Widget _buildHeaderSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Main Title
        AppTextWidget(
          text: 'Do you have any question ?',
          fontSize: 15.sp,
          fontWeight: FontWeight.bold,
        ),
        SizedBox(height: 10.h),

        // Subtitle:
        AppTextWidget(
          text: 'Let us help you',
          fontSize: 13.5.sp,
          fontWeight: FontWeight.w600,
          color: Colors.black.withOpacity(0.8),
        ),
        SizedBox(height: 10.h),
        // Description
        AppTextWidget(
          text:
              'Contact us if you have any questions, and we\'ll get back to you as soon as possible. You can also check out our help and frequently asked questions.',
          fontSize: 12.sp,
          fontWeight: FontWeight.w400,
          maxLines: 10,
          color: Colors.black.withOpacity(0.8),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(height: 1, color: Colors.grey[300]);
  }

  Widget _buildFormSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 2.h),
        // Section Title
        AppTextWidget(
          text: 'First Name',
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black,
        ),
        SizedBox(height: 4.h),
        // First Name Field
        _buildTextFieldWithLabel(
          label: 'First Name',
          controller: _firstNameController,
        ),
        SizedBox(height: 10.h),

        // Last Name Section
        AppTextWidget(
          text: 'Last Name',
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black.withOpacity(0.8),
        ),
        SizedBox(height: 4.h),
        // Last Name Field
        _buildTextFieldWithLabel(
          label: 'Last Name',
          controller: _lastNameController,
        ),
        SizedBox(height: 10.h),

        AppTextWidget(
          text: 'Email address',
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black.withOpacity(0.8),
        ),
        SizedBox(height: 4.h),
        // Email Field
        _buildTextFieldWithLabel(
          label: 'Enter email',
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
        ),
        SizedBox(height: 10.h),

        // Topic Section:
        AppTextWidget(
          text: 'Topic',
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black.withOpacity(0.8),
        ),
        SizedBox(height: 4.h),
        // Topic Field
        _buildTextFieldWithLabel(label: 'Topic', controller: _topicController),
        SizedBox(height: 10.h),

        // Message Section
        AppTextWidget(
          text: 'Message',
          fontSize: 12.sp,
          fontWeight: FontWeight.w500,
          color: Colors.black.withOpacity(0.8),
        ),
        SizedBox(height: 4.h),
        // Message Field
        _buildMessageField(),
        SizedBox(height: 10.h),
        AppButton(
          width: MediaQuery.sizeOf(context).width,
          height: 50.h,

          onTap: () {
            _submitForm();
          },
          textStyle: TextStyle(color: Colors.white),
          borderRadius: 30.r,
          isLoading: false.obs,
          text: "Submit",
        ),

        // Submit Button
      ],
    );
  }

  Widget _buildTextFieldWithLabel({
    required String label,
    required TextEditingController controller,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!, width: 1.w),
        borderRadius: BorderRadius.circular(4.r),
      ),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          contentPadding: EdgeInsets.symmetric(horizontal: 16.h),
          border: InputBorder.none,
          hintText: label,
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 13.5.sp),
        ),
        style: TextStyle(fontSize: 13.5, color: Colors.grey[800]),
      ),
    );
  }

  Widget _buildMessageField() {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!, width: 1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: TextField(
        controller: _messageController,
        maxLines: null,
        expands: true,
        textAlignVertical: TextAlignVertical.top,
        decoration: InputDecoration(
          contentPadding: EdgeInsets.symmetric(
            horizontal: 16.w,
            vertical: 16.h,
          ),
          border: InputBorder.none,
          hintText: 'Type your message here...',
          hintStyle: TextStyle(color: Colors.grey[500], fontSize: 13.5.sp),
        ),
        style: TextStyle(fontSize: 13.5.sp, color: Colors.grey[800]),
      ),
    );
  }

  void _submitForm() {
    // Handle form submission
    if (_firstNameController.text.isEmpty ||
        _lastNameController.text.isEmpty ||
        _emailController.text.isEmpty ||
        _topicController.text.isEmpty ||
        _messageController.text.isEmpty) {
      AppToast.showError("Please fill all fields");
      return;
    }
    AppToast.showSuccess("Message sent successfully!");
    // Clear form
    _firstNameController.clear();
    _lastNameController.clear();
    _emailController.clear();
    _topicController.clear();
    _messageController.clear();
    Get.back();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _topicController.dispose();
    _messageController.dispose();
    super.dispose();
  }
}
