import 'package:dress_fair_ecommmerce/controller/session_controller/session_controller.dart';
import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';

class SelectCountryRegion extends StatefulWidget {
  const SelectCountryRegion({super.key});
  @override
  State<SelectCountryRegion> createState() => _SelectCountryRegionState();
}

class _SelectCountryRegionState extends State<SelectCountryRegion> {
  SessionController sessionController = Get.find<SessionController>();
  @override
  Widget build(BuildContext context) {
    return SizedBox();
  }

  // Widget countries() {
  //   return Obx(
  //     () => ListView.separated(
  //       itemCount: sessionController.countries.length,
  //       separatorBuilder: (context, index) => Divider(height: 1),
  //       itemBuilder: (context, index) {
  //         final country = sessionController.countries[index];
  //         return ListTile(
  //           leading: Text(country["flag"]!, style: TextStyle(fontSize: 24)),
  //           title: Text(country["name"]!),
  //           trailing: Radio<String>(
  //             value: country["name"]!,
  //             groupValue: sessionController.selectedCountry.value,
  //             onChanged: (value) {
  //               sessionController.selectedCountry.value = value!;
  //             },
  //           ),
  //           onTap: () {
  //             sessionController.selectedCountry.value = country["name"]!;
  //           },
  //         );
  //       },
  //     ),
  //   );
  // }
}
