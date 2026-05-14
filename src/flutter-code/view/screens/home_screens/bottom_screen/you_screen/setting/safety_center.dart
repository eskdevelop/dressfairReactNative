import '../../../../../util/widgets/routes/screens_library.dart';

class SafetyCenter extends StatelessWidget {
  const SafetyCenter({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ================= SLIVER APP BAR =================
          SliverAppBar(
            pinned: true,
            expandedHeight: 230.h,
            backgroundColor: const Color(0xFF2E7D32),
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Get.back(),
            ),
            title: AppTextWidget(
              text: 'Safety And Security',
              color: Colors.white,
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
            ),
            flexibleSpace: LayoutBuilder(
              builder: (context, constraints) {
                final double height = constraints.biggest.height;
                final bool collapsed =
                    height <=
                    kToolbarHeight + MediaQuery.of(context).padding.top + 20;

                return Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF2E7D32), Color(0xFF4CAF50)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                  ),
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: collapsed ? 0 : 1,
                    child: Padding(
                      padding: EdgeInsets.only(
                        top: MediaQuery.of(context).padding.top + 56.h,
                        left: 16.w,
                        right: 16.w,
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: SingleChildScrollView(
                              physics: const NeverScrollableScrollPhysics(),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  AppTextWidget(
                                    text: 'Safety center',
                                    fontSize: 22.sp,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                  SizedBox(height: 8.h),
                                  AppTextWidget(
                                    text:
                                        'Dress Fair is committed to creating a safe shopping '
                                        'environment. Learn about our efforts to enhance '
                                        'Dress Fair\'s security for you.',
                                    fontSize: 13.sp,
                                    color: Colors.white.withOpacity(0.9),
                                    maxLines: 4,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          Icon(
                            Icons.shield_outlined,
                            color: Colors.white.withOpacity(0.9),
                            size: 48.sp,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // ================= CURVED CONTENT BACKGROUND =================
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: Offset(0, -24.h),
              child: ClipRRect(
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(24.r),
                  topRight: Radius.circular(24.r),
                ),
                child: Container(
                  color: Colors.white,
                  padding: EdgeInsets.only(top: 24.h),
                ),
              ),
            ),
          ),

          // ================= LIST CONTENT =================
          SliverList(
            delegate: SliverChildListDelegate([
              _sectionTitle('We protect your information on Dress Fair'),

              SizedBox(height: 12.h),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: Row(
                  children: [
                    _infoTile(
                      icon: Icons.lock_outline,
                      label: 'Data\nprotection',
                    ),
                    _infoTile(
                      icon: Icons.person_outline,
                      label: 'Account\nprotection',
                    ),
                    _infoTile(
                      icon: Icons.shopping_cart_outlined,
                      label: 'Payment\nprotection',
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),
              _sectionTitle('Stay safe from scammers'),

              SizedBox(height: 12.h),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                child: Row(
                  children: [
                    _infoTile(
                      icon: Icons.warning_amber_outlined,
                      label: 'Recognize\nscams',
                    ),
                    _infoTile(
                      icon: Icons.email_outlined,
                      label: 'Recognize scam\nemails',
                    ),
                    _infoTile(
                      icon: Icons.chat_bubble_outline,
                      label: 'Recognize scam\nmessages',
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),
              _sectionTitle('Report something suspicious'),

              _listTile(
                'Report a suspicious phone call, email or SMS/text message',
              ),
              _divider(),
              _listTile('Report a fake website or app similar to Dress Fair'),
              _divider(),
              _listTile(
                'Report fake promotions, gift card fraud, fake job opportunities, etc',
              ),

              SizedBox(height: 32.h),
            ]),
          ),
        ],
      ),
    );
  }

  // ================= HELPERS =================

  Widget _sectionTitle(String text) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: AppTextWidget(
        text: text,
        fontSize: 14.sp,
        fontWeight: FontWeight.w600,
      ),
    );
  }

  Widget _infoTile({required IconData icon, required String label}) {
    return Expanded(
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 4.w),
        padding: EdgeInsets.symmetric(vertical: 16.h),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: Colors.green, size: 26.sp),
            SizedBox(height: 8.h),
            AppTextWidget(
              text: label,
              textAlign: TextAlign.center,
              fontSize: 12.sp,
            ),
          ],
        ),
      ),
    );
  }

  Widget _listTile(String title) {
    return InkWell(
      onTap: () {},
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
        child: Row(
          children: [
            Expanded(
              child: AppTextWidget(text: title, fontSize: 14.sp),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _divider() {
    return Divider(height: 1, thickness: 1, color: Colors.grey.shade200);
  }
}
