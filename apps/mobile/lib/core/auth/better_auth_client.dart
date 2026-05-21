import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';

import '../config/app_config.dart';

class BetterAuthClient {
  BetterAuthClient._internal();

  static final BetterAuthClient _instance = BetterAuthClient._internal();

  static BetterAuthClient get instance => _instance;

  late final Dio _dio;
  CookieJar? _cookieJar;
  String? _cachedToken;
  bool _isInitialized = false;

  Future<void> initialize() async {
    if (_isInitialized) {
      return;
    }

    _cookieJar = await _createCookieJar();
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.authBaseUrl,
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 5),
        headers: {
          'Content-Type': 'application/json',
          if (!kIsWeb) 'Origin': AppConfig.authClientOrigin,
        },
        validateStatus: (status) => status != null && status < 500,
      ),
    );

    _dio.interceptors.add(CookieManager(_cookieJar!));
    _dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));

    _isInitialized = true;
  }

  Future<BetterAuthSession?> getSession() async {
    await initialize();

    final response = await _dio.get<Map<String, dynamic>>('/api/auth/get-session');
    if (response.statusCode == 401) {
      _cachedToken = null;
      return null;
    }

    _throwIfFailed(response, fallbackMessage: 'Unable to restore auth session.');

    var payload = response.data;
    if ((payload?['needsRefresh'] as bool?) == true) {
      final refreshResponse = await _dio.post<Map<String, dynamic>>('/api/auth/get-session');
      if (refreshResponse.statusCode == 401) {
        _cachedToken = null;
        return null;
      }

      _throwIfFailed(refreshResponse, fallbackMessage: 'Unable to refresh auth session.');
      payload = refreshResponse.data;
    }

    final session = payload?['session'];
    final user = payload?['user'];
    if (session is! Map<String, dynamic> || user is! Map<String, dynamic>) {
      _cachedToken = null;
      return null;
    }

    return BetterAuthSession(
      sessionId: session['id'] as String?,
      user: BetterAuthSessionUser(
        email: user['email'] as String? ?? '',
        name: user['name'] as String?,
      ),
    );
  }

  Future<void> forgetPassword({
    required String email,
    required String redirectTo,
  }) async {
    await initialize();

    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/request-password-reset',
      data: {
        'email': email,
        'redirectTo': redirectTo,
      },
    );

    _throwIfFailed(response, fallbackMessage: 'Unable to request password reset.');
  }

  Future<void> resetPassword({
    required String newPassword,
    required String token,
  }) async {
    await initialize();

    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/reset-password',
      data: {
        'newPassword': newPassword,
        'token': token,
      },
    );

    _throwIfFailed(response, fallbackMessage: 'Unable to reset password.');
    _cachedToken = null;
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    await initialize();

    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/sign-in/email',
      data: {
        'email': email,
        'password': password,
        'rememberMe': true,
      },
    );

    _throwIfFailed(response, fallbackMessage: 'Unable to sign in.');
    _cachedToken = null;
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String name,
  }) async {
    await initialize();

    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/sign-up/email',
      data: {
        'email': email,
        'password': password,
        'name': name,
      },
    );

    _throwIfFailed(response, fallbackMessage: 'Unable to create account.');
    _cachedToken = null;
  }

  Future<void> signOut() async {
    await initialize();

    final response = await _dio.post<Map<String, dynamic>>('/api/auth/sign-out');
    if (response.statusCode != null && response.statusCode! >= 400 && response.statusCode != 401) {
      _throwIfFailed(response, fallbackMessage: 'Unable to sign out.');
    }

    _cachedToken = null;
    await _cookieJar?.deleteAll();
  }

  Future<String?> getApiToken({bool forceRefresh = false}) async {
    await initialize();

    if (!forceRefresh && _cachedToken != null) {
      return _cachedToken;
    }

    final response = await _dio.get<Map<String, dynamic>>('/api/auth/token');
    if (response.statusCode == 401) {
      _cachedToken = null;
      return null;
    }

    _throwIfFailed(response, fallbackMessage: 'Unable to retrieve API token.');

    _cachedToken = response.data?['token'] as String?;
    return _cachedToken;
  }

  Future<CookieJar> _createCookieJar() async {
    if (kIsWeb) {
      return CookieJar();
    }

    final directory = await getApplicationSupportDirectory();
    return PersistCookieJar(
      ignoreExpires: false,
      storage: FileStorage('${directory.path}/better_auth_cookies'),
    );
  }

  void _throwIfFailed(
    Response<Map<String, dynamic>> response, {
    required String fallbackMessage,
  }) {
    final statusCode = response.statusCode ?? 500;
    if (statusCode < 400) {
      return;
    }

    throw BetterAuthException(
      response.data?['message'] as String?
          ?? response.statusMessage
          ?? fallbackMessage,
      statusCode: statusCode,
    );
  }
}

class BetterAuthSession {
  const BetterAuthSession({
    required this.sessionId,
    required this.user,
  });

  final String? sessionId;
  final BetterAuthSessionUser user;
}

class BetterAuthSessionUser {
  const BetterAuthSessionUser({
    required this.email,
    required this.name,
  });

  final String email;
  final String? name;
}

class BetterAuthException implements Exception {
  const BetterAuthException(this.message, {required this.statusCode});

  final String message;
  final int statusCode;

  @override
  String toString() => message;
}