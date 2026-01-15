resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.project_name}-rds-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "${var.project_name}-redis-group"
  subnet_ids = [aws_subnet.private_1.id, aws_subnet.private_2.id]
}

# database.tf

resource "aws_db_instance" "postgres_db" {
  identifier             = "vet-postgres-db"
  engine                 = "postgres"
  engine_version         = "13.18"          # <--- Versión exacta de tu lista
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  publicly_accessible    = false
  skip_final_snapshot    = true

  # El parameter group debe coincidir con la versión mayor (13)
  parameter_group_name   = "default.postgres13" 
}

# 2. Redis
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

# 3. DynamoDB
resource "aws_dynamodb_table" "patients_table" {
  name         = "Patients"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  attribute {
    name = "id"
    type = "S"
  }
}