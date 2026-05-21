variable "service_name" {
  type = string
}

variable "region" {
  type = string
}

variable "project_id" {
  type = string
}

variable "image" {
  type = string
}

variable "port" {
  type    = number
  default = 8080
}

variable "env_vars" {
  type    = map(string)
  default = {}
}
