import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class OfdReasonBottomSheet extends StatelessWidget {
  const OfdReasonBottomSheet({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      //height: MediaQuery.of(context).size.height * 0.4, // 40% of screen
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 50.w,
              height: 5.h,
              margin: EdgeInsets.only(bottom: 16.h),
              decoration: BoxDecoration(
                color: Colors.grey[400],
                borderRadius: BorderRadius.circular(10.r),
              ),
            ),

            ListTile(
              leading: const Icon(Icons.call_end, color: Colors.red),
              title: const Text("Not Responding"),
              onTap: () {
                Get.back();
                // Get.toNamed(
                //   remarkScreen,
                //   arguments: {
                //     "ofd": ofd,
                //     "statusCode": "2",
                //     "statusName": "Not Responding",
                //   },
                // );
              },
            ),
            ListTile(
              leading: const Icon(Icons.location_off, color: Colors.blue),
              title: const Text("Wrong Address"),
              onTap: () {
                Get.back();
                // Get.toNamed(
                //   remarkScreen,
                //   arguments: {
                //     "ofd": ofd,
                //     "statusCode": "3",
                //     "statusName": "Wrong Address",
                //   },
                // );
              },
            ),
            ListTile(
              leading: const Icon(Icons.schedule, color: Colors.orange),
              title: const Text("Future Delivery"),
              onTap: () {
                Get.back();
                // Get.toNamed(
                //   remarkScreen,
                //   arguments: {
                //     "ofd": ofd,
                //     "statusCode": "4",
                //     "statusName": "Future Delivery",
                //   },
                // );
              },
            ),
            ListTile(
              leading: const Icon(Icons.recycling, color: Colors.red),
              title: const Text("To Return"),
              onTap: () {
                Get.back();
                // Get.toNamed(
                //   remarkScreen,
                //   arguments: {
                //     "ofd": ofd,
                //     "statusCode": "6",
                //     "statusName": "To Return",
                //   },
                // );
              },
            ),
          ],
        ),
      ),
    );
  }
}
