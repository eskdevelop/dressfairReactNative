import '../../../../../../util/widgets/routes/screens_library.dart';

Widget dottedLine({double height = 1, Color color = Colors.grey}) {
  return LayoutBuilder(
    builder: (context, constraints) {
      final boxWidth = 4.0; // width of each dash
      final dashCount = (constraints.maxWidth / (2 * boxWidth)).floor();
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(dashCount, (_) {
          return Container(width: boxWidth, height: height, color: color);
        }),
      );
    },
  );
}
