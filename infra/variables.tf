variable "aws_region" {
  description = "Región de AWS Academy"
  default     = "us-east-1"
}

variable "project_name" {
  default = "vet-system"
}

variable "key_name" {
  description = "Nombre de la llave SSH en AWS"
  default     = "vockey" 
}

# Credenciales (Se llenan en los archivos .tfvars)
variable "aws_access_key" {}
variable "aws_secret_key" {}
variable "aws_session_token" {}

# Bases de Datos
variable "db_username" {
  default = "postgres"
}

variable "db_password" {
  description = "Contraseña de la DB"
  sensitive   = true
}