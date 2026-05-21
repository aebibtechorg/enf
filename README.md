# Example App

Example App is a full-stack monorepo built around a .NET 10 backend, a React web app, an Astro marketing site, and a Flutter mobile app. The repository is set up for local development with pnpm workspaces, shared contracts, and a .NET Aspire AppHost that can wire together the main services for local runs.

## What is in this repo

- `apps/api`: ASP.NET Core minimal API, feature-first structure, PostgreSQL + Redis integrations, optional Cloudflare R2 file storage.
- `apps/api.tests`: test project for the API and shared query helpers.
- `apps/aspire`: .NET Aspire AppHost for local orchestration of the API, auth server, web app, marketing site, PostgreSQL, and Redis.
- `apps/web`: React + Vite app plus a Node-based Better Auth server under `server/`. Includes Better Auth Studio at `/api/studio`.
- `apps/marketing`: Astro marketing site.
- `apps/mobile`: Flutter app.
- `packages/contracts`: shared .NET contracts and DTOs.
- `packages/infrastructure/ServiceDefaults`: shared Aspire service defaults for .NET services.
- `packages/ui`: shared UI package for frontend apps.
- `tools`: repo-level scripts, including EF Core migration helpers.
- `docs`: architecture notes and prompts.

## Prerequisites

- .NET SDK 10
- Node.js 22.12+
- pnpm 11
- Flutter SDK
- Docker Desktop or another local container runtime if you want Aspire-managed PostgreSQL and Redis

## Install

```bash
pnpm install
dotnet restore solution.slnx
```

## Recommended local workflow

### Run the full stack with Aspire

The AppHost in `apps/aspire` is the easiest way to run the main local stack together. It provisions and wires:

- PostgreSQL with a local data volume
- pgAdmin
- Redis
- Better Auth server from `apps/web/server`
- API from `apps/api`
- Web app from `apps/web`
- Marketing site from `apps/marketing`

When run through Aspire, several important environment variables are injected automatically, including:

- `AUTH_DATABASE_URL` for the auth server
- `Auth__Authority` for the API
- `VITE_API_URL` and `VITE_AUTH_URL` for the web app
- `BETTER_AUTH_URL` and `AUTH_WEB_ORIGIN` for the auth server

### Run services manually

If you are not using Aspire, start each service yourself and provide the environment variables listed below.

```bash
dotnet run --project apps/api/Api.csproj
pnpm --dir apps/web auth:dev
pnpm --dir apps/web dev
pnpm --dir apps/marketing dev
cp apps/mobile/env.example.json apps/mobile/.env.local.json
flutter run --project apps/mobile --dart-define-from-file=apps/mobile/.env.local.json
```

## Common commands

```bash
dotnet test apps/api.tests/Api.Tests.csproj
pnpm --dir apps/web build
pnpm --dir apps/marketing build
pnpm db:migration:create <MigrationName>
```

The migration helper creates EF Core migrations in `apps/api/Infrastructure/Database/Migrations`.

## Parameterize Project Name

This repository centralizes project-identifying strings so you can easily rebrand the monorepo.
Use `config/example-app.json` to set canonical values and run `scripts/set-example-app.mjs` to preview or apply textual changes across the workspace.

- Config: `config/example-app.json` — fields: `appName`, `displayName`, `npmScope`, `androidPackageRoot`, `androidUrlScheme`.
- Preview changes (dry-run):

```bash
node ./scripts/set-example-app.mjs --name my-app --display "My App" --scope my-app --android myapp --scheme myapp --dry-run
```

- Apply changes:

```bash
node ./scripts/set-example-app.mjs --name my-app --display "My App" --scope my-app --android myapp --scheme myapp --apply
# or via pnpm
pnpm run set-example-app:apply -- --name my-app --display "My App" --scope my-app --android myapp --scheme myapp
```

Notes:
- The script performs textual replacements in common source files; always review the dry-run output before applying.
- Generated or build artifacts are ignored where possible, but still review changes and revert if needed.
- After applying, run a repo search and inspect replacements before committing.

## Environment variables

This table covers the environment variables currently consumed by repo code or defined by the Aspire AppHost profile. Marketing and mobile do not currently read any repo-specific runtime environment variables.

