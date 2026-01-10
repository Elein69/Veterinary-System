# 1. Security Group para JumpBox (SSH + InfluxDB)
resource "aws_security_group" "bastion_sg" {
  name        = "${var.project_name}-jumpbox-sg"
  description = "SSH y Acceso Interno a InfluxDB"
  vpc_id      = aws_vpc.main.id

  # SSH desde cualquier lado (Admin)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # InfluxDB (8086) - Solo accesible desde DENTRO de la VPC
  ingress {
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

# 2. Security Group para Load Balancer
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
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

# 3. Security Group para Bases de Datos (Postgres + Redis)
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-db-sg"
  vpc_id      = aws_vpc.main.id

  # Postgres (5432) desde Apps/JumpBox
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # Redis (6379) desde Apps/JumpBox
  ingress {
    from_port       = 6379
    to_port         = 6379
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