variable "aws_region" {
  description = "Región de AWS"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto (ej: vet-system-qa)"
}

variable "key_name" {
  description = "Nombre del par de claves SSH (vockey)"
  default     = "vockey"
}

variable "docker_username" {
  description = "eleinn69"
}

variable "db_username" {
  default = "postgres"
}

variable "db_password" {
  sensitive = true
}

# Credenciales (se inyectan desde el archivo .tfvars)
variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_session_token" {}