import 'package:flutter/material.dart';

extension SizeBoxUsed on double {
  //For SizeBox :
  SizedBox get sh => SizedBox(
        height: this,
      );
  SizedBox get sw => SizedBox(
        width: this,
      );
}


