resource "aws_ecr_repository" "microservices" {
  for_each             = toset([
    "identity-service", "patient-service", "medical-service", 
    "iot-service", "appointment-service", "billing-service", 
    "inventory-service", "notification-service", "staff-service", 
    "audit-service", "api-gateway"
  ])
  name                 = "vet-${each.key}"
  force_delete         = true
  image_tag_mutability = "MUTABLE"
}