# Deployment & Infrastructure

This document outlines the IaC (Infrastructure as Code) and CI/CD setup for the Example App.

## Infrastructure Stack

- **API & Auth Server:** Google Cloud Run (Containerized)
- **Database:** Neon PostgreSQL (Serverless)
- **Cache:** Upstash Redis (Serverless)
- **Web & Marketing:** Vercel
- **IaC Tool:** Terraform

## Terraform Structure

The infrastructure is defined in the `infrastructure/` directory using a modular approach:

- `modules/gcp_cloud_run`: Manages Google Cloud Run services.
- `modules/vercel`: Manages Vercel projects and environment variables.
- `modules/neon`: Provisions Neon PostgreSQL projects and databases.
- `modules/upstash`: Provisions Upstash Redis instances.

### Environment Variables & Secrets

Terraform automatically links services by passing output variables from one module as environment variables to another (e.g., passing the Neon database URL to the Cloud Run API).

## CI/CD Pipeline

Automated deployment is handled via GitHub Actions in `.github/workflows/deploy.yml`.

### Workflow Steps

1. **Build & Push:** Docker images for `apps/api` and the auth server in `apps/web` are built and pushed to Google Container Registry (GCR).
2. **Terraform Apply:** Terraform initializes and applies the configuration, ensuring all cloud resources are updated with the latest images and environment variables.

## Setup Requirements

### 1. External Accounts
You need active accounts and API keys for:
- Google Cloud Platform (Project with Cloud Run and Artifact Registry enabled)
- Vercel (Team and Personal API Token)
- Neon (API Key)
- Upstash (Email and API Key)

### 2. GitHub Secrets
The following secrets must be configured in your GitHub repository:

| Secret | Description |
| --- | --- |
| `GCP_PROJECT_ID` | Your Google Cloud Project ID |
| `GCP_SA_KEY` | JSON Key for a GCP Service Account with Editor/Cloud Run Admin permissions |
| `VERCEL_API_TOKEN` | Vercel Personal Access Token |
| `VERCEL_TEAM_ID` | Vercel Team ID (if applicable) |
| `NEON_API_KEY` | Neon API Key |
| `UPSTASH_EMAIL` | Upstash Account Email |
| `UPSTASH_API_KEY` | Upstash API Key |
| `BETTER_AUTH_SECRET` | A random 32+ character string for auth signing |

## Local Terraform Usage

To run Terraform locally, ensure you have the variables defined in a `terraform.tfvars` file (do not commit this file) or passed via environment variables prefixed with `TF_VAR_`.

```bash
cd infrastructure
terraform init
terraform apply
```
