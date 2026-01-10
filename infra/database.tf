# GRUPOS DE SUBREDES
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.project_name}-rds-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.project_name}-redis-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

# 1. POSTGRESQL (RDS)
resource "aws_db_instance" "postgres_db" {
  identifier             = "vet-postgres-db"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true
}

# 2. REDIS (ElastiCache) - ¡NUEVO!
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "vet-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids   = [aws_security_group.db_sg.id]
}

# 3. DYNAMODB
resource "aws_dynamodb_table" "patients_table" {
  name           = "Patients"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "medical_records_table" {
  name           = "MedicalRecords"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "recordId"
  attribute {
    name = "recordId"
    type = "S"
  }
}