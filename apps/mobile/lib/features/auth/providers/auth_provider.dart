import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/auth/better_auth_client.dart';

final authProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);

class AuthUser {
  const AuthUser({
    required this.email,
    required this.name,
  });

  final String email;
  final String? name;
}

class AuthState {
  const AuthState({
    this.user,
    this.isReady = false,
    this.isSubmitting = false,
    this.errorMessage,
    this.successMessage,
  });

  final AuthUser? user;
  final bool isReady;
  final bool isSubmitting;
  final String? errorMessage;
  final String? successMessage;

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    AuthUser? user,
    bool clearUser = false,
    bool? isReady,
    bool? isSubmitting,
    String? errorMessage,
    bool clearError = false,
    String? successMessage,
    bool clearSuccess = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isReady: isReady ?? this.isReady,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess ? null : (successMessage ?? this.successMessage),
    );
  }
}

class AuthController extends Notifier<AuthState> {
  bool _restoreScheduled = false;

  @override
  AuthState build() {
    if (!_restoreScheduled) {
      _restoreScheduled = true;
      Future.microtask(restoreSession);
    }

    return const AuthState();
  }

  Future<void> restoreSession() async {
    state = state.copyWith(isReady: false, clearError: true, clearSuccess: true);

    try {
      final session = await BetterAuthClient.instance.getSession();
      state = AuthState(
        user: session == null
            ? null
            : AuthUser(
                email: session.user.email,
                name: session.user.name,
              ),
        isReady: true,
      );
    } catch (error) {
      state = AuthState(
        isReady: true,
        errorMessage: _readErrorMessage(error),
      );
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      await BetterAuthClient.instance.signIn(email: email, password: password);
      await _loadAuthenticatedUser();
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        isReady: true,
        errorMessage: _readErrorMessage(error),
      );
      rethrow;
    }
  }

  Future<void> signUp({
    required String email,
    required String password,
    required String name,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      await BetterAuthClient.instance.signUp(
        email: email,
        password: password,
        name: name,
      );
      await _loadAuthenticatedUser();
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        isReady: true,
        errorMessage: _readErrorMessage(error),
      );
      rethrow;
    }
  }

  Future<void> forgotPassword(String email) async {
    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      // Use the custom scheme for mobile redirect
      await BetterAuthClient.instance.forgetPassword(
        email: email,
        redirectTo: 'exampleapp://auth/reset-password',
      );
      state = state.copyWith(
        isSubmitting: false,
        successMessage: 'Password reset link sent to your email.',
      );
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: _readErrorMessage(error),
      );
      rethrow;
    }
  }

  Future<void> resetPassword({
    required String newPassword,
    required String token,
  }) async {
    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      await BetterAuthClient.instance.resetPassword(
        newPassword: newPassword,
        token: token,
      );
      state = state.copyWith(
        isSubmitting: false,
        successMessage: 'Password updated successfully. You can now sign in.',
      );
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: _readErrorMessage(error),
      );
      rethrow;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isSubmitting: true, clearError: true, clearSuccess: true);

    try {
      await BetterAuthClient.instance.signOut();
      state = const AuthState(isReady: true);
    } catch (error) {
      state = state.copyWith(
        isSubmitting: false,
        isReady: true,
        errorMessage: _readErrorMessage(error),
      );
      rethrow;
    }
  }

  Future<void> _loadAuthenticatedUser() async {
    final session = await BetterAuthClient.instance.getSession();

    state = AuthState(
      user: session == null
          ? null
          : AuthUser(
              email: session.user.email,
              name: session.user.name,
            ),
      isReady: true,
    );
  }

  String _readErrorMessage(Object error) {
    if (error is BetterAuthException) {
      return error.message;
    }

    return error.toString();
  }
}
