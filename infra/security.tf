# infra/security.tf

# ==========================================
# 1. LOAD BALANCER (Puerta al Internet)
# ==========================================
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

# ==========================================
# 2. BASTION / JUMPBOX / BROKERS (La solución al error)
# ==========================================
resource "aws_security_group" "bastion_sg" {
  name        = "${var.project_name}-bastion-sg"
  description = "Security Group para el Servidor Bastion y Brokers"
  vpc_id      = aws_vpc.main.id

  # A. SSH EXTERNO (Para que tú entres a revisar)
  ingress {
    description = "SSH Admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # B. REGLA MAESTRA INTERNA (Solución al ETIMEDOUT)
  # Permitimos TODO el tráfico TCP desde dentro de la VPC (10.0.x.x)
  # Así entran RabbitMQ (5672), Kafka (9092), MQTT (1883) e InfluxDB (8086) sin problemas.
  ingress {
    description = "Todo el trafico interno desde la VPC"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # <--- ESTO ES LO QUE ARREGLA TODO
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 3. NODOS ECS (Microservicios)
# ==========================================
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-node-sg"
  description = "Security Group para los microservicios"
  vpc_id      = aws_vpc.main.id

  # Tráfico desde el Balanceador (ALB)
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
  
  # Permitir SSH desde el Bastion (opcional, para debug)
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================
# 4. BASE DE DATOS (RDS/Redis)
# ==========================================
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  vpc_id      = aws_vpc.main.id

  # Regla Postgres (Permite ECS y Bastion)
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

# NOTA: HE BORRADO LAS "REGLAS EXTERNAS" DEL FINAL PORQUE YA NO SON NECESARIAS
# AL USAR "cidr_blocks = 10.0.0.0/16" EN EL BASTION.