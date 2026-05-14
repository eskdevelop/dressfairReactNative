import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:dress_fair_ecommmerce/view/util/widgets/routes/screens_library.dart';
import 'package:http/http.dart' as http;

import 'api_exceptions.dart';

abstract class BaseApiServices {
  Future<dynamic> fetchGetResponse(String url, String sessionToken);
  Future<dynamic> setSession(String url);
  Future<dynamic> getStoreSetting(String url);
  Future<dynamic> sendPostRequest(
    String url,
    dynamic data,
    String sessionToken,
  );
  Future<dynamic> sendMultipartPostRequest(
    String url,
    Map<String, String> fields,
    File? imageFile,
    String sessionToken,
  );

  /// For APIs where no body is required in POST
  Future<dynamic> sendPostWithoutBody(String url, String sessionToken);
  Future<dynamic> sendPutRequest(String url, dynamic data, String sessionToken);
  Future<dynamic> sendPatchRequest(
    String url,
    dynamic data,
    String sessionToken,
  );
  Future<dynamic> sendDeleteRequest(
    String url,
    dynamic data,
    String sessionToken,
  );

  // Future<dynamic> uploadMultipleFiles(String url, List<FileUploadModel> filesList, {String token = ""});
  Future<dynamic> uploadSingleFile(String url, File file, {String token = ""});
}

class NetworkApiService extends BaseApiServices {
  ApiResponses responseClass = ApiResponses();

