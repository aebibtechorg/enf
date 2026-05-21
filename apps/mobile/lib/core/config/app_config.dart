import 'package:flutter/foundation.dart';

class AppConfig {
  AppConfig._();

  static const String defaultAuthClientOrigin = 'http://localhost:5173';

  static String get apiBaseUrl => _readUrl(
        value: const String.fromEnvironment('API_URL'),
        fallbackPort: 5000,
      );

  static String get authBaseUrl => _readUrl(
        value: const String.fromEnvironment('AUTH_URL'),
        fallbackPort: 3005,
      );

  static String get authClientOrigin {
    final configured = const String.fromEnvironment('AUTH_CLIENT_ORIGIN').trim();
    if (configured.isNotEmpty) {
      return configured;
    }

    final derived = _tryReadOrigin(authBaseUrl);
    return derived ?? defaultAuthClientOrigin;
  }

  static String _readUrl({
    required String value,
    required int fallbackPort,
  }) {
    final trimmed = value.trim();
    if (trimmed.isNotEmpty) {
      return trimmed;
    }

    return 'http://$_defaultHost:$fallbackPort';
  }

  static String? _tryReadOrigin(String value) {
    final uri = Uri.tryParse(value);
    if (uri == null || !uri.hasScheme || uri.host.isEmpty) {
      return null;
    }

    return uri.origin;
  }

  static String get _defaultHost {
    if (kIsWeb) {
      return 'localhost';
    }

    return defaultTargetPlatform == TargetPlatform.android
        ? '10.0.2.2'
        : 'localhost';
  }
}