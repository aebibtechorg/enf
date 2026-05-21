variable "project_name" {
  type = string
}

variable "framework" {
  type = string
}

variable "root_directory" {
  type    = string
  default = null
}

variable "github_repo" {
  type    = string
  default = null
}

variable "env_vars" {
  type    = map(string)
  default = {}
}