| Variable | Consumed by | Required | Default / source | Notes |
| --- | --- | --- | --- | --- |
| `ASPNETCORE_ENVIRONMENT` | Aspire AppHost profile | Profile-defined | `Development` in `apps/aspire/aspire.config.json` | Used when launching the AppHost profile. |
| `DOTNET_ENVIRONMENT` | Aspire AppHost profile | Profile-defined | `Development` in `apps/aspire/aspire.config.json` | Used when launching the AppHost profile. |
| `ASPIRE_DASHBOARD_OTLP_ENDPOINT_URL` | Aspire AppHost profile | Profile-defined | Set per AppHost profile | Aspire dashboard OTLP endpoint. |
| `ASPIRE_RESOURCE_SERVICE_ENDPOINT_URL` | Aspire AppHost profile | Profile-defined | Set per AppHost profile | Aspire resource service endpoint. |
| `ASPIRE_ALLOW_UNSECURED_TRANSPORT` | Aspire AppHost profile | Optional | `true` in the AppHost `http` profile | Enables unsecured transport for the local HTTP profile. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | .NET services using `ServiceDefaults` | Optional | None | Enables OTLP export when set. Currently relevant to the API because it calls `AddServiceDefaults()`. |
| `Auth__Authority` | API | Recommended outside Aspire | Injected by Aspire for the API | Base URL for Better Auth used by JWT bearer validation. |
| `Auth__JwtKey` | API token service | Optional | Fallback hardcoded in code | Set explicitly outside local-only usage. |
| `Auth__Issuer` | API token service | Optional | None | JWT issuer used by `TokenService`. |
| `Auth__Audience` | API token service | Optional | None | JWT audience used by `TokenService`. |
| `Storage__R2__AccessKey` | API | Optional | None | If set, the API switches from local file storage to Cloudflare R2. |
| `Storage__R2__SecretKey` | API | Optional with R2 | None | Secret key for Cloudflare R2. |
| `Storage__R2__Endpoint` | API | Optional with R2 | None | R2 or S3-compatible endpoint URL. |
| `Storage__R2__BucketName` | API | Optional | `Example App` | Bucket name for uploaded files. |
| `PORT` | Better Auth server | Optional | Used before `AUTH_PORT` fallback | Primary bind port when the auth server is run behind a platform or Aspire endpoint mapping. |
| `AUTH_PORT` | Better Auth server | Optional | `3005` | Local auth server port when `PORT` is unset. |
| `AUTH_AUTO_MIGRATE` | Better Auth server | Optional | `true` behavior unless set to `false` | Disables automatic Better Auth migrations when set to `false`. |
| `AUTH_WEB_ORIGIN` | Better Auth server | Recommended outside Aspire | `http://localhost:4320` or Aspire-injected web URL | Comma-separated trusted origins and allowed CORS origins. |
| `BETTER_AUTH_URL` | Better Auth server and web auth client | Recommended outside Aspire | `http://localhost:4319` or Aspire-injected auth URL | Public base URL for the auth server. |
| `BETTER_AUTH_SECRET` | Better Auth server | Yes | Fallback hardcoded in code | Use a strong secret with at least 32 characters. |
| `AUTH_DATABASE_URL` | Better Auth server | Recommended outside Aspire | Injected by Aspire for auth | Primary PostgreSQL connection string for Better Auth. |
| `BETTER_AUTH_ADMIN_EMAILS` | Better Auth Studio | Optional | `admin@aebibtech.com` | Comma-separated list of emails allowed to access Better Auth Studio. |
| `BETTER_AUTH_ADMIN_PASSWORD` | Better Auth server | Optional | `password1234` | Password used when automatically seeding the initial admin user. |
| `ConnectionStrings__appdb` | Better Auth server | Optional fallback | None | Alternate .NET-style connection string fallback. |
| `DATABASE_URL` | Better Auth server | Optional fallback | None | Generic PostgreSQL connection string fallback. |
| `VITE_AUTH_URL` | Web app | Yes outside Aspire | `http://localhost:4319` fallback in code or Aspire-injected value | Base URL for auth requests from the React app. |
| `VITE_API_URL` | Web app | Yes outside Aspire | `http://localhost:5234` fallback in code or Aspire-injected value | Base URL for API requests from the React app. |

Notes:

- In .NET configuration, `Section:Nested:Key` maps to `Section__Nested__Key` in environment variables.
- Checked-in env examples live in `apps/web/.env.example` and `apps/mobile/env.example.json`.
- The API also depends on PostgreSQL and Redis, but their concrete env var names are managed by Aspire resource wiring rather than referenced directly in application code.

## Suggested first steps

1. Install dependencies with `pnpm install` and `dotnet restore solution.slnx`.
2. Decide whether you want to run locally with Aspire or manage each app manually.
3. If you are not using Aspire, copy `apps/web/.env.example` and `apps/mobile/env.example.json` to local env files and set the API, auth, and database values explicitly.

## Reference docs

- `docs/ARCHITECTURE.md`
- `apps/web/.env.example`
- `apps/mobile/env.example.json`
- `apps/aspire/apphost.cs`

## Ngrok (external URLs for webhooks & mobile auth)

Expose local services to the public with ngrok to test third-party webhooks and mobile OAuth/deep-link redirects.

 - **AppHost (recommended)**: The Aspire AppHost includes ngrok support in [apps/aspire/apphost.cs](apps/aspire/apphost.cs). Provide your ngrok auth token when starting the AppHost:

```bash
dotnet run --project apps/aspire -- --ngrok-auth-token "<YOUR_NGROK_TOKEN>"
```

When enabled the AppHost will create tunnels for `api`, `auth`, and `web` and will print the public ngrok URLs in the logs/dashboard. Use those public URLs when registering webhooks or adding allowed redirect/origin entries in Better Auth.

 - **Manual ngrok**: If you run services manually, start ngrok and forward the service ports you need:

```bash
# Example: expose API (port 5000) and Auth (port 3005)
ngrok http 5000 --region=us
ngrok http 3005 --region=us
```

 - **Webhooks**: Register the webhook target using the ngrok URL (e.g. `https://<xxx>.ngrok.app/api/webhooks/...`). Remember free ngrok domains rotate each session — update the webhook when the domain changes or use a reserved domain on a paid plan.

 - **Mobile OAuth / Deep links**: Add both the public auth URL and your mobile app scheme (e.g. `myapp://auth`) to the auth server's allowed origins/redirects. The AppHost already helps compose `AUTH_WEB_ORIGIN` to include mobile schemes when you configure the `mobile-app-url-scheme` parameter.

 - **Security**: Never commit your ngrok auth token. Prefer passing it to AppHost via the `--ngrok-auth-token` parameter or other secret mechanisms (Aspire parameter, CI secrets, env vars).

