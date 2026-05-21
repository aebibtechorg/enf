# Example App — Project Guidelines

## Philosophy
- Simplicity, operational clarity, developer ergonomics.
- Generic naming: `Api`, `Web`, `Mobile`, `AppHost`, etc.
- Modular monolith with feature-first organization.

## Prerequisites
- Node.js (v22+), pnpm (v11+).
- npm-run-all (workspace-wide dev dependency for `run-s`).
- .NET 10 SDK.
- Flutter SDK (v3.41+).

## Architecture
- **Backend:** ASP.NET Core 10 Minimal APIs.
- **Frontend:** React + TanStack Start.
- **Mobile:** Flutter.
- **Orchestration:** .NET Aspire.

## Monorepo Structure
- `apps/`: Main applications (api, web, mobile, marketing, aspire).
- `packages/`: Shared logic and components (contracts, ui, config, flutter_shared).
- `infrastructure/`: Terraform modules and environment configs.

## Conventions
- **Naming:** Generic project names. Features organized in `Features/` folder.
- **Backend:** 
    - Use direct EF Core access, avoid over-abstraction.
    - Feature-First structure: `Features/{FeatureName}/` contains entities, endpoints, and logic.
    - Map endpoints via extension methods in `Features/FeatureExtensions.cs`.
    - Infrastructure foundation in `Infrastructure/` (Database, Storage, etc.).
- **Frontend:** 
    - React + TanStack Router (file-based) + TanStack Query.
    - Feature-First structure: `src/features/{FeatureName}/` contains components, hooks, and api logic.
    - Calm UI design with Tailwind CSS v4.
    - Shared API utility in `src/lib/api.ts` using `VITE_API_URL`.
- **Marketing:**
    - Astro with React integration for interactive components.
    - Performance-first: Static content by default, opt-in interactivity (`client:*`).
    - Tailwind CSS v4 via Vite plugin.
- **Mobile:**
    - Flutter with Riverpod (state) and GoRouter (navigation).
    - Feature-First structure: `lib/features/{FeatureName}/` contains models, providers, and ui.
    - Operational UX: High information density, efficiency-focused.
    - Dio-based API client in `lib/core/api/`.
- **Aspire:** foundational for local orchestration and service discovery.

## Development Workflow
- Start the entire stack using `aspire run` in `apps/aspire`.
- Frontend uses `pnpm` workspace.
- Backend uses `.slnx` solution.

## Deployment & IaC
- **Infrastructure:** Google Cloud Run (API/Auth), Vercel (Web/Marketing), Neon (Postgres), Upstash (Redis).
- **Automation:** GitHub Actions + Terraform.
- **Reference:** See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup and secrets.
