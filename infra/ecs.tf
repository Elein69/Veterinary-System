# ecs.tf

# 1. Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# 2. Capacity Provider (EC2)
resource "aws_ecs_capacity_provider" "ec2_provider" {
  name = "${var.project_name}-cp"
  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.app_asg.arn
    managed_scaling {
      status          = "ENABLED"
      target_capacity = 90
    }
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = [aws_ecs_capacity_provider.ec2_provider.name]
}

# --- LOGS ---
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 1
}

# --- LISTA DE MICROSERVICIOS (Sin incluir el Gateway aquí para manejo especial) ---
locals {
  microservices_map = {
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

# --- TASK DEFINITIONS PARA MICROSERVICIOS ---
resource "aws_ecs_task_definition" "microservices" {
  for_each                 = local.microservices_map
  family                   = each.key
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = 256
  memory                   = 256
  
  execution_role_arn = data.aws_iam_role.lab_role.arn
  task_role_arn      = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name      = each.key
    # CAMBIO: Ahora usa la URL del ECR que creamos
    image     = "${aws_ecr_repository.microservices[each.key].repository_url}:qa"
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

# --- SERVICIOS ECS ---
resource "aws_ecs_service" "microservices" {
  for_each        = local.microservices_map
  name            = each.key
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.microservices[each.key].arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets         = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups = [aws_security_group.ecs_sg.id]
  }
}

# --- API GATEWAY (Manejo por separado para conectar al ALB) ---
resource "aws_ecs_task_definition" "api_gateway" {
  family                   = "api-gateway"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = 256
  memory                   = 256
  
  execution_role_arn = data.aws_iam_role.lab_role.arn
  task_role_arn      = data.aws_iam_role.lab_role.arn

  container_definitions = jsonencode([{
    name      = "api-gateway"
    # CAMBIO: Usa el ECR del gateway
    image     = "${aws_ecr_repository.microservices["api-gateway"].repository_url}:qa"
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
      { name = "PORT", value = "3000" }
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
    # Cambié app_tg por gateway_tg para que coincida con el nuevo alb.tf
    target_group_arn = aws_lb_target_group.gateway_tg.arn
    container_name   = "api-gateway"
    container_port   = 3000
  }
}