module "neon" {
  source = "./modules/neon"

  app_name = var.app_name
}

module "upstash" {
  source = "./modules/upstash"

  app_name = var.app_name
}

module "api" {
  source = "./modules/gcp_cloud_run"

  service_name = "${var.app_name}-api"
  project_id   = var.gcp_project_id
  region       = var.gcp_region
  image        = "gcr.io/${var.gcp_project_id}/${var.app_name}-api:latest"
  
  env_vars = {
    "ConnectionStrings__appdb" = module.neon.database_url
    "Redis__ConnectionString"  = module.upstash.redis_url
    "Auth__Authority"          = "https://${module.auth.service_url}"
  }
}

module "auth" {
  source = "./modules/gcp_cloud_run"

  service_name = "${var.app_name}-auth"
  project_id   = var.gcp_project_id
  region       = var.gcp_region
  image        = "gcr.io/${var.gcp_project_id}/${var.app_name}-auth:latest"
  port         = 3005

  env_vars = {
    "DATABASE_URL"                = module.neon.database_url
    "BETTER_AUTH_URL"             = "https://${module.auth.service_url}"
    "AUTH_WEB_ORIGIN"             = "https://${module.web.project_url}"
    "BETTER_AUTH_SECRET"          = var.better_auth_secret
    "BETTER_AUTH_ADMIN_EMAILS"    = var.better_auth_admin_emails
    "BETTER_AUTH_ADMIN_PASSWORD"  = var.better_auth_admin_password
  }
}

module "web" {
  source = "./modules/vercel"

  project_name = "${var.app_name}-web"
  framework    = "vite"
  root_directory = "apps/web"

  env_vars = {
    "VITE_API_URL"  = "https://${module.api.service_url}"
    "VITE_AUTH_URL" = "https://${module.auth.service_url}"
  }
}

module "marketing" {
  source = "./modules/vercel"

  project_name = "${var.app_name}-marketing"
  framework    = "astro"
  root_directory = "apps/marketing"
}