  @override
  Future fetchGetResponse(String url, String sessionToken) async {
    dynamic responseJson;
    try {
      Map<String, String>? headers;
      if (sessionToken.isNotEmpty) {
        headers = {'Authorization': 'Bearer $sessionToken'};
      } else {
        headers = {};
      }
      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 300));
      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      // FirebaseCrashlytics.instance.recordError(FetchDataException('No Internet Connection'), StackTrace.current);
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      // This will catch all other exceptions
      //FirebaseCrashlytics.instance.recordError(e, s); // Log every exception to Crashlytics
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      ); // Provide more detailed error message
    }
    return responseJson;
  }

  @override
  @override
  Future sendPostRequest(String url, dynamic data, String sessionToken) async {
    Map<String, String>? headers;
    if (sessionToken.isNotEmpty) {
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $sessionToken',
      };
    } else {
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
    }
    log("POST URL  => $url");
    log("POST BODY => $data");

    dynamic responseJson;

    try {
      http.Response response;

      if (data == null) {
        response = await http
            .post(Uri.parse(url), headers: headers)
            .timeout(const Duration(seconds: 30));
      } else {
        response = await http
            .post(Uri.parse(url), headers: headers, body: jsonEncode(data))
            .timeout(const Duration(seconds: 30));
      }

      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      );
    }

    debugPrint(responseJson.toString());
    return responseJson;
  }

  @override
  Future sendPutRequest(String url, dynamic data, String sessionToken) async {
    dynamic responseJson;
    try {
      Map<String, String>? headers;
      if (sessionToken.isNotEmpty) {
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $sessionToken',
        };
      } else {
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      }
      log("POST URL  => $url");
      log("POST BODY => $data");

      final response = await http
          .put(Uri.parse(url), body: jsonEncode(data), headers: headers)
          .timeout(const Duration(seconds: 10));

      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      throw FetchDataException(
        'Failed to send PUT request due to an unexpected error: $e',
      );
    }
    return responseJson;
  }

  @override
  Future sendPatchRequest(String url, dynamic data, String sessionToken) async {
    Map<String, String>? headers;
    dynamic responseJson;
    try {
      ///
      Map<String, String>? headers;
      if (sessionToken.isNotEmpty) {
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $sessionToken',
        };
      } else {
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      }
      var response = await http
          .patch(Uri.parse(url), body: data, headers: headers)
          .timeout(const Duration(seconds: 10));
      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      //FirebaseCrashlytics.instance.recordError(FetchDataException('No Internet Connection'), StackTrace.current);
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      // This will catch all other exceptions
      //FirebaseCrashlytics.instance.recordError(e, s); // Log every exception to Crashlytics
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      );
    }
    return responseJson;
  }

  @override
  Future sendDeleteRequest(
    String url,
    dynamic data,
    String sessionToken,
  ) async {
    dynamic responseJson;
    try {
      ///
      Map<String, String>? headers;
      if (sessionToken.isNotEmpty) {
        headers = {
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $sessionToken',
        };
      } else {
        headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      }
      var response = await http
          .delete(Uri.parse(url), body: data, headers: headers)
          .timeout(const Duration(seconds: 10));
      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      //FirebaseCrashlytics.instance.recordError(FetchDataException('No Internet Connection'), StackTrace.current);
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      // This will catch all other exceptions
      //FirebaseCrashlytics.instance.recordError(e, s); // Log every exception to Crashlytics
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      ); // Provide more detailed error message
    }
    return responseJson;
  }

  @override
  Future uploadSingleFile(String url, File file, {String token = ""}) {
    throw UnimplementedError();
  }

  @override
  Future setSession(String url) async {
    dynamic responseJson;
    try {
      final response = await http
          .get(
            Uri.parse(url),
            headers: {'x-oc-merchant-id': 'CZ3acNSs58SBlZ2Vq1jWW1wUkr4yZqiJ'},
          )
          .timeout(const Duration(seconds: 300));
      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      // FirebaseCrashlytics.instance.recordError(FetchDataException('No Internet Connection'), StackTrace.current);
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      // This will catch all other exceptions
      //FirebaseCrashlytics.instance.recordError(e, s); // Log every exception to Crashlytics
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      ); // Provide more detailed error message
    }
    return responseJson;
  }

  @override
  Future getStoreSetting(String url) async {
    dynamic responseJson;
    try {
      final response = await http
          .get(Uri.parse(url), headers: {})
          .timeout(const Duration(seconds: 300));
      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      // FirebaseCrashlytics.instance.recordError(FetchDataException('No Internet Connection'), StackTrace.current);
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      // This will catch all other exceptions
      //FirebaseCrashlytics.instance.recordError(e, s); // Log every exception to Crashlytics
      throw FetchDataException(
        'Failed to send POST request due to an unexpected error: $e',
      ); // Provide more detailed error message
    }
    return responseJson;
  }

  @override
  Future sendPostWithoutBody(String url, String sessionToken) async {
    dynamic responseJson;
    try {
      Map<String, String>? headers;
      if (sessionToken.isNotEmpty) {
        headers = {
          'x-oc-session': sessionToken,
          'x-oc-merchant-id': 'CZ3acNSs58SBlZ2Vq1jWW1wUkr4yZqiJ',
        };
      } else {
        var headers = {};
      }
      final response = await http
          .post(Uri.parse(url), headers: headers)
          .timeout(const Duration(seconds: 30));

      responseJson = responseClass.returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      throw FetchDataException(
        'Failed to send POST request without body due to an unexpected error: $e',
      );
    }

    debugPrint(responseJson.toString());
    return responseJson;
  }

  @override
  Future<dynamic> sendMultipartPostRequest(
    String url,
    Map<String, String> fields,
    File? imageFile,
    String sessionToken,
  ) async {
    try {
      log("MULTIPART POST URL => $url");
      log("FIELDS => $fields");
      var request = http.MultipartRequest('POST', Uri.parse(url));

      /// Headers:
      if (sessionToken.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $sessionToken';
      }

      /// Add fields:
      request.fields.addAll(fields);

      /// Add image if exists:
      if (imageFile != null) {
        log("IMAGE IS NOT NULL => ${imageFile.path}");
        request.files.add(
          await http.MultipartFile.fromPath(
            "image", // backend key
            imageFile.path,
          ),
        );
      }
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      return ApiResponses().returnResponse(response);
    } on SocketException {
      throw FetchDataException('No Internet Connection');
    } catch (e) {
      throw FetchDataException("Multipart error: $e");
    }
  }
}
