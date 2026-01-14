# 1. Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# 2. Capacity Provider
resource "aws_ecs_capacity_provider" "ec2_provider" {
  name = "${var.project_name}-cp"
  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.app_asg.arn
    managed_scaling {
      status = "ENABLED"
      target_capacity = 90
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ec2_provider.name]
}

# 3. DNS Interno (.local)
resource "aws_service_discovery_private_dns_namespace" "internal" {
  name        = "local"
  description = "DNS Interno Microservicios"
  vpc         = aws_vpc.main.id
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name = "/ecs/${var.project_name}"
  retention_in_days = 1
}

# --- LISTA DE LOS 10 MICROSERVICIOS INTERNOS ---
locals {
  services = {
    "identity-service"     = 3001
    "patient-service"      = 3002
    "medical-service"      = 3003
    "iot-service"          = 3004
    "appointment-service"  = 3005
    "billing-service"      = 3006
    "inventory-service"    = 3007
    "notification-service" = 3008
    "staff-service"        = 3009
    "audit-service"        = 3010
  }
}

resource "aws_service_discovery_service" "microservices" {
  for_each = local.services
  name     = each.key
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      ttl  = 10
      type = "A"
    }
  }
}

resource "aws_ecs_task_definition" "microservices" {
  for_each              = local.services
  family                = each.key
  network_mode          = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                   = 256
  memory                = 256
  execution_role_arn    = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = each.key
    image     = "docker.io/${var.docker_username}/${each.key}:qa"
    cpu       = 256
    memory    = 256
    essential = true
    portMappings = [{ containerPort = each.value }]
    logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = each.key
        }
    }
    environment = [
       { name = "PORT", value = tostring(each.value) }
    ]
  }])
}

resource "aws_ecs_service" "microservices" {
  for_each        = local.services
  name            = each.key
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.microservices[each.key].arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.microservices[each.key].arn
  }
}

# --- API GATEWAY (Público) ---
resource "aws_ecs_task_definition" "api_gateway" {
  family                = "api-gateway"
  network_mode          = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                   = 256
  memory                = 256
  execution_role_arn    = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "api-gateway"
    image     = "docker.io/${var.docker_username}/api-gateway:qa"
    cpu       = 256
    memory    = 256
    essential = true
    portMappings = [{ containerPort = 3000 }]
    logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_logs.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "api-gateway"
        }
    }
    environment = [
      { name = "PORT", value = "3000" },
      { name = "PATIENT_SERVICE_URL", value = "http://patient-service.local:3002" },
      { name = "STAFF_SERVICE_URL", value = "http://staff-service.local:3009" },
      { name = "IDENTITY_SERVICE_URL", value = "http://identity-service.local:3001" },
      { name = "MEDICAL_SERVICE_URL", value = "http://medical-service.local:3003" },
      { name = "IOT_SERVICE_URL", value = "http://iot-service.local:3004" },
      { name = "APPOINTMENT_SERVICE_URL", value = "http://appointment-service.local:3005" },
      { name = "BILLING_SERVICE_URL", value = "http://billing-service.local:3006" },
      { name = "INVENTORY_SERVICE_URL", value = "http://inventory-service.local:3007" },
      { name = "NOTIFICATION_SERVICE_URL", value = "http://notification-service.local:3008" },
      { name = "AUDIT_SERVICE_URL", value = "http://audit-service.local:3010" }
    ]
  }])
}

resource "aws_ecs_service" "api_gateway" {
  name            = "api-gateway"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_gateway.arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app_tg.arn
    container_name   = "api-gateway"
    container_port   = 3000
  }
}