# 1. Load Balancer (Entrada Internet)
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
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

# 2. Bastion / Jumpbox (Entrada Admin)
resource "aws_security_group" "bastion_sg" {
  name        = "${var.project_name}-bastion-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH"
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

# 3. Nodos ECS (Donde viven tus apps)
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-node-sg"
  vpc_id      = aws_vpc.main.id

  # Tráfico desde el Balanceador
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
  
  # SSH desde Bastion
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

# 4. Bases de Datos
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432 # Postgres
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id, aws_security_group.bastion_sg.id]
  }

  ingress {
    from_port       = 6379 # Redis
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_sg.id]
  }
}