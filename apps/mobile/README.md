# mobile

Flutter client for Example App.

## Auth integration

The mobile app now signs in against the Better Auth server and uses the returned
session cookie to fetch JWTs for the API.

Default local URLs:

- API: `http://10.0.2.2:5000` on Android emulators, `http://localhost:5000` elsewhere
- Auth: `http://10.0.2.2:3005` on Android emulators, `http://localhost:3005` elsewhere

Override them with a JSON file and `--dart-define-from-file` when needed.

Create a local file such as `apps/mobile/.env.local.json` based on `apps/mobile/env.example.json`:

```bash
cp env.example.json .env.local.json
```

```json
{
  "API_URL": "http://192.168.1.10:5000",
  "AUTH_URL": "http://192.168.1.10:3005",
  "AUTH_CLIENT_ORIGIN": "http://localhost:5173"
}
```

Then run Flutter with that file:

```bash
flutter run \
  --dart-define-from-file=.env.local.json
```

The app still reads `API_URL` and `AUTH_URL` through `String.fromEnvironment`, so no other code changes are needed when switching between local files.

`AUTH_CLIENT_ORIGIN` is sent as the `Origin` header for native Better Auth requests. Keep it aligned with the auth server's trusted origins (`AUTH_WEB_ORIGIN`) if you customize local URLs.

Use your Better Auth email/password credentials from the web stack to sign in.
