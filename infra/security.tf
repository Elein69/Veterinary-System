# security.tf

# 1. Load Balancer (Entrada Internet)
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  description = "Security Group para el Balanceador de Carga"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP desde el mundo"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Bastion / Jumpbox (DEFINICIÓN BASE)
# Quitamos las reglas que dependen de ECS para romper el ciclo
resource "aws_security_group" "bastion_sg" {
  name        = "${var.project_name}-bastion-sg"
  description = "Security Group para el Servidor Bastion y Brokers"
  vpc_id      = aws_vpc.main.id

  # Reglas que NO dependen de otros grupos (SSH externo e InfluxDB interno por IP)
  ingress {
    description = "SSH Admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "InfluxDB Interno"
    from_port   = 8086
    to_port     = 8086
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Nodos ECS (DEFINICIÓN BASE)
# Quitamos las reglas que dependen de Bastion para romper el ciclo
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-node-sg"
  description = "Security Group para los microservicios"
  vpc_id      = aws_vpc.main.id

  # Tráfico desde el Balanceador (ALB) - Esto no crea ciclo
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Tráfico Interno (Microservicio A -> Microservicio B)
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Base de Datos (RDS/Redis)
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  vpc_id      = aws_vpc.main.id

  # Regla Postgres
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id, aws_security_group.bastion_sg.id]
  }

  # Regla Redis
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }
}

# ==========================================================
# REGLAS EXTERNAS (PARA ROMPER EL CICLO)
# Aquí definimos las reglas "conflictivas" después de crear los grupos
# ==========================================================

# A. Permitir que ECS entre al Bastion (Para Kafka, RabbitMQ, MQTT)
resource "aws_security_group_rule" "allow_ecs_to_brokers" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs_sg.id
  security_group_id        = aws_security_group.bastion_sg.id
  description              = "Permitir ECS acceder a Brokers en Bastion"
}

# B. Permitir que Bastion entre a ECS (SSH para debug)
resource "aws_security_group_rule" "allow_bastion_ssh_to_ecs" {
  type                     = "ingress"
  from_port                = 22
  to_port                  = 22
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.bastion_sg.id
  security_group_id        = aws_security_group.ecs_sg.id
  description              = "Permitir SSH desde Bastion a ECS"
}