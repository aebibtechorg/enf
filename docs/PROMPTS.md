# Feature Generation Prompt

Use this prompt with your AI assistant to generate new features for the Example App.

Note: If you are rebranding or changing the project name, update `config/example-app.json` and run `node ./scripts/set-example-app.mjs` (use `--dry-run` first) to apply the new name across the repository before generating feature scaffolding.

---

Generate a new feature for the Example App following these conventions:

**Feature Name:** [FeatureName]

**Requirements:**
- Implement backend entities and endpoints in `apps/api/Features/[FeatureName]/`.
- Use direct EF Core access in endpoints.
- When backend entities change, create an EF migration with `pnpm db:migration:create [MigrationName]`.
- Support shared search and pagination conventions using `ToPaginatedResponseAsync`.
- Implement frontend UI and logic in `apps/web/src/features/[feature-name]/`.
- Use TanStack Query for data fetching and the `usePaginatedQuery` hook.
- Use shared UI components from `@Example App/ui`.
- Implement mobile models and providers in `apps/mobile/lib/features/[feature_name]/`.

**Backend Pattern:**
- Extension method for mapping endpoints.
- Record types for DTOs in `packages/contracts/`.

**Frontend Pattern:**
- Components for list and detail views.
- Custom hook for API interaction.
---
