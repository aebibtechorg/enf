# Example App Architecture

## Overview
Example App is a pragmatic, AI-native platform blueprint for modern engineering teams. It leverages .NET 10, React, Astro, and Flutter to provide a high-performance, type-safe development environment.

## Key Layers
- **Backend:** ASP.NET Core 10 Minimal APIs. Modular monolith approach with feature-first organization.
- **Frontend:** React + TanStack Start. File-based routing and type-safe data fetching.
- **Marketing:** Astro for high-performance static content with React interactivity where needed.
- **Mobile:** Flutter with Riverpod for robust cross-platform mobile experiences.
- **Orchestration:** .NET Aspire for seamless local development and service discovery.

## Foundational Concepts
- **Feature-First:** Logic is organized by feature, not by layer (e.g., `Features/Users/` contains everything related to users).
- **Calm UI:** Design philosophy focused on productivity, low visual noise, and operational clarity.
- **Type-Safe Contracts:** Shared DTOs between backend and frontend via the `Contracts` project.
- **Offline-Ready:** Mobile layer includes foundations for local caching and synchronization.
