import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../../view/util/shared_prefrences/user_prefrences.dart';
import 'api_exceptions.dart';

class ApiResponses {
  dynamic returnResponse(http.Response response) {
    switch (response.statusCode) {
      case 200:
      case 201:
      case 400:
      case 406:
      case 409:
      case 422:
        return jsonDecode(response.body);

      case 401:
        UserPreferences.clearAll();
        return jsonDecode(response.body);
      //return {"success": false, "message": "Unauthorized request"};
      case 404:
        //UserPreferences.clearAll();
        // Invalid Token. Expired Token
        return {"success": false, "message": ""};
      //throw UnauthorisedException("Not found");
      case 403:
        throw UnauthorisedException("Error Status Code 403");
      case 422:
        throw UnauthorisedException("Invalid input");

      case 500:
        return {"success": false, "message": "Internal Server Error"};
      // case 302:
      //   UserPreferences.clearAll();
      //   return {"success": false, "message": "Invalid Token. Expired Token"};
      default:
        throw FetchDataException(
          "Error communicating with server (status code: ${response.statusCode})",
        );
    }
  }
}

class ErrorHandler {
  static String getErrorMessage(dynamic error) {
    if (error is AppException) {
      return error.toString();
    } else if (error is FormatException) {
      return "Invalid response format";
    } else if (error is Map<String, dynamic>) {
      return error["message"]?.toString() ??
          error["response"]?.toString() ??
          "Something went wrong";
    } else {
      return error?.toString() ?? "Something went wrong";
    }
  }
}
