terraform {
  required_providers {
    upstash = {
      source = "upstash/upstash"
    }
  }
}

resource "upstash_redis_database" "this" {
  database_name = var.app_name
  region        = var.region
  tls           = true
}

output "redis_url" {
  value     = "rediss://:${upstash_redis_database.this.password}@${upstash_redis_database.this.endpoint}:${upstash_redis_database.this.port}"
  sensitive = true
}
