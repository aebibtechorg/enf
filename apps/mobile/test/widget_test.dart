import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:mobile/main.dart';
import 'package:mobile/features/auth/providers/auth_provider.dart';

void main() {
  testWidgets('shows the Better Auth sign in screen when signed out', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authProvider.overrideWith(_UnauthenticatedAuthController.new),
        ],
        child: const AbibApp(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Example App'), findsOneWidget);
    expect(find.text('Sign in'), findsWidgets);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Create account'), findsNothing);
  });
}

class _UnauthenticatedAuthController extends AuthController {
  @override
  AuthState build() {
    return const AuthState(isReady: true);
  }
}
