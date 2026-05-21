import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';

import '../providers/auth_provider.dart';

enum _AuthMode { signIn, signUp, forgotPassword, resetPassword }

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key, this.initialToken});

  final String? initialToken;

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  late _AuthMode _mode;
  String? _token;

  @override
  void initState() {
    super.initState();
    _mode = widget.initialToken != null ? _AuthMode.resetPassword : _AuthMode.signIn;
    _token = widget.initialToken;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Example App', style: theme.textTheme.labelLarge),
                        const Gap(8),
                        Text(
                          _mode == _AuthMode.signIn
                              ? 'Sign in'
                              : _mode == _AuthMode.signUp
                                  ? 'Create account'
                                  : _mode == _AuthMode.forgotPassword
                                      ? 'Reset password'
                                      : 'New password',
                          style: theme.textTheme.headlineMedium,
                        ),
                        const Gap(8),
                        Text(
                          _mode == _AuthMode.forgotPassword
                              ? 'Enter your email address and we\'ll send you a link to reset your password.'
                              : _mode == _AuthMode.resetPassword
                                  ? 'Enter your new password below to secure your account.'
                                  : 'Mobile now authenticates through Better Auth and exchanges that session for API JWTs automatically.',
                          style: theme.textTheme.bodyMedium,
                        ),
                        if (_mode == _AuthMode.signIn || _mode == _AuthMode.signUp) ...[
                          const Gap(20),
                          SegmentedButton<_AuthMode>(
                            segments: const [
                              ButtonSegment(
                                value: _AuthMode.signIn,
                                label: Text('Sign in'),
                              ),
                              ButtonSegment(
                                value: _AuthMode.signUp,
                                label: Text('Sign up'),
                              ),
                            ],
                            selected: {_mode},
                            onSelectionChanged: (selection) {
                              setState(() {
                                _mode = selection.first;
                              });
                            },
                          ),
                        ],
                        const Gap(20),
                        if (_mode == _AuthMode.signUp) ...[
                          TextFormField(
                            controller: _nameController,
                            decoration: const InputDecoration(
                              labelText: 'Name',
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (_mode == _AuthMode.signUp && (value == null || value.trim().isEmpty)) {
                                return 'Enter your name.';
                              }

                              return null;
                            },
                          ),
                          const Gap(12),
                        ],
                        if (_mode != _AuthMode.resetPassword) ...[
                          TextFormField(
                            controller: _emailController,
                            decoration: const InputDecoration(
                              labelText: 'Email',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.emailAddress,
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'Enter your email address.';
                              }

                              if (!value.contains('@')) {
                                return 'Enter a valid email address.';
                              }

                              return null;
                            },
                          ),
                          const Gap(12),
                        ],
                        if (_mode != _AuthMode.forgotPassword) ...[
                          TextFormField(
                            controller: _passwordController,
                            decoration: InputDecoration(
                              labelText: _mode == _AuthMode.resetPassword ? 'New Password' : 'Password',
                              border: const OutlineInputBorder(),
                            ),
                            obscureText: true,
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Enter your password.';
                              }

                              if (value.length < 8) {
                                return 'Use at least 8 characters.';
                              }

                              return null;
                            },
                          ),
                          if (_mode == _AuthMode.signIn) ...[
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () {
                                  setState(() {
                                    _mode = _AuthMode.forgotPassword;
                                  });
                                },
                                child: const Text('Forgot password?'),
                              ),
                            ),
                          ] else
                            const Gap(12),
                        ],
                        if (_mode == _AuthMode.resetPassword) ...[
                          TextFormField(
                            controller: _confirmPasswordController,
                            decoration: const InputDecoration(
                              labelText: 'Confirm New Password',
                              border: OutlineInputBorder(),
                            ),
                            obscureText: true,
                            validator: (value) {
                              if (value != _passwordController.text) {
                                return 'Passwords do not match.';
                              }
                              return null;
                            },
                          ),
                          const Gap(12),
                        ],
                        if (authState.errorMessage != null) ...[
                          const Gap(12),
                          Text(
                            authState.errorMessage!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.error,
                            ),
                          ),
                        ],
                        if (authState.successMessage != null) ...[
                          const Gap(12),
                          Text(
                            authState.successMessage!,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.green.shade700,
                            ),
                          ),
                        ],
                        const Gap(20),
                        SizedBox(
                          width: double.infinity,
                          child: FilledButton(
                            onPressed: authState.isSubmitting ? null : _submit,
                            child: Text(
                              authState.isSubmitting
                                  ? 'Working...'
                                  : _mode == _AuthMode.signIn
                                      ? 'Sign in'
                                      : _mode == _AuthMode.signUp
                                          ? 'Create account'
                                          : _mode == _AuthMode.forgotPassword
                                              ? 'Send reset link'
                                              : 'Reset Password',
                            ),
                          ),
                        ),
                        if (_mode == _AuthMode.forgotPassword || _mode == _AuthMode.resetPassword) ...[
                          const Gap(8),
                          SizedBox(
                            width: double.infinity,
                            child: TextButton(
                              onPressed: () {
                                setState(() {
                                  _mode = _AuthMode.signIn;
                                });
                              },
                              child: const Text('Back to sign in'),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final authController = ref.read(authProvider.notifier);

    if (_mode == _AuthMode.signIn) {
      await authController.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      return;
    }

    if (_mode == _AuthMode.signUp) {
      await authController.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _nameController.text.trim(),
      );
      return;
    }

    if (_mode == _AuthMode.forgotPassword) {
      await authController.forgotPassword(_emailController.text.trim());
      return;
    }

    if (_mode == _AuthMode.resetPassword) {
      if (_token == null) return;

      await authController.resetPassword(
        newPassword: _passwordController.text,
        token: _token!,
      );
      
      if (mounted) {
        setState(() {
          _mode = _AuthMode.signIn;
        });
      }
    }
  }
}