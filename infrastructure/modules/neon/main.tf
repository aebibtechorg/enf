terraform {
  required_providers {
    neon = {
      source = "neondatabase/neon"
    }
  }
}

resource "neon_project" "this" {
  name      = var.app_name
  region_id = var.region_id
}

resource "neon_database" "this" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = "appdb"
}

resource "neon_role" "this" {
  project_id = neon_project.this.id
  branch_id  = neon_project.this.default_branch_id
  name       = "appuser"
}

output "database_url" {
  value     = "postgres://${neon_role.this.name}:${neon_role.this.password}@${neon_project.this.database_host}/${neon_database.this.name}"
  sensitive = true
}
