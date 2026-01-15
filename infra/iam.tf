# iam.tf
# En AWS Academy NO podemos crear roles, debemos usar el "LabRole" existente.

data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "aws_iam_instance_profile" "lab_profile" {
  name = "LabInstanceProfile"
}