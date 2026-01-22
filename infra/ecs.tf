# infra/ecs.tf

# ==========================================
# 1. CONFIGURACIÓN DEL CLUSTER
# ==========================================
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
}

# Capacity Provider
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

# Logs en CloudWatch
resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 1
}

# ==========================================
# 2. DEFINICIÓN DE MICROSERVICIOS
# ==========================================
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

# Task Definition Genérica
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
      { name = "PORT", value = tostring(each.value) },
      { name = "NODE_ENV", value = "qa" },
      
      # --- BASE DE DATOS ---
      { name = "DB_HOST", value = aws_db_instance.postgres_db.address },
      { name = "DB_PORT", value = "5432" },
      { name = "DB_USERNAME", value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "DB_NAME", value = "postgres" },
      
      # --- REDIS ---
      { name = "REDIS_HOST", value = aws_elasticache_cluster.redis.cache_nodes[0].address },
      { name = "REDIS_PORT", value = "6379" },

      # --- MENSAJERÍA (Bastion) ---
      { 
        name  = "RABBITMQ_HOST" 
        value = "amqp://${var.db_username}:${var.db_password}@${aws_instance.jumpbox.private_ip}:5672" 
      },
      { 
        name  = "KAFKA_BROKER" 
        value = "${aws_instance.jumpbox.private_ip}:9092" 
      },
      { 
        name  = "MQTT_HOST" 
        value = aws_instance.jumpbox.private_ip 
      },

      # --- INFLUXDB ---
      { name = "INFLUXDB_URL", value = "http://${aws_instance.jumpbox.private_ip}:8086" },
      { name = "INFLUXDB_ORG", value = "vet_org" },
      { name = "INFLUXDB_BUCKET", value = "vet_bucket" },
      { name = "INFLUXDB_TOKEN", value = var.influxdb_token }
    ]
  }])
}

# Servicio ECS para Microservicios
resource "aws_ecs_service" "microservices" {
  for_each        = local.microservices_map
  name            = each.key
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.microservices[each.key].arn
  desired_count   = 1
  launch_type     = "EC2"

  network_configuration {
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.microservices[each.key].arn
    container_name   = each.key
    container_port   = each.value
  }
  
  depends_on = [
    aws_lb_listener_rule.microservices_rules,
    aws_lb_listener.front_end
  ]
}

# ==========================================
# 3. API GATEWAY (Configuración Especial)
# ==========================================
# infra/ecs.tf (Solo la parte del Task Definition del Gateway)

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
      { name = "PORT", value = "3000" },
      { name = "NODE_ENV", value = "qa" },
      
      # Base de Datos y Redis
      { name = "DB_HOST", value = aws_db_instance.postgres_db.address },
      { name = "DB_PORT", value = "5432" },
      { name = "DB_USERNAME", value = var.db_username },
      { name = "DB_PASSWORD", value = var.db_password },
      { name = "REDIS_HOST", value = aws_elasticache_cluster.redis.cache_nodes[0].address },
      { name = "REDIS_PORT", value = "6379" },

      # 🚨 BLINDAJE TOTAL: Definimos TODO apuntando al ALB 🚨
      
      # 1. La Variable Maestra (Para tu lógica isAws)
      { name = "AWS_ALB_URL", value = "http://${aws_lb.app_lb.dns_name}" },

      # 2. Las Variables Individuales (Fallback de seguridad)
      # Si isAws falla, estas variables salvarán el día.
      { name = "STAFF_SERVICE_URL",       value = "http://${aws_lb.app_lb.dns_name}/staff" },
      { name = "PATIENT_SERVICE_URL",     value = "http://${aws_lb.app_lb.dns_name}/patient" },
      { name = "MEDICAL_SERVICE_URL",     value = "http://${aws_lb.app_lb.dns_name}/medical" },
      { name = "APPOINTMENT_SERVICE_URL", value = "http://${aws_lb.app_lb.dns_name}/appointment" },
      { name = "INVENTORY_SERVICE_URL",   value = "http://${aws_lb.app_lb.dns_name}/inventory" },
      { name = "BILLING_SERVICE_URL",     value = "http://${aws_lb.app_lb.dns_name}/billing" },
      { name = "NOTIFICATION_SERVICE_URL",value = "http://${aws_lb.app_lb.dns_name}/notification" },
      { name = "IOT_SERVICE_URL",         value = "http://${aws_lb.app_lb.dns_name}/iot" },
      { name = "IDENTITY_SERVICE_URL",    value = "http://${aws_lb.app_lb.dns_name}/identity" },
      { name = "AUDIT_SERVICE_URL",       value = "http://${aws_lb.app_lb.dns_name}/audit" }
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
    subnets          = [aws_subnet.private_1.id, aws_subnet.private_2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.gateway_tg.arn
    container_name   = "api-gateway"
    container_port   = 3000
  }
  
  depends_on = [
    aws_lb_listener_rule.gateway_rule,
    aws_lb_listener.front_end
  ]
}