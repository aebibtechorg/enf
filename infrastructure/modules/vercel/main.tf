terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
    }
  }
}

resource "vercel_project" "this" {
  name      = var.project_name
  framework = var.framework
  root_directory = var.root_directory

  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

resource "vercel_project_environment_variable" "this" {
  for_each   = var.env_vars
  project_id = vercel_project.this.id
  key        = each.key
  value      = each.value
  target     = ["production", "preview", "development"]
}

output "project_url" {
  value = vercel_project.this.url
}
