import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/services.dart';

import 'core/api/api_client.dart';
import 'core/auth/better_auth_client.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/ui/auth_gate.dart';
import 'features/auth/ui/auth_screen.dart';
import 'features/users/ui/user_list_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await BetterAuthClient.instance.initialize();
  ApiClient.instance.initialize();

  runApp(const ProviderScope(child: DeepLinkHandler(child: AbibApp())));
}

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const AuthGate(child: DashboardScreen()),
    ),
    GoRoute(
      path: '/users',
      builder: (context, state) => const AuthGate(child: UserListScreen()),
    ),
    GoRoute(
      path: '/reset-password',
      builder: (context, state) {
        final token = state.uri.queryParameters['token'];
        return AuthScreen(initialToken: token);
      },
    ),
  ],
);

class AbibApp extends StatelessWidget {
  const AbibApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Example App',
      routerConfig: _router,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0f766e)),
        useMaterial3: true,
      ),
    );
  }
}

class DeepLinkHandler extends ConsumerStatefulWidget {
  final Widget child;

  const DeepLinkHandler({required this.child, super.key});

  @override
  ConsumerState<DeepLinkHandler> createState() => _DeepLinkHandlerState();
}

class _DeepLinkHandlerState extends ConsumerState<DeepLinkHandler> {
  static const MethodChannel _channel = MethodChannel('exampleapp/deeplink');

  @override
  void initState() {
    super.initState();
    _initPlatformLinks();
    // Listen for platform-initiated calls (onNewLink)
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onNewLink') {
        final arg = call.arguments;
        if (arg is String) {
          try {
            await _handleUri(Uri.parse(arg));
          } catch (_) {
            // ignore malformed
          }
        }
      }
    });
  }

  Future<void> _initPlatformLinks() async {
    try {
      final String? initial = await _channel.invokeMethod<String>('getInitialLink');
      if (initial != null) {
        try {
          await _handleUri(Uri.parse(initial));
        } catch (_) {
          // ignore malformed
        }
      }
    } on PlatformException {
      // ignore
    }
  }

  Future<void> _handleUri(Uri uri) async {
    // Handle Better Auth callbacks
    // Example: exampleapp://auth/reset-password?token=...
    if (uri.scheme == 'exampleapp' && uri.host == 'auth') {
      if (uri.path == '/reset-password') {
        final token = uri.queryParameters['token'];
        if (token != null) {
          _router.go('/reset-password?token=$token');
          return;
        }
      }

      // Default: attempt to restore session (for other callbacks)
      try {
        final authController = ref.read(authProvider.notifier);
        await authController.restoreSession();
      } catch (_) {
        // ignore errors
      }
    }
  }

  @override
  void dispose() {
    // AppLinks uses callbacks registered in the constructor; nothing to cancel here.
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final authController = ref.read(authProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Abib Dashboard'),
        actions: [
          if (authState.user != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
              child: Text(
                authState.user!.name?.trim().isNotEmpty == true
                    ? authState.user!.name!
                    : authState.user!.email,
              ),
            ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: authState.isSubmitting
                ? null
                : () async {
                    await authController.logout();
                  },
          ),
        ],
      ),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        children: [
          _MenuCard(
            title: 'Users',
            icon: Icons.people,
            onTap: () => context.push('/users'),
          ),
          _MenuCard(
            title: 'Billing',
            icon: Icons.payments,
            onTap: () {},
          ),
          _MenuCard(
            title: 'Files',
            icon: Icons.folder,
            onTap: () {},
          ),
          _MenuCard(
            title: 'Settings',
            icon: Icons.settings,
            onTap: () {},
          ),
        ],
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;

  const _MenuCard({
    required this.title,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: const Color(0xFFaa3bff)),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
