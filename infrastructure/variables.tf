variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

variable "vercel_api_token" {
  type      = string
  sensitive = true
}

variable "vercel_team_id" {
  type    = string
  default = null
}

variable "neon_api_key" {
  type      = string
  sensitive = true
}

variable "upstash_email" {
  type = string
}

variable "upstash_api_key" {
  type      = string
  sensitive = true
}

variable "app_name" {
  type    = string
  default = "example-app"
}

variable "better_auth_secret" {
  type      = string
  sensitive = true
}

variable "better_auth_admin_emails" {
  type    = string
  default = "admin@example.com"
}

variable "better_auth_admin_password" {
  type      = string
  sensitive = true
  default   = "password1234"
}
